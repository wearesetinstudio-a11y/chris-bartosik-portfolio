import { useEffect, useRef } from 'react';

const BRAND_ORANGE = '#F54100';
const DEFAULT_SRC = '/chris-portrait-dither.png';

/** 8×8 Bayer matrix (0–63) — rebuilds face detail when squares get larger. */
const BAYER_8 = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
] as const;

/** Hover clear radius as a fraction of portrait size (hero-like hole). */
const HOVER_RADIUS_RATIO = 0.14;
const HOVER_RADIUS_MIN = 56;
const HOVER_RADIUS_MAX = 120;
/** How long the hole eases closed after pointer leave (ms). */
const HOVER_RELEASE_MS = 900;
/** Idle glitch phase step (ms). Scroll speeds this up. */
const GLITCH_PHASE_IDLE = 110;
const GLITCH_PHASE_FAST = 28;
const GLITCH_PHASE2_IDLE = 190;
const GLITCH_PHASE2_FAST = 48;

type PixelPortraitProps = {
	src?: string;
	/** Grid cells across (higher = smaller squares). */
	gridSize?: number;
	className?: string;
	'aria-label'?: string;
};

type Cell = {
	x: number;
	y: number;
	alpha: number;
	soft: number;
};

function parseHex(hex: string) {
	const h = hex.replace('#', '');
	return {
		r: Number.parseInt(h.slice(0, 2), 16),
		g: Number.parseInt(h.slice(2, 4), 16),
		b: Number.parseInt(h.slice(4, 6), 16),
	};
}

/**
 * Re-grids a pre-dithered orange-on-black portrait onto transparent canvas
 * squares. Hover clears under the cursor; scrolling speeds up the glitch flicker.
 */
export default function PixelPortrait({
	src = DEFAULT_SRC,
	gridSize = 110,
	className = '',
	'aria-label': ariaLabel = 'Pixel portrait of Chris Bartosik',
}: PixelPortraitProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;

		const orange = parseHex(BRAND_ORANGE);
		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let cancelled = false;
		let raf = 0;
		let cssSize = 0;
		let cell = 0;
		let block = 0;
		let baseCells: Cell[] = [];
		let ghostCells: Cell[] = [];
		let built = false;

		let pointerX = -9999;
		let pointerY = -9999;
		/** Smoothed follow so the hole eases instead of snapping. */
		let smoothX = -9999;
		let smoothY = -9999;
		let pointerActive = false;
		/** 1 = full hole, 0 = closed. Eases down on leave. */
		let clearStrength = 0;
		let releaseStart = 0;
		let releasing = false;

		/** 0..1 — how hard we're scrolling (drives faster flicker). */
		let scrollBoost = 0;
		let lastScrollY = window.scrollY || 0;
		let lastScrollT = performance.now();

		const img = new Image();
		img.decoding = 'async';
		img.src = src;

		function hoverRadius() {
			const base = Math.min(
				HOVER_RADIUS_MAX,
				Math.max(HOVER_RADIUS_MIN, cssSize * HOVER_RADIUS_RATIO),
			);
			if (!releasing) return base * Math.max(clearStrength, pointerActive ? 1 : 0);
			const t = Math.max(0, Math.min(1, clearStrength));
			const eased = 1 - Math.pow(1 - t, 2.2);
			return base * eased;
		}

		function onScroll() {
			if (reduceMotion.matches) {
				scrollBoost = 0;
				return;
			}
			const now = performance.now();
			const y = window.scrollY || 0;
			const dt = Math.max(8, now - lastScrollT);
			const speed = Math.abs(y - lastScrollY) / dt; // px per ms
			lastScrollY = y;
			lastScrollT = now;
			// Light scroll already ramps boost; hard scroll hits 1 fast.
			const burst = Math.min(1, speed / 0.55);
			scrollBoost = Math.max(scrollBoost, burst);
		}

		function buildCells() {
			if (cancelled || !canvas || !wrap || !img.complete || img.naturalWidth === 0) return false;

			const nextSize = Math.min(wrap.clientWidth, wrap.clientHeight || wrap.clientWidth);
			if (nextSize < 2) return false;

			cssSize = nextSize;
			const cols = gridSize;
			const rows = gridSize;
			const gapRatio = 0.16;
			cell = cssSize / cols;
			block = Math.max(0.7, cell * (1 - gapRatio));

			const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
			canvas.width = Math.round(cssSize * dpr);
			canvas.height = Math.round(cssSize * dpr);
			canvas.style.width = `${cssSize}px`;
			canvas.style.height = `${cssSize}px`;

			const full = document.createElement('canvas');
			full.width = img.naturalWidth;
			full.height = img.naturalHeight;
			const fctx = full.getContext('2d', { willReadFrequently: true });
			if (!fctx) return false;
			fctx.drawImage(img, 0, 0);
			const { data, width: fw, height: fh } = fctx.getImageData(0, 0, full.width, full.height);

			const nextBase: Cell[] = [];
			const nextGhost: Cell[] = [];

			for (let y = 0; y < rows; y += 1) {
				const y0 = Math.floor((y * fh) / rows);
				const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * fh) / rows));
				for (let x = 0; x < cols; x += 1) {
					const x0 = Math.floor((x * fw) / cols);
					const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * fw) / cols));

					let orangeSum = 0;
					let samples = 0;

					for (let py = y0; py < y1; py += 1) {
						for (let px = x0; px < x1; px += 1) {
							const i = (py * fw + px) * 4;
							const r = data[i];
							const g = data[i + 1];
							const b = data[i + 2];
							samples += 1;
							const warmth = r - (g + b) * 0.35;
							if (r > 28 && warmth > 12) {
								orangeSum += r / 255;
							}
						}
					}

					if (samples === 0) continue;

					const cover = orangeSum / samples;
					if (cover < 0.04) continue;

					const density =
						cover < 0.45
							? Math.min(0.55, cover * 1.15)
							: 0.4 + (cover - 0.45) * 0.55;
					const capped = Math.min(0.7, density);
					const threshold = (BAYER_8[y % 8][x % 8] + 0.5) / 64;
					const soft = Math.max(0, 1 - Math.abs(capped - threshold) * 3.5);
					const alpha = capped > 0.62 ? 1 : 0.4 + capped * 0.75;

					if (capped >= threshold) {
						nextBase.push({ x, y, alpha, soft });
					} else if (capped > threshold * 0.65 && soft > 0.2) {
						nextGhost.push({ x, y, alpha: alpha * 0.7, soft: 1 });
					}
				}
			}

			baseCells = nextBase;
			ghostCells = nextGhost;
			built = true;
			return true;
		}

		function paint(timeMs: number) {
			if (!built || !canvas || cssSize < 2) return;

			const ctx = canvas.getContext('2d', { alpha: true });
			if (!ctx) return;

			if (releasing) {
				const elapsed = timeMs - releaseStart;
				clearStrength = Math.max(0, 1 - elapsed / HOVER_RELEASE_MS);
				if (clearStrength <= 0.001) {
					clearStrength = 0;
					releasing = false;
					pointerX = -9999;
					pointerY = -9999;
					smoothX = -9999;
					smoothY = -9999;
				}
			}

			// Decay scroll boost when idle; stays hot while scrolling.
			scrollBoost *= 0.9;
			if (scrollBoost < 0.02) scrollBoost = 0;

			const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.imageSmoothingEnabled = false;
			ctx.clearRect(0, 0, cssSize, cssSize);

			const boost = scrollBoost;
			const phaseMs = GLITCH_PHASE_IDLE + (GLITCH_PHASE_FAST - GLITCH_PHASE_IDLE) * boost;
			const phase2Ms = GLITCH_PHASE2_IDLE + (GLITCH_PHASE2_FAST - GLITCH_PHASE2_IDLE) * boost;
			const phase = Math.floor(timeMs / phaseMs);
			const phase2 = Math.floor(timeMs / phase2Ms);
			const radius = hoverRadius();
			const clearing = radius > 2;
			// Scroll drops a large share of squares (idle stays subtle).
			const hideBoost = 1 + boost * 9;
			const ghostChance = 380 - Math.floor(boost * 300);

			// Soft-follow the pointer so the hole doesn't feel locked to a hard circle.
			if (pointerActive || releasing) {
				if (smoothX < -9000) {
					smoothX = pointerX;
					smoothY = pointerY;
				} else {
					smoothX += (pointerX - smoothX) * 0.22;
					smoothY += (pointerY - smoothY) * 0.22;
				}
			} else {
				smoothX = -9999;
				smoothY = -9999;
			}

			const noisePhase = timeMs * 0.0018;

			const drawCell = (c: Cell, a: number) => {
				const px = c.x * cell + (cell - block) / 2;
				const py = c.y * cell + (cell - block) / 2;

				if (clearing && smoothX > -9000) {
					const cx = px + block * 0.5;
					const cy = py + block * 0.5;
					const dx = cx - smoothX;
					const dy = cy - smoothY;
					const dist = Math.hypot(dx, dy);

					// Jagged organic radius — breaks the perfect circle.
					const ang = Math.atan2(dy, dx);
					const wobble =
						Math.sin(ang * 3.0 + c.x * 0.37 + noisePhase) * 0.11 +
						Math.sin(ang * 7.0 - c.y * 0.29 + noisePhase * 1.3) * 0.07 +
						(((c.x * 73856093) ^ (c.y * 19349663)) % 1000) / 1000 * 0.1 -
						0.05;
					const localR = radius * (0.88 + wobble);
					const feather = Math.max(cell * 2.2, radius * 0.38);
					const inner = Math.max(0, localR - feather);

					if (dist < inner) return;
					if (dist < localR + feather * 0.35) {
						// Soft scatter on the rim — some squares linger / pop.
						const t = (dist - inner) / Math.max(1, localR + feather * 0.35 - inner);
						const rimNoise =
							(((c.x * 50331653) ^ (c.y * 12582917) ^ phase * 97) >>> 0) % 1000;
						const keepChance = t * t * (0.55 + (rimNoise / 1000) * 0.55);
						if (rimNoise / 1000 > keepChance) return;
					}
				}

				ctx.fillStyle = `rgba(${orange.r}, ${orange.g}, ${orange.b}, ${a})`;
				ctx.fillRect(px, py, block, block);
			};

			for (let i = 0; i < baseCells.length; i += 1) {
				const c = baseCells[i];
				const h =
					((c.x * 73856093) ^ (c.y * 19349663) ^ (phase * 83492791) ^ (i * 39916801)) >>> 0;
				const baseHide = 8 + Math.floor(c.soft * 28);
				const hideChance = Math.min(780, baseHide * hideBoost + boost * 220);
				if (h % 1000 < hideChance) continue;
				drawCell(c, c.alpha);
			}

			const ghostBudget = Math.min(
				ghostCells.length,
				Math.max(3, Math.floor(ghostCells.length * (0.05 + boost * 0.2))),
			);
			for (let n = 0; n < ghostBudget; n += 1) {
				const pick =
					(((phase2 + n * 17) * 2654435761) >>> 0) % Math.max(1, ghostCells.length);
				const c = ghostCells[pick];
				if (!c) continue;
				const h = ((c.x * 50331653) ^ (c.y * 12582917) ^ (phase2 * 97)) >>> 0;
				if (h % 1000 > ghostChance) continue;
				drawCell(c, c.alpha * 0.85);
			}
		}

		function tick(now: number) {
			if (cancelled) return;
			paint(now);
			raf = requestAnimationFrame(tick);
		}

		function rebuildAndStart() {
			if (!buildCells()) return;
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(tick);
		}

		function setPointerFromClient(clientX: number, clientY: number) {
			const rect = wrap.getBoundingClientRect();
			pointerX = clientX - rect.left;
			pointerY = clientY - rect.top;
		}

		function onPointerEnter(event: PointerEvent) {
			if (event.pointerType === 'touch') return;
			if (!finePointer.matches) return;
			releasing = false;
			clearStrength = 1;
			pointerActive = true;
			setPointerFromClient(event.clientX, event.clientY);
		}

		function onPointerMove(event: PointerEvent) {
			if (event.pointerType === 'touch') return;
			if (!finePointer.matches) return;
			releasing = false;
			clearStrength = 1;
			pointerActive = true;
			setPointerFromClient(event.clientX, event.clientY);
		}

		function onPointerLeave() {
			if (!pointerActive && clearStrength <= 0) return;
			pointerActive = false;
			releasing = true;
			clearStrength = 1;
			releaseStart = performance.now();
		}

		function onPointerDown(event: PointerEvent) {
			if (event.pointerType !== 'touch') return;
			releasing = false;
			clearStrength = 1;
			pointerActive = true;
			setPointerFromClient(event.clientX, event.clientY);
		}

		function onPointerUp(event: PointerEvent) {
			if (event.pointerType !== 'touch') return;
			setPointerFromClient(event.clientX, event.clientY);
			pointerActive = false;
			releasing = true;
			clearStrength = 1;
			releaseStart = performance.now();
		}

		const onLoad = () => rebuildAndStart();
		if (img.complete) rebuildAndStart();
		else img.addEventListener('load', onLoad);

		const ro = new ResizeObserver(() => rebuildAndStart());
		ro.observe(wrap);

		window.addEventListener('scroll', onScroll, { passive: true });

		wrap.addEventListener('pointerenter', onPointerEnter);
		wrap.addEventListener('pointermove', onPointerMove);
		wrap.addEventListener('pointerleave', onPointerLeave);
		wrap.addEventListener('pointerdown', onPointerDown);
		wrap.addEventListener('pointerup', onPointerUp);
		wrap.addEventListener('pointercancel', onPointerUp);

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			img.removeEventListener('load', onLoad);
			ro.disconnect();
			window.removeEventListener('scroll', onScroll);
			wrap.removeEventListener('pointerenter', onPointerEnter);
			wrap.removeEventListener('pointermove', onPointerMove);
			wrap.removeEventListener('pointerleave', onPointerLeave);
			wrap.removeEventListener('pointerdown', onPointerDown);
			wrap.removeEventListener('pointerup', onPointerUp);
			wrap.removeEventListener('pointercancel', onPointerUp);
		};
	}, [src, gridSize]);

	return (
		<div
			ref={wrapRef}
			className={`pixel-portrait ${className}`.trim()}
			role="img"
			aria-label={ariaLabel}
		>
			<canvas ref={canvasRef} className="pixel-portrait__canvas" />
		</div>
	);
}
