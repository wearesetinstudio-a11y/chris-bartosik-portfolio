type TrailPoint = { x: number; y: number; t: number };

const TRAIL_LIFE_MS = 560;
const TRAIL_RADIUS_X = 28;
const TRAIL_RADIUS_Y = 22;
const TRAIL_MAX = 36;
const SAMPLE_GAP_PX = 4;
const HEADLINE_MIN_PX = 18;

let cleanupHeroHeadlineBlur: (() => void) | null = null;

function parseSpacing(value: string, fontSize: number) {
	if (!value || value === 'normal') return 0;
	if (value.endsWith('em')) return parseFloat(value) * fontSize;
	if (value.endsWith('px')) return parseFloat(value);
	return parseFloat(value) || 0;
}

function measureBaseline(el: HTMLElement) {
	const probe = document.createElement('span');
	probe.setAttribute('aria-hidden', 'true');
	probe.style.cssText =
		'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline';
	el.appendChild(probe);
	const elRect = el.getBoundingClientRect();
	const probeRect = probe.getBoundingClientRect();
	el.removeChild(probe);
	return probeRect.top - elRect.top;
}

function isMobileHeadline() {
	return window.matchMedia('(max-width: 767px)').matches;
}

function getActiveHeadlineRoot(headline: HTMLElement) {
	const mobile = headline.querySelector<HTMLElement>('[data-hero-headline-mob]');
	const desk = headline.querySelector<HTMLElement>('[data-hero-headline-desk]');
	if (isMobileHeadline()) return mobile ?? headline;
	return desk ?? headline;
}

function getHeadlineLines(headline: HTMLElement) {
	const root = getActiveHeadlineRoot(headline);
	return [...root.querySelectorAll<HTMLElement>('.hero-reveal-line')].filter((line) =>
		(line.textContent ?? '').trim(),
	);
}

function fitHeroHeadline(headline: HTMLElement) {
	const desk = headline.querySelector<HTMLElement>('[data-hero-headline-desk]');
	const mob = headline.querySelector<HTMLElement>('[data-hero-headline-mob]');
	const mobile = isMobileHeadline();
	if (desk) desk.setAttribute('aria-hidden', mobile ? 'true' : 'false');
	if (mob) mob.setAttribute('aria-hidden', mobile ? 'false' : 'true');

	headline.style.fontSize = '';
	const maxPx = parseFloat(getComputedStyle(headline).fontSize);
	if (!Number.isFinite(maxPx) || maxPx <= 0) return;

	const lines = getHeadlineLines(headline);
	if (!lines.length || headline.clientWidth < 8) return;

	const width = headline.clientWidth;
	const fits = () => lines.every((line) => line.scrollWidth <= width + 1);

	let lo = HEADLINE_MIN_PX;
	let hi = mobile ? Math.max(maxPx * 1.85, width * 0.135) : maxPx;
	let best = HEADLINE_MIN_PX;

	if (!mobile && fits()) return;

	for (let i = 0; i < 20; i += 1) {
		const mid = (lo + hi) / 2;
		headline.style.fontSize = `${mid}px`;
		if (fits()) {
			best = mid;
			lo = mid;
		} else {
			hi = mid;
		}
	}

	headline.style.fontSize = `${best}px`;
}

export function initHeroHeadlineGlitch() {
	const headline = document.getElementById('hero-headline');
	if (!headline) {
		cleanupHeroHeadlineBlur?.();
		cleanupHeroHeadlineBlur = null;
		return;
	}

	cleanupHeroHeadlineBlur?.();
	cleanupHeroHeadlineBlur = null;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		fitHeroHeadline(headline);
		const onResizeOnly = () => fitHeroHeadline(headline);
		window.addEventListener('resize', onResizeOnly, { passive: true });
		document.addEventListener('i18n-applied', onResizeOnly);
		cleanupHeroHeadlineBlur = () => {
			window.removeEventListener('resize', onResizeOnly);
			document.removeEventListener('i18n-applied', onResizeOnly);
			headline.style.fontSize = '';
		};
		return;
	}

	let canvas = headline.querySelector<HTMLCanvasElement>('.hero-headline__hover-glitch');
	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.className = 'hero-headline__hover-glitch';
		canvas.setAttribute('aria-hidden', 'true');
		headline.append(canvas);
	}

	const ctx = canvas.getContext('2d', { alpha: true });
	if (!ctx) return;

	const source = document.createElement('canvas');
	const sourceCtx = source.getContext('2d', { alpha: true });
	if (!sourceCtx) return;

	const trail: TrailPoint[] = [];
	let rafId = 0;
	let lastSampleX = Number.NaN;
	let lastSampleY = Number.NaN;
	let cssW = 0;
	let cssH = 0;
	let dpr = 1;
	let sourceReady = false;

	function clearOverlay() {
		if (!cssW || !cssH) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);
	}

	function paintSource() {
		fitHeroHeadline(headline);

		const rect = headline.getBoundingClientRect();
		if (rect.width < 8 || rect.height < 8) {
			sourceReady = false;
			return false;
		}

		dpr = Math.min(window.devicePixelRatio || 1, 2);
		cssW = Math.max(1, Math.ceil(rect.width));
		cssH = Math.max(1, Math.ceil(rect.height));

		const style = getComputedStyle(headline);
		const fontSize = parseFloat(style.fontSize) || 44;

		source.width = Math.max(1, Math.ceil(cssW * dpr));
		source.height = Math.max(1, Math.ceil(cssH * dpr));
		canvas!.width = source.width;
		canvas!.height = source.height;
		canvas!.style.width = `${cssW}px`;
		canvas!.style.height = `${cssH}px`;

		sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
		sourceCtx.clearRect(0, 0, cssW, cssH);
		sourceCtx.imageSmoothingEnabled = true;
		sourceCtx.fillStyle = '#ffffff';

		for (const line of getHeadlineLines(headline)) {
			const text = (line.innerText || '').replace(/\s+/g, ' ').trim();
			if (!text) continue;

			const lineRect = line.getBoundingClientRect();
			if (lineRect.width < 2 || lineRect.height < 2) continue;

			const lineStyle = getComputedStyle(line);
			const size = parseFloat(lineStyle.fontSize) || fontSize;
			const spacing = parseSpacing(lineStyle.letterSpacing, size);
			const x = lineRect.left - rect.left;
			const baseline = lineRect.top - rect.top + measureBaseline(line);

			sourceCtx.font = `${lineStyle.fontWeight} ${lineStyle.fontSize} ${lineStyle.fontFamily}`;
			sourceCtx.textBaseline = 'alphabetic';
			sourceCtx.textAlign = 'left';

			const canvasWithSpacing = sourceCtx as CanvasRenderingContext2D & {
				letterSpacing?: string;
			};
			if (typeof canvasWithSpacing.letterSpacing === 'string') {
				canvasWithSpacing.letterSpacing = lineStyle.letterSpacing;
				sourceCtx.fillText(text.toUpperCase(), x, baseline);
			} else {
				let cursor = x;
				for (const char of text.toUpperCase()) {
					sourceCtx.fillText(char, cursor, baseline);
					cursor += sourceCtx.measureText(char).width + spacing;
				}
			}
		}

		sourceReady = true;
		return true;
	}

	/** Gentle per-letter white soften — no background punch. */
	function blurNear(cx: number, cy: number, fade: number) {
		const rx = TRAIL_RADIUS_X * (0.7 + fade * 0.4);
		const ry = TRAIL_RADIUS_Y * (0.75 + fade * 0.35);
		const stretch = 1.6 + fade * 2.4;
		const steps = 5;

		ctx.save();
		ctx.beginPath();
		ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
		ctx.clip();

		ctx.globalCompositeOperation = 'source-over';

		for (let i = 0; i < steps; i += 1) {
			const t = steps <= 1 ? 0.5 : i / (steps - 1);
			const offset = (t - 0.5) * stretch * 2;
			const weight = Math.sin(t * Math.PI);
			ctx.globalAlpha = fade * (0.05 + weight * 0.12);
			ctx.drawImage(source, 0, 0, source.width, source.height, offset, 0, cssW, cssH);
		}

		if (typeof ctx.filter === 'string') {
			ctx.filter = `blur(${(0.55 + fade * 0.9).toFixed(2)}px)`;
			ctx.globalAlpha = fade * 0.26;
			ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, cssW, cssH);
			ctx.filter = 'none';
		}

		ctx.restore();
	}

	function paint(now: number) {
		while (trail.length && now - trail[0].t > TRAIL_LIFE_MS) {
			trail.shift();
		}

		if (!trail.length || !headline.isConnected) {
			clearOverlay();
			rafId = 0;
			return;
		}

		if (!sourceReady) paintSource();
		if (!sourceReady) {
			rafId = window.requestAnimationFrame(paint);
			return;
		}

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = true;
		ctx.clearRect(0, 0, cssW, cssH);

		const rect = headline.getBoundingClientRect();

		for (const point of trail) {
			const age = Math.min(1, (now - point.t) / TRAIL_LIFE_MS);
			const fade = (1 - age) ** 1.45;
			if (fade < 0.04) continue;
			blurNear(point.x - rect.left, point.y - rect.top, fade);
		}

		rafId = window.requestAnimationFrame(paint);
	}

	function ensureLoop() {
		if (!rafId) {
			rafId = window.requestAnimationFrame(paint);
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch') return;

		const x = event.clientX;
		const y = event.clientY;

		if (
			Number.isFinite(lastSampleX) &&
			Math.hypot(x - lastSampleX, y - lastSampleY) < SAMPLE_GAP_PX
		) {
			return;
		}

		lastSampleX = x;
		lastSampleY = y;
		trail.push({ x, y, t: performance.now() });

		if (trail.length > TRAIL_MAX) {
			trail.splice(0, trail.length - TRAIL_MAX);
		}

		ensureLoop();
	}

	function onPointerLeave() {
		lastSampleX = Number.NaN;
		lastSampleY = Number.NaN;
		ensureLoop();
	}

	function rebuild() {
		sourceReady = false;
		paintSource();
		clearOverlay();
	}

	void document.fonts.ready.then(rebuild);
	window.addEventListener('intro-revealing', rebuild, { once: true });

	const resizeObserver = new ResizeObserver(rebuild);
	resizeObserver.observe(headline);

	headline.addEventListener('pointermove', onPointerMove, { passive: true });
	headline.addEventListener('pointerleave', onPointerLeave, { passive: true });
	document.addEventListener('i18n-applied', rebuild);
	window.addEventListener('resize', rebuild);

	cleanupHeroHeadlineBlur = () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		trail.length = 0;
		sourceReady = false;
		resizeObserver.disconnect();
		headline.removeEventListener('pointermove', onPointerMove);
		headline.removeEventListener('pointerleave', onPointerLeave);
		document.removeEventListener('i18n-applied', rebuild);
		window.removeEventListener('resize', rebuild);
		window.removeEventListener('intro-revealing', rebuild);
		canvas?.remove();
		headline.style.fontSize = '';
	};
}
