const WHITE = '#ffffff';
const VOID = '#131415';
const PATTERN_MS = 260;

let cleanupHeroGlitch: (() => void) | null = null;

function parseSpacing(value: string, fontSize: number) {
	if (!value || value === 'normal') return 0;
	if (value.endsWith('em')) return parseFloat(value) * fontSize;
	if (value.endsWith('px')) return parseFloat(value);
	return parseFloat(value) || 0;
}

function snap(value: number, cell: number) {
	return Math.round(value / cell) * cell;
}

function sign() {
	return Math.random() < 0.5 ? -1 : 1;
}

function measureBaseline(el: HTMLElement) {
	const probe = document.createElement('span');
	probe.setAttribute('aria-hidden', 'true');
	probe.style.cssText = 'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline';
	el.appendChild(probe);
	const elRect = el.getBoundingClientRect();
	const probeRect = probe.getBoundingClientRect();
	el.removeChild(probe);
	return probeRect.top - elRect.top;
}

export function initHeroGlitch() {
	const headline = document.getElementById('hero-headline');
	const root = headline?.querySelector<HTMLElement>('.hero-glitch');

	if (!root) return;

	cleanupHeroGlitch?.();
	cleanupHeroGlitch = null;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	let textEl = root.querySelector<HTMLElement>('.hero-glitch__text');
	if (!textEl) {
		textEl = document.createElement('span');
		textEl.className = 'hero-glitch__text';
		textEl.textContent = root.textContent;
		root.textContent = '';
		root.append(textEl);
	}

	let canvas = root.querySelector<HTMLCanvasElement>('.hero-glitch__canvas');
	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.className = 'hero-glitch__canvas';
		canvas.setAttribute('aria-hidden', 'true');
		root.append(canvas);
	}

	const ctx = canvas.getContext('2d', { alpha: true });
	if (!ctx) return;

	const source = document.createElement('canvas');
	const sourceCtx = source.getContext('2d', { alpha: true, willReadFrequently: true });
	if (!sourceCtx) return;

	let raf = 0;
	let lastPattern = 0;
	let cssW = 0;
	let cssH = 0;
	let pad = 8;
	let cell = 3;
	let dpr = 1;
	let alphaMap: Uint8ClampedArray | null = null;
	let mapW = 0;
	let mapH = 0;
	let running = true;
	let word = 'DIGITAL';
	let baselineY = 0;
	let italicUntil = 0;
	let italicOn = false;

	function isGlitchActive() {
		const hero = document.getElementById('hero-section');
		const roleLine = document.querySelector('[data-hero-intro-group="role-a"]');
		return Boolean(
			hero?.classList.contains('is-hero-intro-complete') || roleLine?.classList.contains('is-visible'),
		);
	}

	function alphaAt(x: number, y: number) {
		if (!alphaMap) return 0;
		const px = Math.min(mapW - 1, Math.max(0, Math.floor(x * dpr)));
		const py = Math.min(mapH - 1, Math.max(0, Math.floor(y * dpr)));
		return alphaMap[(py * mapW + px) * 4 + 3];
	}

	function pickGlyphTile(maxW: number, maxH: number) {
		for (let attempt = 0; attempt < 14; attempt += 1) {
			const x = snap(pad + Math.random() * (cssW - pad * 2 - maxW), cell);
			const y = snap(pad + Math.random() * (cssH - pad * 2 - maxH), cell);
			if (alphaAt(x + maxW / 2, y + maxH / 2) > 24) return { x, y };
		}
		return null;
	}

	function pickGlyphY(lineH: number) {
		for (let attempt = 0; attempt < 16; attempt += 1) {
			const y = snap(pad + Math.random() * (cssH - pad * 2 - lineH), 1);
			for (let x = pad; x < cssW - pad; x += cell) {
				if (alphaAt(x, y + lineH / 2) > 24) return y;
			}
		}
		return null;
	}

	function paintSource() {
		if (!textEl || !sourceCtx) return false;

		const textRect = textEl.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();
		if (textRect.width < 4 || textRect.height < 4) return false;

		const style = getComputedStyle(textEl);
		const fontSize = parseFloat(style.fontSize);
		const spacing = parseSpacing(style.letterSpacing, fontSize);
		word = (textEl.textContent ?? '').trim().toUpperCase();
		if (!word) return false;

		dpr = Math.min(window.devicePixelRatio || 1, 2);
		cell = Math.max(3, Math.round(fontSize * 0.07));
		pad = cell * 6;
		cssW = textRect.width + pad * 2;
		cssH = textRect.height + pad * 2;
		baselineY = pad + measureBaseline(textEl);

		source.width = Math.max(1, Math.ceil(cssW * dpr));
		source.height = Math.max(1, Math.ceil(cssH * dpr));
		canvas!.width = source.width;
		canvas!.height = source.height;
		canvas!.style.width = `${cssW}px`;
		canvas!.style.height = `${cssH}px`;
		canvas!.style.left = `${textRect.left - rootRect.left - pad}px`;
		canvas!.style.top = `${textRect.top - rootRect.top - pad}px`;

		sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
		sourceCtx.clearRect(0, 0, cssW, cssH);
		sourceCtx.imageSmoothingEnabled = false;
		sourceCtx.fillStyle = WHITE;
		sourceCtx.font = style.font;
		sourceCtx.textBaseline = 'alphabetic';
		sourceCtx.textAlign = 'left';

		const canvasWithSpacing = sourceCtx as CanvasRenderingContext2D & { letterSpacing?: string };
		if (typeof canvasWithSpacing.letterSpacing === 'string') {
			canvasWithSpacing.letterSpacing = style.letterSpacing;
		}

		if (typeof canvasWithSpacing.letterSpacing === 'string') {
			sourceCtx.fillText(word, pad, baselineY);
		} else {
			let x = pad;
			for (const char of word) {
				sourceCtx.fillText(char, x, baselineY);
				x += sourceCtx.measureText(char).width + spacing;
			}
		}

		alphaMap = sourceCtx.getImageData(0, 0, source.width, source.height).data;
		mapW = source.width;
		mapH = source.height;
		return true;
	}

	function copyTile(x: number, y: number, w: number, h: number, dx: number, dy: number) {
		ctx!.drawImage(source, x * dpr, y * dpr, w * dpr, h * dpr, dx, dy, w, h);
	}

	function updateItalic(now: number) {
		if (now < italicUntil) return;

		italicOn = !italicOn;
		textEl!.style.fontStyle = italicOn ? 'italic' : '';
		italicUntil = now + (italicOn ? 160 + Math.random() * 180 : 640 + Math.random() * 720);
		paintSource();
	}

	function drawGlitch() {
		if (!ctx || cssW === 0) return;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, cssW, cssH);

		if (Math.random() < 0.38) return;

		const slices = 1 + Math.floor(Math.random() * 2);
		for (let i = 0; i < slices; i += 1) {
			const h = cell;
			const w = cell * (1 + Math.floor(Math.random() * 3));
			const tile = pickGlyphTile(w, h);
			if (!tile) continue;

			const shiftX = cell * sign();
			const shiftY = Math.random() < 0.12 ? cell * sign() : 0;
			copyTile(tile.x, tile.y, w, h, tile.x + shiftX, tile.y + shiftY);
		}

		if (Math.random() < 0.55) {
			const h = 1;
			const y = pickGlyphY(h);
			if (y !== null) {
				const w = Math.max(cell * 4, (cssW - pad * 2) * (0.18 + Math.random() * 0.28));
				const x = pad + Math.random() * Math.max(1, cssW - pad * 2 - w);
				const shift = (3 + Math.random() * 8) * sign();
				copyTile(x, y, w, h, x + shift, y);
			}
		}

		if (Math.random() < 0.72) {
			const holes = 1 + Math.floor(Math.random() * 3);
			ctx.fillStyle = VOID;
			for (let i = 0; i < holes; i += 1) {
				const size = cell * (1 + Math.floor(Math.random() * 2));
				const tile = pickGlyphTile(size, size);
				if (!tile) continue;
				ctx.fillRect(tile.x, tile.y, size, size);
			}
		}
	}

	function frame(now: number) {
		if (!running) return;
		if (!isGlitchActive()) {
			if (canvas) {
				ctx?.clearRect(0, 0, canvas.width, canvas.height);
			}
			raf = window.requestAnimationFrame(frame);
			return;
		}
		if (now - lastPattern >= PATTERN_MS) {
			lastPattern = now;
			updateItalic(now);
			drawGlitch();
		}
		raf = window.requestAnimationFrame(frame);
	}

	const mediaMobile = window.matchMedia('(max-width: 767px)');

	const rebuild = () => {
		if (paintSource()) drawGlitch();
	};

	const onViewportChange = () => {
		cleanupHeroGlitch?.();
		initHeroGlitch();
	};

	void document.fonts.ready.then(rebuild);

	const resizeObserver = new ResizeObserver(rebuild);
	resizeObserver.observe(textEl);

	const onLocaleChange = () => {
		cleanupHeroGlitch?.();
		initHeroGlitch();
	};

	const onIntroProgress = () => {
		rebuild();
	};

	document.addEventListener('i18n-applied', onLocaleChange);
	document.addEventListener('hero-intro-progress', onIntroProgress);
	mediaMobile.addEventListener('change', onViewportChange);

	raf = window.requestAnimationFrame(frame);

	cleanupHeroGlitch = () => {
		running = false;
		window.cancelAnimationFrame(raf);
		resizeObserver.disconnect();
		document.removeEventListener('i18n-applied', onLocaleChange);
		document.removeEventListener('hero-intro-progress', onIntroProgress);
		mediaMobile.removeEventListener('change', onViewportChange);
		textEl.style.fontStyle = '';
	};
}
