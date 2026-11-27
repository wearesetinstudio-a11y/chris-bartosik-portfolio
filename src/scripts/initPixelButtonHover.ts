const SELECTOR = '[data-pixel-hover]';
const PIXEL = 6;
const FILL_MS = 420;
const CLEAR_MS = 280;
const GLITCH_PHASE_MS = 160;
/** Only this fraction of grid cells ever paint — same square size, fewer of them. */
const CELL_DENSITY = 0.42;

type PixelButton = {
	el: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	cols: number;
	rows: number;
	w: number;
	h: number;
	dpr: number;
	/** Stable 0–1 rank per cell for organic fill order. */
	rank: Float32Array;
	/** Palette of fill colors (css). */
	colors: string[];
	progress: number;
	target: number;
	hovering: boolean;
	raf: number;
	lastTs: number;
	phase: number;
};

const instances = new WeakMap<HTMLElement, PixelButton>();
let pageBound = false;

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function finePointer() {
	return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function parsePalette(el: HTMLElement): string[] {
	const raw = el.dataset.pixelPalette?.trim();
	if (raw) {
		return raw
			.split(',')
			.map((c) => c.trim())
			.filter(Boolean);
	}
	const theme = el.dataset.pixelHover || 'dark';
	if (theme === 'orange') {
		// Slight shifts around brand orange (#f54100)
		return ['#f04800', '#e83e00', '#f54b08', '#ee3f00', '#f54100', '#e64405'];
	}
	if (theme === 'ink') {
		// Soft charcoal steps over light modal button
		return ['#e4e4e4', '#dcdcdc', '#e8e8e8', '#d6d6d6', '#e0e0e0', '#cfcfcf'];
	}
	// dark — near-base charcoal (#252628), barely-there mosaic
	return ['#2a2b2d', '#28292b', '#2c2d2f', '#262729', '#2d2e30', '#292a2c', '#2b2c2e'];
}

/** Delay from nearest edge — fill collapses inward from all sides at once. */
function cellDelay(col: number, row: number, cols: number, rows: number, rank: number) {
	const maxCol = Math.max(1, cols - 1);
	const maxRow = Math.max(1, rows - 1);
	const fromLeft = col / maxCol;
	const fromRight = (maxCol - col) / maxCol;
	const fromTop = row / maxRow;
	const fromBottom = (maxRow - row) / maxRow;
	const fromEdge = Math.min(fromLeft, fromRight, fromTop, fromBottom);

	return fromEdge * 0.82 + rank * 0.18;
}

function hash(n: number) {
	n = (n ^ 0xdeadbeef) >>> 0;
	n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
	n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
	return (n ^ (n >>> 16)) >>> 0;
}

function ensureCanvas(el: HTMLElement): HTMLCanvasElement {
	let canvas = el.querySelector<HTMLCanvasElement>(':scope > .pixel-hover-canvas');
	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.className = 'pixel-hover-canvas';
		canvas.setAttribute('aria-hidden', 'true');
		el.prepend(canvas);
	}
	return canvas;
}

function rebuild(state: PixelButton) {
	const rect = state.el.getBoundingClientRect();
	const w = Math.max(1, Math.round(rect.width));
	const h = Math.max(1, Math.round(rect.height));
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const cols = Math.max(1, Math.ceil(w / PIXEL));
	const rows = Math.max(1, Math.ceil(h / PIXEL));

	state.w = w;
	state.h = h;
	state.dpr = dpr;
	state.cols = cols;
	state.rows = rows;
	state.colors = parsePalette(state.el);

	state.canvas.width = Math.round(w * dpr);
	state.canvas.height = Math.round(h * dpr);
	state.canvas.style.width = `${w}px`;
	state.canvas.style.height = `${h}px`;

	const rank = new Float32Array(cols * rows);
	for (let i = 0; i < rank.length; i += 1) {
		rank[i] = (hash(i * 2654435761) % 10000) / 10000;
	}
	state.rank = rank;
}

function paint(state: PixelButton, _now: number) {
	const { ctx, cols, rows, w, h, dpr, rank, colors, progress, hovering, phase } = state;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, w, h);
	if (progress <= 0.001) return;

	ctx.imageSmoothingEnabled = false;

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
			const i = row * cols + col;
			// Skip most cells so the mosaic stays airy (size unchanged).
			if (rank[i] > CELL_DENSITY) continue;

			const delay = cellDelay(col, row, cols, rows, rank[i]);
			// Cell turns on once the wave passes its delay.
			const local = (progress - delay) / 0.22;
			if (local <= 0) continue;

			const on = local >= 1;
			if (!on) {
				// Leading edge: sparse random squares popping in.
				const edgeChance = 0.25 + local * 0.75;
				const edgeHash = hash(i * 97 + phase * 31) % 1000;
				if (edgeHash / 1000 > edgeChance) continue;
			}

			if (hovering && progress > 0.55) {
				// Soft glitch: only a few squares flicker while hovered.
				const g = hash(i * 83492791 + phase * 39916801) % 1000;
				if (g < 18) continue;
				if (g > 985) {
					ctx.fillStyle = colors[colors.length - 1] || colors[0];
					ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
					continue;
				}
			}

			const colorIndex = hash(i * 2246822519 + Math.floor(phase / 3) * 17) % colors.length;
			ctx.fillStyle = colors[colorIndex];
			ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
		}
	}
}

function tick(state: PixelButton, now: number) {
	const dt = state.lastTs ? Math.min(48, now - state.lastTs) : 16;
	state.lastTs = now;

	const speed = state.target > state.progress ? 1000 / FILL_MS : 1000 / CLEAR_MS;
	if (state.progress < state.target) {
		state.progress = Math.min(state.target, state.progress + speed * (dt / 1000));
	} else if (state.progress > state.target) {
		state.progress = Math.max(state.target, state.progress - speed * (dt / 1000));
	}

	if (state.hovering || state.progress > 0.01) {
		state.phase = Math.floor(now / GLITCH_PHASE_MS);
	}

	paint(state, now);

	const animating = Math.abs(state.progress - state.target) > 0.001;
	const needsLoop = state.hovering || animating || state.progress > 0.001;
	if (needsLoop) {
		state.raf = requestAnimationFrame((t) => tick(state, t));
	} else {
		state.raf = 0;
		state.lastTs = 0;
		state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
		state.el.classList.remove('is-pixel-hover');
	}
}

function startLoop(state: PixelButton) {
	if (state.raf) return;
	state.lastTs = 0;
	state.raf = requestAnimationFrame((t) => tick(state, t));
}

function onEnter(state: PixelButton, event: PointerEvent) {
	if (event.pointerType === 'touch') return;
	if (!finePointer() || prefersReducedMotion()) return;

	rebuild(state);
	state.hovering = true;
	state.target = 1;
	state.el.classList.add('is-pixel-hover');
	startLoop(state);
}

function onLeave(state: PixelButton) {
	if (!state.hovering && state.target === 0) return;
	state.hovering = false;
	state.target = 0;
	// Drop CSS hover class immediately so arrow/label ease out like hero CTAs,
	// while the pixel fill can still clear on its own.
	state.el.classList.remove('is-pixel-hover');
	startLoop(state);
}

function bind(el: HTMLElement) {
	if (el.dataset.pixelBound === 'true') return;
	el.dataset.pixelBound = 'true';

	if (getComputedStyle(el).position === 'static') {
		el.style.position = 'relative';
	}

	const canvas = ensureCanvas(el);
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const state: PixelButton = {
		el,
		canvas,
		ctx,
		cols: 1,
		rows: 1,
		w: 1,
		h: 1,
		dpr: 1,
		rank: new Float32Array(1),
		colors: parsePalette(el),
		progress: 0,
		target: 0,
		hovering: false,
		raf: 0,
		lastTs: 0,
		phase: 0,
	};
	instances.set(el, state);
	rebuild(state);

	el.addEventListener('pointerenter', (event) => onEnter(state, event));
	el.addEventListener('pointerleave', () => onLeave(state));

	el.addEventListener('focusin', () => {
		if (!finePointer() || prefersReducedMotion()) return;
		if (!el.matches(':focus-visible')) return;
		rebuild(state);
		state.hovering = true;
		state.target = 1;
		state.el.classList.add('is-pixel-hover');
		startLoop(state);
	});

	el.addEventListener('focusout', () => onLeave(state));
}

export function initPixelButtonHover() {
	document.querySelectorAll<HTMLElement>(SELECTOR).forEach(bind);

	if (pageBound) return;
	pageBound = true;

	window.addEventListener(
		'resize',
		() => {
			document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
				const state = instances.get(el);
				if (state) rebuild(state);
			});
		},
		{ passive: true },
	);
}
