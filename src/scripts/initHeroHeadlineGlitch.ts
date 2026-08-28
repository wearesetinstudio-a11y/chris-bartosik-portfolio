type TrailPoint = { x: number; y: number; t: number };

const TRAIL_LIFE_MS = 560;
const TRAIL_RADIUS_X = 28;
const TRAIL_RADIUS_Y = 22;
const TRAIL_MAX = 36;
const SAMPLE_GAP_PX = 4;
const HEADLINE_MIN_PX = 18;
const MOBILE_FIT_WIDTH_TOLERANCE_PX = 8;

let cleanupHeroHeadlineBlur: (() => void) | null = null;
let cachedMobileHeadlineFit: {
	fontSize: number;
	width: number;
	locale: string;
	letterSpacing: string;
} | null = null;
const headlineBaselineCache = new WeakMap<HTMLElement, number>();

function getHeadlineLocale() {
	return document.documentElement.dataset.locale || document.documentElement.lang || 'en';
}

function parseSpacing(value: string, fontSize: number) {
	if (!value || value === 'normal') return 0;
	if (value.endsWith('em')) return parseFloat(value) * fontSize;
	if (value.endsWith('px')) return parseFloat(value);
	return parseFloat(value) || 0;
}

function measureBaseline(el: HTMLElement) {
	const cached = headlineBaselineCache.get(el);
	if (cached !== undefined) return cached;

	const probe = document.createElement('span');
	probe.setAttribute('aria-hidden', 'true');
	probe.style.cssText =
		'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline';
	el.appendChild(probe);
	const elRect = el.getBoundingClientRect();
	const probeRect = probe.getBoundingClientRect();
	el.removeChild(probe);
	const baseline = probeRect.top - elRect.top;
	headlineBaselineCache.set(el, baseline);
	return baseline;
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

function lineFitsWidth(line: HTMLElement, width: number) {
	const text = (line.innerText || '').replace(/\s+/g, ' ').trim();
	if (!text) return true;

	// Absolute glitch canvases can inflate scrollWidth — hide while measuring.
	const canvases = Array.from(line.querySelectorAll('canvas'));
	const previousDisplay = canvases.map((canvas) => canvas.style.display);
	for (const canvas of canvases) canvas.style.display = 'none';

	const fits = line.scrollWidth <= width + 1;

	canvases.forEach((canvas, index) => {
		canvas.style.display = previousDisplay[index];
	});

	return fits;
}

function fitHeroHeadline(headline: HTMLElement, force = false) {
	const desk = headline.querySelector<HTMLElement>('[data-hero-headline-desk]');
	const mob = headline.querySelector<HTMLElement>('[data-hero-headline-mob]');
	const mobile = isMobileHeadline();
	const locale = getHeadlineLocale();
	if (desk) desk.setAttribute('aria-hidden', mobile ? 'true' : 'false');
	if (mob) mob.setAttribute('aria-hidden', mobile ? 'false' : 'true');

	const lines = getHeadlineLines(headline);
	if (!lines.length || headline.clientWidth < 8) return;

	const width = headline.clientWidth;
	const fits = () => lines.every((line) => lineFitsWidth(line, width));

	const cacheHit =
		cachedMobileHeadlineFit &&
		cachedMobileHeadlineFit.locale === locale &&
		Math.abs(width - cachedMobileHeadlineFit.width) < MOBILE_FIT_WIDTH_TOLERANCE_PX;

	if (mobile && !force && cacheHit && cachedMobileHeadlineFit) {
		headline.style.fontSize = `${cachedMobileHeadlineFit.fontSize}px`;
		headline.style.letterSpacing = cachedMobileHeadlineFit.letterSpacing;
		if (fits()) return;
	}

	headline.style.fontSize = '';
	headline.style.letterSpacing = '';
	const cssPx = parseFloat(getComputedStyle(headline).fontSize);
	if (!Number.isFinite(cssPx) || cssPx <= 0) return;

	const maxFontForTracking = (tracking: string, hi: number) => {
		headline.style.letterSpacing = tracking;
		headline.style.fontSize = `${hi}px`;
		if (fits()) return hi;

		let lo = HEADLINE_MIN_PX;
		let best = HEADLINE_MIN_PX;
		let high = hi;
		for (let i = 0; i < 22; i += 1) {
			const mid = (lo + high) / 2;
			headline.style.fontSize = `${mid}px`;
			if (fits()) {
				best = mid;
				lo = mid;
			} else {
				high = mid;
			}
		}
		return best;
	};

	if (!mobile) {
		headline.style.letterSpacing = '';
		if (fits()) {
			cachedMobileHeadlineFit = null;
			return;
		}
		const best = maxFontForTracking('', cssPx);
		headline.style.fontSize = `${best}px`;
		cachedMobileHeadlineFit = null;
		return;
	}

	// Mobile: fill the grid. Longer 2-line locales (PL) tighten tracking
	// before shrinking so size stays closer to EN/ES.
	const hi = Math.max(cssPx, width * 0.145);
	const defaultTracking = '-0.03em';
	const tightTracking = '-0.06em';
	const sizeDefault = maxFontForTracking(defaultTracking, hi);
	const sizeTight = maxFontForTracking(tightTracking, hi);

	const useTight = sizeTight > sizeDefault + 0.4;
	const best = useTight ? sizeTight : sizeDefault;
	const letterSpacing = useTight ? tightTracking : defaultTracking;

	headline.style.fontSize = `${best}px`;
	headline.style.letterSpacing = letterSpacing;
	cachedMobileHeadlineFit = { fontSize: best, width, locale, letterSpacing };
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
		fitHeroHeadline(headline, true);
		const onResizeOnly = () => {
			if (isMobileHeadline()) {
				const width = headline.clientWidth;
				const locale = getHeadlineLocale();
				if (
					cachedMobileHeadlineFit &&
					cachedMobileHeadlineFit.locale === locale &&
					width >= cachedMobileHeadlineFit.width - MOBILE_FIT_WIDTH_TOLERANCE_PX
				) {
					headline.style.fontSize = `${cachedMobileHeadlineFit.fontSize}px`;
					headline.style.letterSpacing = cachedMobileHeadlineFit.letterSpacing;
					return;
				}
			}
			fitHeroHeadline(headline, true);
		};
		const onI18nOnly = () => {
			cachedMobileHeadlineFit = null;
			requestAnimationFrame(() => fitHeroHeadline(headline, true));
		};
		window.addEventListener('resize', onResizeOnly, { passive: true });
		document.addEventListener('i18n-applied', onI18nOnly);
		cleanupHeroHeadlineBlur = () => {
			window.removeEventListener('resize', onResizeOnly);
			document.removeEventListener('i18n-applied', onI18nOnly);
			headline.style.fontSize = '';
			headline.style.letterSpacing = '';
			cachedMobileHeadlineFit = null;
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
	let trailActive = false;
	let lastObservedWidth = 0;
	let lastObservedHeight = 0;

	function clearOverlay() {
		if (!cssW || !cssH) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);
	}

	function paintSource() {
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
			trailActive = false;
			rafId = 0;
			return;
		}

		trailActive = true;
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

	function rebuild(refit = false) {
		sourceReady = false;
		for (const line of getHeadlineLines(headline)) {
			headlineBaselineCache.delete(line);
		}
		fitHeroHeadline(headline, refit || !isMobileHeadline());
		paintSource();
		clearOverlay();
	}

	function onLayoutChange(refit = false) {
		if (refit || !isMobileHeadline()) {
			rebuild(true);
			return;
		}

		const width = headline.clientWidth;
		const locale = getHeadlineLocale();
		if (
			cachedMobileHeadlineFit &&
			cachedMobileHeadlineFit.locale === locale &&
			width >= cachedMobileHeadlineFit.width - MOBILE_FIT_WIDTH_TOLERANCE_PX
		) {
			// Width stable or slightly larger — keep locked mobile size (no shrink).
			rebuild(false);
			return;
		}

		rebuild(true);
	}

	function scheduleLocaleRefit() {
		cachedMobileHeadlineFit = null;
		const run = () => onLayoutChange(true);
		requestAnimationFrame(() => {
			requestAnimationFrame(run);
		});
		void document.fonts.ready.then(run);
	}

	void document.fonts.ready.then(() => onLayoutChange(true));
	window.addEventListener('intro-revealing', () => onLayoutChange(true), { once: true });

	const resizeObserver = new ResizeObserver((entries) => {
		if (trailActive) return;

		const entry = entries[0];
		if (!entry) return;

		const { width, height } = entry.contentRect;
		if (
			Math.abs(width - lastObservedWidth) < 2 &&
			Math.abs(height - lastObservedHeight) < 2
		) {
			return;
		}

		// Height-only changes (mobile chrome) must not refit the headline.
		const widthChanged = Math.abs(width - lastObservedWidth) >= 2;
		lastObservedWidth = width;
		lastObservedHeight = height;
		if (!widthChanged && isMobileHeadline()) {
			if (cachedMobileHeadlineFit?.locale === getHeadlineLocale()) {
				headline.style.fontSize = `${cachedMobileHeadlineFit.fontSize}px`;
				headline.style.letterSpacing = cachedMobileHeadlineFit.letterSpacing;
			}
			return;
		}

		onLayoutChange(false);
	});
	resizeObserver.observe(headline);

	headline.addEventListener('pointermove', onPointerMove, { passive: true });
	headline.addEventListener('pointerleave', onPointerLeave, { passive: true });
	const onI18nApplied = () => scheduleLocaleRefit();
	const onWindowResize = () => onLayoutChange(false);

	document.addEventListener('i18n-applied', onI18nApplied);
	window.addEventListener('resize', onWindowResize);

	cleanupHeroHeadlineBlur = () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		trail.length = 0;
		sourceReady = false;
		trailActive = false;
		lastObservedWidth = 0;
		lastObservedHeight = 0;
		resizeObserver.disconnect();
		headline.removeEventListener('pointermove', onPointerMove);
		headline.removeEventListener('pointerleave', onPointerLeave);
		document.removeEventListener('i18n-applied', onI18nApplied);
		window.removeEventListener('resize', onWindowResize);
		canvas?.remove();
		headline.style.fontSize = '';
		headline.style.letterSpacing = '';
		cachedMobileHeadlineFit = null;
	};
}
