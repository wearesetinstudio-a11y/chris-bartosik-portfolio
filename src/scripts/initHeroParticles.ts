type Particle = {
	x: number;
	y: number;
	ox: number;
	oy: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	bucket: number;
	flickerFreq: number;
	flickerPhase: number;
	color: string;
	glitchTimer: number;
	glitchDur: number;
	glitchOx: number;
	glitchOy: number;
	glitchHidden: boolean;
	/** 0..1 — when during the circular field reveal this square pops in. */
	revealAt: number;
	/** 0..1 — scroll progress at which this square flips to the dark section color. */
	colorFlipAt: number;
};

type Spark = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	baseSize: number;
	alpha: number;
	baseAlpha: number;
	life: number;
	pullScale: number;
	falling: boolean;
	spray: boolean;
	gravity: number;
	color: string;
	fromWhite: boolean;
};

const REPULSE_RADIUS = 48;
const DAMPING = 0.78;
const MAX_FORCE = 7.2;
const BUCKETS = 8;
const MAX_SPARKS = 220;
const SPRAY_GRAVITY = 780;
/** Cursor trail squares — fall straight down, no bottom-center sink. */
const CURSOR_FALL_GRAVITY = 420;
const TAP_HOLD_MS = 520;
/** How long the clear hole eases back in after finger lift (seconds). */
const TAP_RELEASE_SEC = 1.35;
const TAP_RADIUS = 56;
const HOLD_EMIT_MS = 90;
const HOLD_EMIT_DELAY_MS = 180;
const DRAG_EMIT_PX = 10;
const SCROLL_INTENT_PX = 14;
/** Ignore tiny viewport jitter from mobile browser chrome (URL bar show/hide). */
const RESIZE_EPSILON_PX = 24;
/** Accent pixel block size in CSS pixels. */
const PIXEL_SIZE = 6;
/** Gap between squares (CSS px) — tight so the field reads dense, not screen-door. */
const PIXEL_GAP = 1;
const CELL_STRIDE = PIXEL_SIZE + PIXEL_GAP;
/** Exact ABOUT ME / primary CTA orange. */
const FIELD_COLOR = '#F54100';
/** Tools / site bg — field squares flip into this while scrolling. */
const FIELD_SCROLL_COLOR = '#131415';
/** Circular field reveal after hero content intro (seconds). */
const FIELD_REVEAL_SEC = 1.35;

function sparkSize() {
	return 3;
}

function fieldPixelSize() {
	return PIXEL_SIZE;
}

let cleanupHeroParticles: (() => void) | null = null;

function isMobileHero() {
	return (
		window.matchMedia('(pointer: coarse)').matches ||
		window.matchMedia('(max-width: 767px)').matches
	);
}

export function initHeroParticles() {
	const canvas = document.getElementById('hero-particles') as HTMLCanvasElement | null;
	const sparkCanvas = document.getElementById('hero-sparks') as HTMLCanvasElement | null;
	const hero = document.getElementById('hero-section');

	if (!canvas || !hero) {
		cleanupHeroParticles?.();
		cleanupHeroParticles = null;
		return;
	}

	if (canvas.dataset.particlesInit === 'true' && canvas.isConnected) return;

	cleanupHeroParticles?.();
	cleanupHeroParticles = null;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isTouch = window.matchMedia('(pointer: coarse)').matches;
	// desynchronized contexts often corrupt after mobile tab resume / app switch
	const ctx = canvas.getContext('2d', { alpha: true, desynchronized: false });
	if (!ctx) return;

	const sparkCtx =
		sparkCanvas?.getContext('2d', { alpha: true, desynchronized: false }) ?? ctx;

	canvas.dataset.particlesInit = 'true';
	if (sparkCanvas) sparkCanvas.dataset.sparksInit = 'true';

	const animate = !reduceMotion;

	let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	let width = 0;
	let height = 0;
	let glowOriginX = 0;
	let glowHeartX = 0;
	let glowHeartY = 0;
	let glowHeight = 0;
	let fieldMinY = 0;
	let particles: Particle[] = [];
	let buckets: Particle[][] = Array.from({ length: BUCKETS }, () => []);
	let sparks: Spark[] = [];
	let mouseX = -9999;
	let mouseY = -9999;
	let prevMouseX = -9999;
	let prevMouseY = -9999;
	let emitAcc = 0;
	let lastTime = 0;
	let rafId = 0;
	let visible = true;
	let mobileHero = isMobileHero();
	let activePointerId: number | null = null;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let lastDragEmitX = 0;
	let lastDragEmitY = 0;
	let isScrollGesture = false;
	let pointerHoldTimer = 0;
	let holdEmitTimer = 0;
	let motionTime = 0;
	let clipFrame = 0;
	let lastClipPath = '';
	/** 1 = full tap clear, 0 = none. Decays after finger lift for a soft return. */
	let tapClear = 0;
	let tapReleasing = false;
	/** False until hero content intro finishes — field stays hidden. */
	let fieldUnlocked = false;
	/** 0..1 circular reveal progress from corners + middle. */
	let revealT = 0;
	let revealActive = false;
	/** 0..1 — how far the hero has scrolled out; drives orange → dark flips. */
	let scrollColorProgress = 0;

	function clearRadius() {
		if (!mobileHero) return REPULSE_RADIUS;
		const t = Math.max(0, Math.min(1, tapClear));
		// Ease-out: hole stays large longer, then shrinks so squares ease back in.
		const eased = 1 - Math.pow(1 - t, 2.2);
		return TAP_RADIUS * (0.2 + 0.8 * eased);
	}

	/** Organic hover hole — jagged rim + soft scatter, not a perfect circle. */
	function shouldClearAt(drawX: number, drawY: number, radius: number, time: number) {
		const cx = drawX + PIXEL_SIZE * 0.5;
		const cy = drawY + PIXEL_SIZE * 0.5;
		const dx = cx - mouseX;
		const dy = cy - mouseY;
		const dist = Math.hypot(dx, dy);
		const ang = Math.atan2(dy, dx);
		const cellX = Math.round(drawX / CELL_STRIDE);
		const cellY = Math.round(drawY / CELL_STRIDE);
		const noisePhase = time * 1.8;
		const wobble =
			Math.sin(ang * 3.0 + cellX * 0.37 + noisePhase) * 0.11 +
			Math.sin(ang * 7.0 - cellY * 0.29 + noisePhase * 1.3) * 0.07 +
			((((cellX * 73856093) ^ (cellY * 19349663)) >>> 0) % 1000) / 1000 * 0.1 -
			0.05;
		const localR = radius * (0.88 + wobble);
		const feather = Math.max(CELL_STRIDE * 2.2, radius * 0.38);
		const inner = Math.max(0, localR - feather);

		if (dist < inner) return true;
		if (dist < localR + feather * 0.35) {
			const t = (dist - inner) / Math.max(1, localR + feather * 0.35 - inner);
			const rimNoise =
				(((cellX * 50331653) ^ (cellY * 12582917) ^ Math.floor(time * 9)) >>> 0) % 1000;
			const keepChance = t * t * (0.55 + (rimNoise / 1000) * 0.55);
			return rimNoise / 1000 > keepChance;
		}
		return false;
	}

	/**
	 * 0..1 spawn weight.
	 * Desktop: bottom-corner U framing. Mobile: wide shallow bottom arch.
	 */
	function bottomCornerWeight(x: number, y: number) {
		const maxX = Math.max(1, width - PIXEL_SIZE);
		const nx = x / maxX;
		const floorY = height - PIXEL_SIZE;
		const rise = (floorY - y) / Math.max(1, glowHeight);
		if (rise < 0 || rise > 1 || y < fieldMinY) return 0;

		const bottom = Math.pow(1 - rise, mobileHero ? 1.55 : 2.15);

		if (mobileHero) {
			// Wide shallow arch: dense bottom center, fades at sides, low peak.
			const centerDist = Math.abs(nx - 0.5) * 2; // 0 at center → 1 at edges
			const cosArch = Math.pow(Math.cos(centerDist * Math.PI * 0.5), 1.25);
			const archCeiling = 0.18 + cosArch * 0.82;
			if (rise > archCeiling) return 0;
			const archDepth = Math.max(0, 1 - rise / Math.max(0.08, archCeiling));
			const centerBias = 0.55 + 0.45 * cosArch;
			return Math.min(1, centerBias * (0.28 + Math.pow(archDepth, 1.2) * 0.9));
		}

		const edgeDist = Math.min(nx, 1 - nx);
		const strokeWidth = 0.03 + bottom * 0.28;
		const sideMask = Math.exp(-Math.pow(edgeDist / Math.max(0.001, strokeWidth), 1.75));
		if (sideMask < 0.04) return 0;

		return Math.min(1, sideMask * (0.25 + bottom * 1.05));
	}

	function homeFromWeight(x: number, y: number, weight: number) {
		// Always near-solid so #F54100 matches the CTA (no washed peach from low alpha).
		const alpha = 1;
		const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.floor(weight * BUCKETS)));
		return {
			x,
			y,
			size: fieldPixelSize(),
			alpha,
			bucket,
			color: FIELD_COLOR,
		};
	}

	function addFieldParticle(home: ReturnType<typeof homeFromWeight>, x = home.x, y = home.y) {
		const particle: Particle = {
			x,
			y,
			ox: home.x,
			oy: home.y,
			vx: 0,
			vy: 0,
			size: home.size,
			alpha: home.alpha,
			bucket: home.bucket,
			flickerFreq: 0.25 + Math.random() * 0.55,
			flickerPhase: Math.random() * Math.PI * 2,
			color: home.color,
			glitchTimer: 1.2 + Math.random() * 2.8,
			glitchDur: 0,
			glitchOx: 0,
			glitchOy: 0,
			glitchHidden: false,
			revealAt: 0,
			colorFlipAt: 0,
		};

		particles.push(particle);
		buckets[home.bucket].push(particle);
	}

	/**
	 * Delay each square by circular distance from the bottom-left and
	 * bottom-right corners — both wavefronts run at once (no middle start).
	 */
	function assignRevealTimes() {
		if (!particles.length) return;

		if (reduceMotion || (fieldUnlocked && revealT >= 1)) {
			for (const particle of particles) particle.revealAt = 0;
			return;
		}

		const floorY = height - PIXEL_SIZE;
		const origins = [
			{ x: 0, y: floorY },
			{ x: Math.max(0, width - PIXEL_SIZE), y: floorY },
		];

		let maxDist = 0;
		const dists = new Array<number>(particles.length);
		for (let i = 0; i < particles.length; i += 1) {
			const p = particles[i];
			let best = Infinity;
			for (const origin of origins) {
				const d = Math.hypot(p.ox - origin.x, p.oy - origin.y);
				if (d < best) best = d;
			}
			dists[i] = best;
			if (best > maxDist) maxDist = best;
		}

		maxDist = Math.max(1, maxDist);
		for (let i = 0; i < particles.length; i += 1) {
			const ring = dists[i] / maxDist;
			// Tiny jitter so squares read as one-by-one inside each ring.
			particles[i].revealAt = Math.min(1, ring * 0.9 + Math.random() * 0.1);
		}
	}

	function startFieldReveal() {
		if (fieldUnlocked && !revealActive && revealT >= 1) return;

		fieldUnlocked = true;
		if (reduceMotion || !animate) {
			revealT = 1;
			revealActive = false;
			assignRevealTimes();
			if (!animate) drawStatic();
			else startLoop();
			return;
		}

		revealT = 0;
		revealActive = true;
		assignRevealTimes();
		startLoop();
	}

	function resetFieldReveal() {
		fieldUnlocked = false;
		revealT = 0;
		revealActive = false;
		assignRevealTimes();
		ctx.clearRect(0, 0, width, height);
		if (sparkCtx !== ctx) sparkCtx.clearRect(0, 0, width, height);
	}

	/** Walk grid X from left edge through right edge (last column flush to width). */
	function forEachGridX(callback: (x: number) => void) {
		const maxX = width - PIXEL_SIZE;
		if (maxX < 0) return;
		let last = -1;
		for (let x = 0; x <= maxX; x += CELL_STRIDE) {
			callback(x);
			last = x;
		}
		if (last !== maxX) callback(maxX);
	}

	/** Walk grid Y from bottom edge upward (bottom row flush to height). */
	function forEachGridY(callback: (y: number) => void) {
		const maxY = height - PIXEL_SIZE;
		const minY = Math.max(fieldMinY, 0);
		if (maxY < minY) return;
		let last = -1;
		for (let y = maxY; y >= minY; y -= CELL_STRIDE) {
			callback(y);
			last = y;
		}
		if (last !== maxY) callback(maxY);
	}

	function spawnParticles() {
		particles = [];
		buckets = Array.from({ length: BUCKETS }, () => []);
		sparks = [];

		glowOriginX = width * 0.5;
		glowHeartX = glowOriginX;
		glowHeartY = height - 6;

		// Desktop: lower third. Mobile: short wide mound (~3 rows shorter than prior).
		fieldMinY = Math.ceil(height * (mobileHero ? 0.87 : 0.64));
		if (mobileHero) fieldMinY += CELL_STRIDE * 3;
		glowHeight = Math.max(CELL_STRIDE * 4, height - fieldMinY);

		const densityBoost = reduceMotion ? 0.65 : 1;
		const minKeep = reduceMotion ? 0.16 : mobileHero ? 0.08 : 0.06;
		const edgeBand = CELL_STRIDE * 2;
		const floorY = height - PIXEL_SIZE;
		const centerHalf = width * (mobileHero ? 0.42 : 0.22);
		// ~1 square of soft crest — density collapses so the top ends as sparse singles.
		const topFeather = CELL_STRIDE;

		forEachGridY((y) => {
			forEachGridX((x) => {
				const weight = bottomCornerWeight(x, y);
				if (weight <= minKeep) return;
				let keep = Math.min(1, Math.pow(weight, mobileHero ? 0.42 : 0.55) * densityBoost);
				const onSide = x <= edgeBand || x >= width - PIXEL_SIZE - edgeBand;
				const rowsFromFloor = Math.round((floorY - y) / CELL_STRIDE);
				const onBottom = rowsFromFloor <= (mobileHero ? 3 : 1);
				const inCenter = Math.abs(x + PIXEL_SIZE * 0.5 - width * 0.5) <= centerHalf;
				// Desktop: pin side/bottom corners. Mobile: glue a short dense base to the floor.
				const sidePin = !mobileHero && onSide && y > fieldMinY + topFeather * 4;
				if (mobileHero && onBottom) {
					const edgeFade = Math.pow(
						Math.max(0, 1 - Math.abs(x / Math.max(1, width - PIXEL_SIZE) - 0.5) * 2),
						0.85,
					);
					keep = Math.max(keep, (inCenter ? 0.98 : 0.55) * (0.35 + 0.65 * edgeFade));
				} else if (onBottom) keep = Math.max(keep, 0.94);
				else if (sidePin) keep = Math.max(keep, 0.94);

				// Feather the top ~1 cell so the silhouette dissolves instead of cutting sharp.
				const fromTop = y - fieldMinY;
				if (fromTop < topFeather * 2) {
					const t = Math.max(0, fromTop / (topFeather * 2));
					keep *= 0.1 + 0.5 * t * t;
				}

				if (Math.random() > keep) return;
				addFieldParticle(homeFromWeight(x, y, weight));
			});
		});

		assignRevealTimes();
		assignColorFlipTimes();
	}

	/**
	 * Bottom rows flip first (meet the dark section), with jitter so neighbors
	 * don't switch in lockstep — reads as one-by-one, not a hard wipe.
	 */
	function assignColorFlipTimes() {
		if (!particles.length) return;

		const range = Math.max(1, glowHeight);
		const floorY = height - PIXEL_SIZE;

		for (const particle of particles) {
			const fromBottom = Math.max(0, (floorY - particle.oy) / range);
			const jitter = (Math.random() - 0.5) * 0.24;
			particle.colorFlipAt = Math.min(1, Math.max(0, fromBottom + jitter));
		}
	}

	function updateScrollColorProgress() {
		const heroRect = hero.getBoundingClientRect();
		if (heroRect.height <= 0) {
			scrollColorProgress = 0;
			return;
		}

		const raw = Math.min(1, Math.max(0, -heroRect.top / heroRect.height));
		scrollColorProgress = Math.pow(raw, 1.1);
	}

	function fieldFillColor(particle: Particle) {
		return scrollColorProgress >= particle.colorFlipAt ? FIELD_SCROLL_COLOR : FIELD_COLOR;
	}

	function emitSpark(x: number, y: number, mvx: number, mvy: number, pullScale = 1) {
		if (sparks.length >= MAX_SPARKS) sparks.shift();

		const size = sparkSize();
		const alpha = 0.62 + Math.random() * 0.28;

		sparks.push({
			x,
			y,
			// Light cursor momentum, then slow gravity drop.
			vx: mvx * 4 + (Math.random() - 0.5) * 8,
			vy: Math.max(12, mvy * 4) + 18 + Math.random() * 28,
			size,
			baseSize: size,
			alpha,
			baseAlpha: alpha,
			life: 0,
			pullScale,
			falling: true,
			spray: false,
			gravity: CURSOR_FALL_GRAVITY * (0.85 + Math.random() * 0.2),
			color: '#F54100',
			fromWhite: false,
		});
	}

	/** Light radial spray that drifts down and leaves the bottom of the screen. */
	function emitSpray(x: number, y: number, count: number) {
		for (let n = 0; n < count; n += 1) {
			if (sparks.length >= MAX_SPARKS) sparks.shift();

			const size = sparkSize();
			const alpha = 0.7 + Math.random() * 0.28;
			const angle = -Math.PI * 0.15 + Math.random() * Math.PI * 1.3;
			const speed = 55 + Math.random() * 145;

			sparks.push({
				x: x + (Math.random() - 0.5) * 10,
				y: y + (Math.random() - 0.5) * 10,
				vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 36,
				vy: Math.sin(angle) * speed * 0.55 - (30 + Math.random() * 70),
				size,
				baseSize: size,
				alpha,
				baseAlpha: alpha,
				life: 0,
				pullScale: 1,
				falling: true,
				spray: true,
				gravity: SPRAY_GRAVITY * (0.85 + Math.random() * 0.35),
				color: '#F54100',
				fromWhite: false,
			});
		}
	}

	function sizeSurface(target: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		// Pin to the hero-bg box — top/left + exact size so the bottom row hits the section edge.
		target.style.top = '0';
		target.style.left = '0';
		target.style.right = 'auto';
		target.style.bottom = 'auto';
		target.style.width = `${width}px`;
		target.style.height = `${height}px`;
		const bufferW = Math.max(1, Math.round(width * dpr));
		const bufferH = Math.max(1, Math.round(height * dpr));

		// Assigning width/height resets the context (incl. transform)
		target.width = bufferW;
		target.height = bufferH;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, bufferW, bufferH);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		context.imageSmoothingEnabled = false;
	}

	function measureHeroSize() {
		const bg = hero.querySelector<HTMLElement>('.hero-bg');
		// Prefer the live section box so the field floor tracks 110svh (and layout) changes.
		const sectionRect = hero.getBoundingClientRect();
		const bgRect = bg?.getBoundingClientRect();
		const nextWidth = Math.max(
			1,
			Math.round(bgRect?.width || sectionRect.width || bg?.clientWidth || hero.clientWidth || window.innerWidth),
		);
		const nextHeight = Math.max(
			1,
			Math.round(bgRect?.height || sectionRect.height || bg?.clientHeight || hero.clientHeight || window.innerHeight),
		);
		return { nextWidth, nextHeight };
	}

	function syncHeroBgClip() {
		const bg = hero.querySelector<HTMLElement>('.hero-bg');
		if (!bg) return;

		const rect = hero.getBoundingClientRect();
		const viewH = window.innerHeight;
		const viewW = document.documentElement.clientWidth || window.innerWidth;

		if (rect.bottom <= 0 || rect.top >= viewH) {
			if (lastClipPath !== 'hidden') {
				bg.style.visibility = 'hidden';
				bg.style.clipPath = 'inset(100%)';
				lastClipPath = 'hidden';
			}
			return;
		}

		// Insets must be relative to the ELEMENT box. Never clip the bottom —
		// hero-bg can't paint past the section, and bottom inset was leaving a
		// white strip above Tools.
		const visibleTop = Math.max(0, rect.top);
		const visibleLeft = Math.max(0, rect.left);
		const visibleRight = Math.min(viewW, rect.right);

		let insetTop = Math.max(0, Math.round(visibleTop - rect.top));
		const insetBottom = 0;
		let insetLeft = Math.max(0, Math.round(visibleLeft - rect.left));
		let insetRight = Math.max(0, Math.round(rect.right - visibleRight));

		// Full-bleed: ignore 1–2px horizontal rounding noise.
		if (insetLeft <= 2 && insetRight <= 2) {
			insetLeft = 0;
			insetRight = 0;
		}

		const nextClip = `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px)`;

		if (nextClip === lastClipPath) return;

		bg.style.visibility = 'visible';
		bg.style.clipPath = nextClip;
		lastClipPath = nextClip;
	}

	function scheduleHeroBgClip() {
		if (clipFrame) return;
		clipFrame = window.requestAnimationFrame(() => {
			clipFrame = 0;
			syncHeroBgClip();
		});
	}

	function resize(force = false) {
		mobileHero = isMobileHero();
		const { nextWidth, nextHeight } = measureHeroSize();
		const nextDpr = Math.min(window.devicePixelRatio || 1, 1.5);
		if (
			!force &&
			particles.length &&
			nextDpr === dpr &&
			Math.abs(nextWidth - width) < RESIZE_EPSILON_PX &&
			Math.abs(nextHeight - height) < RESIZE_EPSILON_PX
		) {
			return;
		}

		width = nextWidth;
		height = nextHeight;
		sizeSurface(canvas, ctx);
		if (sparkCanvas && sparkCtx !== ctx) sizeSurface(sparkCanvas, sparkCtx);
		spawnParticles();
		lastTime = 0;
	}

	function tickGlitch(particle: Particle, dt: number) {
		if (particle.glitchDur > 0) {
			particle.glitchDur -= dt;
			if (particle.glitchDur <= 0) {
				particle.glitchDur = 0;
				particle.glitchOx = 0;
				particle.glitchOy = 0;
			}
			return;
		}

		particle.glitchTimer -= dt;
		if (particle.glitchTimer > 0) return;

		particle.glitchTimer = 1.4 + Math.random() * 3.2;
		// Horizontal tear only — vertical shifts open a white gap on the bottom edge.
		if (Math.random() < 0.22) {
			particle.glitchOx = (Math.random() < 0.5 ? -1 : 1) * CELL_STRIDE * (1 + (Math.random() < 0.22 ? 1 : 0));
			particle.glitchOy = 0;
			particle.glitchDur = 0.1 + Math.random() * 0.22;
			return;
		}

		particle.glitchOx = 0;
		particle.glitchOy = 0;
	}

	function drawFieldParticle(
		particle: Particle,
		_baseAlpha: number,
		time: number,
		pointerActive: boolean,
	) {
		if (!fieldUnlocked || particle.revealAt > revealT) return;

		const wave = 0.5 + 0.5 * Math.sin(time * particle.flickerFreq + particle.flickerPhase);
		// Stay in the solid CTA range — subtle shimmer only, never pale/peach.
		let alpha = 0.9 + 0.1 * wave;

		// Keep edge homes glued to the canvas bounds (no inset gap from glitch/mouse).
		const maxX = Math.max(0, width - PIXEL_SIZE);
		const maxY = Math.max(0, height - PIXEL_SIZE);
		let drawX = particle.x + particle.glitchOx;
		let drawY = particle.y + particle.glitchOy;
		// Only the true bottom row — snapping the row above caused the empty line.
		if (particle.oy >= maxY - 0.5) drawY = maxY;
		if (particle.ox <= 0.5) drawX = 0;
		if (particle.ox >= maxX - 0.5) drawX = maxX;
		drawX = Math.min(maxX, Math.max(0, drawX));
		drawY = Math.min(maxY, Math.max(0, drawY));

		// Organic hide near the cursor / tap — irregular rim, no soft alpha glow.
		const clearing = pointerActive || (mobileHero && tapClear > 0.02);
		if (clearing) {
			const radius = mobileHero ? clearRadius() : REPULSE_RADIUS;
			if (shouldClearAt(drawX, drawY, radius, time)) return;
		}

		ctx.globalAlpha = alpha;
		ctx.fillStyle = fieldFillColor(particle);
		ctx.fillRect(drawX, drawY, particle.size, particle.size);
	}

	function drawStatic() {
		updateScrollColorProgress();
		ctx.clearRect(0, 0, width, height);
		if (!fieldUnlocked) {
			ctx.globalAlpha = 1;
			return;
		}
		ctx.globalAlpha = 1;
		for (let i = 0; i < BUCKETS; i += 1) {
			for (const particle of buckets[i]) {
				if (particle.revealAt > revealT) continue;
				ctx.fillStyle = fieldFillColor(particle);
				ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
			}
		}
		ctx.globalAlpha = 1;
	}

	function draw(now: number) {
		if (!canvas.isConnected) {
			rafId = 0;
			return;
		}

		const dt = lastTime ? Math.min(0.033, (now - lastTime) / 1000) : 0.016;
		lastTime = now;

		updateScrollColorProgress();

		if (revealActive) {
			revealT = Math.min(1, revealT + dt / FIELD_REVEAL_SEC);
			if (revealT >= 1) revealActive = false;
		}

		const pointerActive = mouseX > -9000;
		const mouseActive = !mobileHero && pointerActive;

		if (mobileHero && tapReleasing && tapClear > 0) {
			tapClear = Math.max(0, tapClear - dt / TAP_RELEASE_SEC);
			if (tapClear <= 0.001) {
				tapClear = 0;
				tapReleasing = false;
				onLeave();
			}
		}

		if (mouseActive && prevMouseX > -9000) {
			const mvx = mouseX - prevMouseX;
			const mvy = mouseY - prevMouseY;
			const speed = Math.hypot(mvx, mvy) / Math.max(dt, 0.008);

			if (speed > 18) {
				emitAcc += dt * (0.05 + (speed / 280) ** 1.2 * 0.85);
				while (emitAcc >= 1 && sparks.length < MAX_SPARKS) {
					emitSpark(mouseX, mouseY, mvx, mvy, 1.05);
					emitAcc -= 1;
				}
			} else {
				emitAcc *= 0.55;
			}
		}

		prevMouseX = mouseX;
		prevMouseY = mouseY;

		motionTime += dt;
		const t = motionTime;

		for (const particle of particles) {
			if (!reduceMotion) tickGlitch(particle, dt);

			const clearing = pointerActive || (mobileHero && tapClear > 0.02);
			if (clearing) {
				const radius = mobileHero ? clearRadius() : REPULSE_RADIUS;
				const radiusSq = radius * radius;
				const dx = particle.ox + particle.vx - mouseX;
				const dy = particle.oy + particle.vy - mouseY;
				const distSq = dx * dx + dy * dy;

				if (distSq < radiusSq && distSq > 0.0001) {
					const dist = Math.sqrt(distSq);
					const force = ((radius - dist) / radius) * MAX_FORCE * (mobileHero ? 0.55 + 0.45 * tapClear : 1);
					particle.vx += (dx / dist) * force;
					particle.vy += (dy / dist) * force;
				}
			}

			// Softer settle after a tap so squares ease home instead of snapping.
			const damp = mobileHero && tapReleasing ? 0.9 : DAMPING;
			particle.vx *= damp;
			particle.vy *= damp;
			// Homes stay on the non-overlapping grid; only cursor force offsets them.
			particle.x = particle.ox + particle.vx;
			particle.y = particle.oy + particle.vy;
		}

		for (let i = sparks.length - 1; i >= 0; i -= 1) {
			const spark = sparks[i];
			spark.life += dt;

			if (spark.fromWhite) {
				const t = Math.min(1, spark.life / 0.55);
				const r = Math.round(255 + (245 - 255) * t);
				const g = Math.round(255 + (65 - 255) * t);
				const b = Math.round(255 + (0 - 255) * t);
				spark.color = `rgb(${r},${g},${b})`;
			}

			if (spark.spray) {
				spark.vy += spark.gravity * dt;
				spark.vx *= 0.992;
				spark.x += spark.vx * dt;
				spark.y += spark.vy * dt;
				spark.alpha = spark.baseAlpha * Math.max(0, 1 - spark.life / 2.4);
				spark.size = spark.baseSize;

				if (spark.y >= height + 24 || spark.life > 2.5 || spark.alpha <= 0.02) {
					sparks.splice(i, 1);
				}
				continue;
			}

			// Cursor trail: drop straight down under the pointer (no center sink).
			spark.vy += spark.gravity * dt;
			spark.vx *= 0.99;
			spark.x += spark.vx * dt;
			spark.y += spark.vy * dt;
			spark.alpha = spark.baseAlpha * Math.max(0, 1 - spark.life / 3.4);
			spark.size = spark.baseSize;

			if (spark.y >= height + 24 || spark.life > 3.6 || spark.alpha <= 0.02) {
				sparks.splice(i, 1);
			}
		}

		ctx.clearRect(0, 0, width, height);

		if (fieldUnlocked) {
			for (let i = 0; i < BUCKETS; i += 1) {
				const baseAlpha = (i + 0.55) / BUCKETS;
				const group = buckets[i];
				for (let j = 0; j < group.length; j += 1) {
					drawFieldParticle(group[j], baseAlpha, t, pointerActive);
				}
			}
		}

		ctx.globalAlpha = 1;

		if (sparkCtx !== ctx) {
			sparkCtx.clearRect(0, 0, width, height);
		}

		for (const spark of sparks) {
			sparkCtx.fillStyle = spark.color;
			sparkCtx.globalAlpha = spark.alpha;
			sparkCtx.fillRect(spark.x, spark.y, spark.size, spark.size);
		}

		sparkCtx.globalAlpha = 1;

		if (visible && !document.hidden && animate) {
			rafId = window.requestAnimationFrame(draw);
			return;
		}

		rafId = 0;
	}

	function startLoop() {
		if (!rafId && visible && !document.hidden && animate) {
			rafId = window.requestAnimationFrame(draw);
		}
	}

	function setPointerFromClient(clientX: number, clientY: number) {
		const rect = canvas.getBoundingClientRect();
		mouseX = clientX - rect.left;
		mouseY = clientY - rect.top;
	}

	function onMove(event: MouseEvent) {
		const rect = hero.getBoundingClientRect();
		if (
			event.clientX < rect.left ||
			event.clientX > rect.right ||
			event.clientY < rect.top ||
			event.clientY > rect.bottom
		) {
			if (mouseX > -9000) onLeave();
			return;
		}

		setPointerFromClient(event.clientX, event.clientY);
	}

	function onLeave() {
		mouseX = -9999;
		mouseY = -9999;
		prevMouseX = -9999;
		prevMouseY = -9999;
		emitAcc = 0;
		if (!tapReleasing) {
			tapClear = 0;
		}
	}

	function emitTapBurst() {
		emitSpray(mouseX, mouseY, 14 + Math.floor(Math.random() * 10));
	}

	function clearPointerHold() {
		window.clearTimeout(pointerHoldTimer);
		pointerHoldTimer = 0;
	}

	function clearHoldEmit() {
		window.clearInterval(holdEmitTimer);
		holdEmitTimer = 0;
	}

	function startHoldEmit() {
		clearHoldEmit();
		holdEmitTimer = window.setInterval(() => {
			if (activePointerId === null || isScrollGesture) {
				clearHoldEmit();
				return;
			}
			emitSpray(mouseX, mouseY, 3 + Math.floor(Math.random() * 3));
		}, HOLD_EMIT_MS);
	}

	function onPointerDown(event: PointerEvent) {
		const target = event.target as HTMLElement | null;
		const onCta = Boolean(target?.closest('.hero-cta') && hero.contains(target));
		const onPillar = Boolean(target?.closest('.hero-pillar') && hero.contains(target));

		if (!mobileHero && event.pointerType === 'mouse') {
			return;
		}

		activePointerId = event.pointerId;
		pointerStartX = event.clientX;
		pointerStartY = event.clientY;
		lastDragEmitX = event.clientX;
		lastDragEmitY = event.clientY;
		isScrollGesture = false;
		clearPointerHold();
		clearHoldEmit();
		tapReleasing = false;
		tapClear = mobileHero ? 1 : 0;
		setPointerFromClient(event.clientX, event.clientY);
		startLoop();

		// Mobile field tap: squares clear around the finger (like hover). Skip CTA / pillars.
		if (!onCta && !mobileHero && !onPillar) {
			emitTapBurst();
		}

		pointerHoldTimer = window.setTimeout(() => {
			pointerHoldTimer = 0;
			if (activePointerId === null || isScrollGesture) return;
			if (!mobileHero) startHoldEmit();
		}, HOLD_EMIT_DELAY_MS);
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerId !== activePointerId || isScrollGesture) return;

		const dx = event.clientX - pointerStartX;
		const dy = event.clientY - pointerStartY;

		if (Math.abs(dy) > SCROLL_INTENT_PX && Math.abs(dy) > Math.abs(dx) * 1.15) {
			isScrollGesture = true;
			activePointerId = null;
			clearPointerHold();
			clearHoldEmit();
			tapReleasing = false;
			tapClear = 0;
			onLeave();
			return;
		}

		setPointerFromClient(event.clientX, event.clientY);

		if (mobileHero) {
			lastDragEmitX = event.clientX;
			lastDragEmitY = event.clientY;
		} else {
			const dragDx = event.clientX - lastDragEmitX;
			const dragDy = event.clientY - lastDragEmitY;
			const dragDist = Math.hypot(dragDx, dragDy);

			if (dragDist >= DRAG_EMIT_PX) {
				const steps = Math.min(4, Math.floor(dragDist / DRAG_EMIT_PX));
				emitSpray(mouseX, mouseY, steps + 1 + Math.floor(Math.random() * 2));
				lastDragEmitX = event.clientX;
				lastDragEmitY = event.clientY;
			}
		}
	}

	function onPointerEnd(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;

		activePointerId = null;
		clearHoldEmit();

		if (isScrollGesture) {
			clearPointerHold();
			tapReleasing = false;
			tapClear = 0;
			onLeave();
			return;
		}

		setPointerFromClient(event.clientX, event.clientY);
		clearPointerHold();

		if (mobileHero) {
			// Hold the hole briefly, then ease radius down so squares return smoothly.
			tapClear = 1;
			tapReleasing = false;
			pointerHoldTimer = window.setTimeout(() => {
				tapReleasing = true;
				pointerHoldTimer = 0;
				startLoop();
			}, TAP_HOLD_MS);
			return;
		}

		pointerHoldTimer = window.setTimeout(() => {
			onLeave();
			pointerHoldTimer = 0;
		}, TAP_HOLD_MS);
	}

	let resizeFrame = 0;
	let resyncTimers: number[] = [];

	function onScroll() {
		scheduleHeroBgClip();
		updateScrollColorProgress();
		if (!animate) {
			drawStatic();
			return;
		}
		startLoop();
	}

	function onResize() {
		if (resizeFrame) return;
		resizeFrame = window.requestAnimationFrame(() => {
			resizeFrame = 0;
			resize();
			syncHeroBgClip();
			if (!animate) drawStatic();
		});
	}

	function clearResyncTimers() {
		for (const id of resyncTimers) window.clearTimeout(id);
		resyncTimers = [];
	}

	function resyncSurfaces() {
		lastTime = 0;

		const run = () => {
			// Soft resize: only rebuild the field when the canvas size actually changed.
			resize(false);
			if (!animate) {
				drawStatic();
				return;
			}
			startLoop();
		};

		clearResyncTimers();
		run();
		// Mobile browsers often settle visualViewport / chrome UI a frame or two later.
		resyncTimers.push(
			window.setTimeout(run, 0),
			window.setTimeout(run, 80),
			window.setTimeout(run, 250),
		);
	}

	function resumeAfterBackground() {
		// Tab focus must NOT respawn particles — that looks like a teleport jump.
		lastTime = 0;
		if (!animate) {
			drawStatic();
			return;
		}
		startLoop();
	}

	function onVisibilityChange() {
		if (document.hidden) {
			if (rafId) {
				window.cancelAnimationFrame(rafId);
				rafId = 0;
			}
			lastTime = 0;
			return;
		}
		resumeAfterBackground();
	}

	function onPageShow() {
		resumeAfterBackground();
	}

	function onViewportResize() {
		// Only react to real orientation / window changes — not URL-bar scroll jitter.
		onResize();
	}

	resize(true);
	syncHeroBgClip();

	function onHeroContentIntroComplete() {
		startFieldReveal();
	}

	function onHeroContentIntroReset() {
		resetFieldReveal();
	}

	document.addEventListener('hero-content-intro-complete', onHeroContentIntroComplete);
	document.addEventListener('hero-content-intro-reset', onHeroContentIntroReset);
	if (hero.classList.contains('is-hero-intro-complete')) {
		startFieldReveal();
	}

	if (animate) {
		draw(performance.now());
	} else {
		drawStatic();
	}

	function refreshForReveal() {
		resize(true);
		syncHeroBgClip();
		if (animate) {
			visible = true;
			if (!rafId) draw(performance.now());
			return;
		}
		drawStatic();
	}

	window.addEventListener('intro-revealing', refreshForReveal, { once: true });

	if (!reduceMotion) {
		if (!mobileHero) {
			window.addEventListener('mousemove', onMove, { passive: true });
		}

		hero.addEventListener('pointerdown', onPointerDown, { passive: true });
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerup', onPointerEnd, { passive: true });
		window.addEventListener('pointercancel', onPointerEnd, { passive: true });
	}

	window.addEventListener('resize', onResize, { passive: true });
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('pageshow', onPageShow);
	document.addEventListener('visibilitychange', onVisibilityChange);
	window.visualViewport?.addEventListener('resize', onViewportResize, { passive: true });

	const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
	const heroBg = hero.querySelector<HTMLElement>('.hero-bg');
	resizeObserver?.observe(hero);
	if (heroBg) resizeObserver?.observe(heroBg);

	const observer = new IntersectionObserver(
		(entries) => {
			visible = entries.some((entry) => entry.isIntersecting);
			if (!animate) {
				if (visible) drawStatic();
				return;
			}
			if (visible) {
				lastTime = 0;
				startLoop();
			} else if (rafId) {
				window.cancelAnimationFrame(rafId);
				rafId = 0;
			}
		},
		{ threshold: 0.02, rootMargin: '0px' },
	);

	observer.observe(hero);

	cleanupHeroParticles = () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		if (resizeFrame) {
			window.cancelAnimationFrame(resizeFrame);
			resizeFrame = 0;
		}
		clearResyncTimers();
		clearPointerHold();
		clearHoldEmit();
		observer.disconnect();
		resizeObserver?.disconnect();
		window.removeEventListener('intro-revealing', refreshForReveal);
		document.removeEventListener('hero-content-intro-complete', onHeroContentIntroComplete);
		document.removeEventListener('hero-content-intro-reset', onHeroContentIntroReset);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerEnd);
		window.removeEventListener('pointercancel', onPointerEnd);
		window.removeEventListener('resize', onResize);
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('pageshow', onPageShow);
		document.removeEventListener('visibilitychange', onVisibilityChange);
		window.visualViewport?.removeEventListener('resize', onViewportResize);
		if (clipFrame) {
			window.cancelAnimationFrame(clipFrame);
			clipFrame = 0;
		}
		window.removeEventListener('mousemove', onMove);
		hero.removeEventListener('pointerdown', onPointerDown);
		const bg = hero.querySelector<HTMLElement>('.hero-bg');
		if (bg) {
			bg.style.clipPath = '';
			bg.style.visibility = '';
		}
		lastClipPath = '';
		delete canvas.dataset.particlesInit;
		if (sparkCanvas) {
			delete sparkCanvas.dataset.particlesInit;
			delete sparkCanvas.dataset.sparksInit;
		}
	};
}
