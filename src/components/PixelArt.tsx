import { useEffect, useRef } from 'react';

const BRAND_ORANGE = '#F54100';
const DEFAULT_SRC = '/chris-portrait-dither.png';
/** Shared CSS px per grid cell — About face & Skills icons (desktop + mobile). */
/** Finer grid — face detail matches the reference dither (mobile + desktop). */
export const PIXEL_ART_CELL_CSS = 3;

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

type PixelArtProps = {
	src?: string;
	/**
	 * Target CSS pixels per cell. Defaults to PIXEL_ART_CELL_CSS so About and
	 * Skills always share the same physical square size.
	 */
	cellCss?: number;
	/** When false, animation loop pauses (stacked layers). */
	active?: boolean;
	/**
	 * How much of the square the subject should fill (0.5–1).
	 * Crops to orange bounds, then centers — keeps skill icons aligned.
	 */
	subjectFill?: number;
	/**
	 * `subject` — crop to orange bounds (skills icons).
	 * `image` — keep the source framing (portrait matches the PNG composition).
	 */
	frame?: 'subject' | 'image';
	/**
	 * 0–1 morph presence. Cells turn on/off by stable grid hash so stacked
	 * icons dissolve into each other as exact squares (not opacity fades).
	 */
	presence?: number;
	/**
	 * When true, squares assemble pixel-by-pixel the first time the art
	 * scrolls into view (and again if it leaves and re-enters).
	 */
	intro?: boolean;
	className?: string;
	'aria-label'?: string;
};

/** Stable 0–1 rank per grid cell — shared across layers for related morphs. */
function cellMorphRank(x: number, y: number) {
	return ((((x * 73856093) ^ (y * 19349663)) >>> 0) % 10000) / 10000;
}

function isWarmOrange(r: number, g: number, b: number) {
	return r > 28 && r - (g + b) * 0.35 > 12;
}

/**
 * Bounding-box center + full-contain radius of orange content.
 * Bbox center (not mass) keeps asymmetric faces optically centered —
 * denser cheek/hair mass was pulling the crop and shifting the head left.
 */
function orangeSubject(data: Uint8ClampedArray, w: number, h: number) {
	let minX = w;
	let minY = h;
	let maxX = 0;
	let maxY = 0;
	let hit = 0;
	const step = Math.max(1, Math.floor(Math.min(w, h) / 320));

	for (let y = 0; y < h; y += step) {
		for (let x = 0; x < w; x += step) {
			const i = (y * w + x) * 4;
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			if (!isWarmOrange(r, g, b)) continue;
			hit += 1;
			if (x < minX) minX = x;
			if (y < minY) minY = y;
			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;
		}
	}

	if (hit < 8) return null;

	const cx = (minX + maxX) * 0.5;
	const cy = (minY + maxY) * 0.5;
	const pad = step + 2;
	const radius = Math.max(maxX - minX, maxY - minY) * 0.5 + pad;

	return { cx, cy, radius };
}

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
 * Re-grids a pre-dithered orange-on-black image onto transparent canvas
 * squares. Hover clears under the cursor; scrolling speeds up the glitch flicker.
 */
export default function PixelArt({
	src = DEFAULT_SRC,
	cellCss = PIXEL_ART_CELL_CSS,
	active = true,
	subjectFill = 0.88,
	frame = 'subject',
	presence = 1,
	intro = false,
	className = '',
	'aria-label': ariaLabel = 'Pixel art',
}: PixelArtProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef(active);
	const presenceRef = useRef(presence);
	const introRef = useRef(intro);
	activeRef.current = active;
	presenceRef.current = presence;
	introRef.current = intro;

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
		let presenceSmooth = Math.min(1, Math.max(0, presenceRef.current));
		let introTarget = introRef.current ? 0 : 1;
		let introSmooth = introTarget;

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
			const gapRatio = 0.16;
			// Always derive grid from shared cellCss — same square size everywhere.
			const cols = Math.max(32, Math.round(cssSize / Math.max(2, cellCss)));
			const rows = cols;
			cell = cssSize / cols;
			block = Math.max(0.7, cell * (1 - gapRatio));

			const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
			canvas.width = Math.round(cssSize * dpr);
			canvas.height = Math.round(cssSize * dpr);
			canvas.style.width = `${cssSize}px`;
			canvas.style.height = `${cssSize}px`;

			// Square crop around subject center → same size & placement for every icon.
			const probe = document.createElement('canvas');
			probe.width = img.naturalWidth;
			probe.height = img.naturalHeight;
			const pctx = probe.getContext('2d', { willReadFrequently: true });
			if (!pctx) return false;
			pctx.drawImage(img, 0, 0);
			const probed = pctx.getImageData(0, 0, probe.width, probe.height);
			const iw = probe.width;
			const ih = probe.height;
			const fill = Math.min(1, Math.max(0.55, subjectFill));

			let cx = iw * 0.5;
			let cy = ih * 0.5;
			let radius = Math.max(iw, ih) * 0.5;

			if (frame === 'subject') {
				const subject =
					orangeSubject(probed.data, iw, ih) ?? {
						cx: iw * 0.5,
						cy: ih * 0.5,
						radius: Math.min(iw, ih) * 0.45,
					};
				cx = subject.cx;
				cy = subject.cy;
				radius = Math.max(1, Number.isFinite(subject.radius) ? subject.radius : 1);
			}

			// Square crop centered on subject or full image framing.
			const sidePx = Math.max(2, Math.round((radius * 2) / fill));
			const half = sidePx * 0.5;

			const crop = document.createElement('canvas');
			crop.width = sidePx;
			crop.height = sidePx;
			const cctx = crop.getContext('2d');
			if (!cctx) return false;
			cctx.fillStyle = '#000000';
			cctx.fillRect(0, 0, sidePx, sidePx);
			cctx.drawImage(img, half - cx, half - cy);

			const sample = document.createElement('canvas');
			sample.width = cols;
			sample.height = rows;
			const sctx = sample.getContext('2d', { willReadFrequently: true });
			if (!sctx) return false;

			// Nearest-neighbor keeps keycap "AI" letter dither from blending away.
			sctx.imageSmoothingEnabled = false;
			sctx.fillStyle = '#000000';
			sctx.fillRect(0, 0, cols, rows);
			sctx.drawImage(crop, 0, 0, cols, rows);

			const { data } = sctx.getImageData(0, 0, cols, rows);
			const nextBase: Cell[] = [];
			const nextGhost: Cell[] = [];

			// Normalize orange brightness so darker skill JPGs match the face.
			let maxOrangeR = 1;
			for (let i = 0; i < data.length; i += 4) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				if (!isWarmOrange(r, g, b)) continue;
				if (r > maxOrangeR) maxOrangeR = r;
			}

			for (let y = 0; y < rows; y += 1) {
				for (let x = 0; x < cols; x += 1) {
					const i = (y * cols + x) * 4;
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];
					if (!isWarmOrange(r, g, b)) continue;

					// Relative cover — skills (~R118) map like portrait (~R191).
					const cover = Math.min(1, r / maxOrangeR);
					if (cover < 0.05) continue;

					// Linear density keeps mid-tone letter strokes (AI) alive.
					const density = 0.22 + cover * 0.78;
					const capped = Math.min(0.82, density);
					const threshold = (BAYER_8[y % 8][x % 8] + 0.5) / 64;
					const soft = Math.max(0, 1 - Math.abs(capped - threshold) * 3.2);
					// Solid brand orange like the face (avoid washed dim alphas).
					const alpha = cover > 0.32 ? 1 : 0.55 + cover * 0.9;

					if (capped >= threshold) {
						nextBase.push({ x, y, alpha, soft });
					} else if (capped > threshold * 0.55 && soft > 0.18) {
						nextGhost.push({ x, y, alpha: Math.min(1, alpha * 0.85), soft: 1 });
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

			const presenceTarget = Math.min(1, Math.max(0, presenceRef.current));
			if (reduceMotion.matches) {
				presenceSmooth = presenceTarget;
				introSmooth = introTarget;
			} else {
				presenceSmooth += (presenceTarget - presenceSmooth) * 0.14;
				if (Math.abs(presenceTarget - presenceSmooth) < 0.002) {
					presenceSmooth = presenceTarget;
				}
				// Slower than morph — squares assemble one-by-one on scroll-in.
				introSmooth += (introTarget - introSmooth) * 0.055;
				if (Math.abs(introTarget - introSmooth) < 0.002) {
					introSmooth = introTarget;
				}
			}
			const morphGate = presenceSmooth * introSmooth;

			const drawCell = (c: Cell, a: number) => {
				// Discrete square dissolve — same rank order on every layer.
				if (morphGate < 0.999 && cellMorphRank(c.x, c.y) > morphGate) return;

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
			const p = presenceRef.current;
			const morphing =
				Math.abs(p - presenceSmooth) > 0.002 ||
				(p > 0.01 && p < 0.99) ||
				Math.abs(introTarget - introSmooth) > 0.002;
			if (activeRef.current || morphing || (p > 0.01 && introSmooth > 0.01)) paint(now);
			else if (built && canvas) {
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}
			}
			raf = requestAnimationFrame(tick);
		}

		const io =
			typeof IntersectionObserver !== 'undefined'
				? new IntersectionObserver(
						(entries) => {
							for (const entry of entries) {
								if (!introRef.current) {
									introTarget = 1;
									continue;
								}
								if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
									introTarget = 1;
								} else if (!entry.isIntersecting) {
									// Reset so re-entering replays the pixel assemble.
									introTarget = 0;
									if (reduceMotion.matches) introSmooth = 0;
								}
							}
						},
						{ threshold: [0, 0.18, 0.35], rootMargin: '0px 0px -8% 0px' },
					)
				: null;
		if (io) io.observe(wrap);
		if (!introRef.current) {
			introTarget = 1;
			introSmooth = 1;
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

		let touchStartX = 0;
		let touchStartY = 0;
		let touchScrolling = false;
		let touchPointerId: number | null = null;

		function onPointerDown(event: PointerEvent) {
			if (event.pointerType !== 'touch') return;
			touchPointerId = event.pointerId;
			touchStartX = event.clientX;
			touchStartY = event.clientY;
			touchScrolling = false;
			releasing = false;
			clearStrength = 1;
			pointerActive = true;
			setPointerFromClient(event.clientX, event.clientY);
		}

		function onTouchPointerMove(event: PointerEvent) {
			if (event.pointerType !== 'touch' || event.pointerId !== touchPointerId) return;
			const dx = event.clientX - touchStartX;
			const dy = event.clientY - touchStartY;
			// Vertical drag = page scroll — drop the clear hole immediately.
			if (!touchScrolling && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.1) {
				touchScrolling = true;
				pointerActive = false;
				releasing = false;
				clearStrength = 0;
				pointerX = -9999;
				pointerY = -9999;
				smoothX = -9999;
				smoothY = -9999;
				return;
			}
			if (touchScrolling) return;
			setPointerFromClient(event.clientX, event.clientY);
		}

		function onPointerUp(event: PointerEvent) {
			if (event.pointerType !== 'touch' || event.pointerId !== touchPointerId) return;
			touchPointerId = null;
			if (touchScrolling) {
				touchScrolling = false;
				pointerActive = false;
				clearStrength = 0;
				return;
			}
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
		wrap.addEventListener('pointermove', onTouchPointerMove);
		wrap.addEventListener('pointerleave', onPointerLeave);
		wrap.addEventListener('pointerdown', onPointerDown);
		wrap.addEventListener('pointerup', onPointerUp);
		wrap.addEventListener('pointercancel', onPointerUp);

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			img.removeEventListener('load', onLoad);
			ro.disconnect();
			io?.disconnect();
			window.removeEventListener('scroll', onScroll);
			wrap.removeEventListener('pointerenter', onPointerEnter);
			wrap.removeEventListener('pointermove', onPointerMove);
			wrap.removeEventListener('pointermove', onTouchPointerMove);
			wrap.removeEventListener('pointerleave', onPointerLeave);
			wrap.removeEventListener('pointerdown', onPointerDown);
			wrap.removeEventListener('pointerup', onPointerUp);
			wrap.removeEventListener('pointercancel', onPointerUp);
		};
	}, [src, cellCss, subjectFill, frame, intro]);

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
