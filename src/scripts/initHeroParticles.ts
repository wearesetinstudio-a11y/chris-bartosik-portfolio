type Particle = {
	x: number;
	y: number;
	ox: number;
	oy: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	phase: number;
	freq: number;
	amp: number;
	bucket: number;
	zone: 'bottom' | 'top';
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
	fountain: boolean;
	falling: boolean;
	spray: boolean;
	gravity: number;
	color: string;
	fromWhite: boolean;
};

const REPULSE_RADIUS = 170;
const REPULSE_RADIUS_SQ = REPULSE_RADIUS * REPULSE_RADIUS;
const DAMPING = 0.82;
const MAX_FORCE = 5.4;
const BUCKETS = 8;
const MAX_SPARKS = 220;
const HEART_FADE = 18;
const CTA_HOVER_EMIT_INTERVAL = 0.11;
const CTA_FALL_GRAVITY = 520;
const SPRAY_GRAVITY = 780;
const TAP_HOLD_MS = 520;
const HOLD_EMIT_MS = 90;
const HOLD_EMIT_DELAY_MS = 180;
const DRAG_EMIT_PX = 10;
const SCROLL_INTENT_PX = 14;
const TOP_DRIP_INTERVAL = 0.42;
const SCROLL_BOOST_DECAY = 1.2;
const SCROLL_BOOST_MAX = 1;
const SCROLL_SPEED_REF = 1600;

function sparkSize() {
	return 2;
}

function gauss() {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
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

	const animate = !reduceMotion;

	let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	let width = 0;
	let height = 0;
	let glowOriginX = 0;
	let glowHeartX = 0;
	let glowHeartY = 0;
	let glowHeight = 0;
	let topGlowHeight = 0;
	let particles: Particle[] = [];
	let buckets: Particle[][] = Array.from({ length: BUCKETS }, () => []);
	let sparks: Spark[] = [];
	let mouseX = -9999;
	let mouseY = -9999;
	let prevMouseX = -9999;
	let prevMouseY = -9999;
	let emitAcc = 0;
	let topDripAcc = 0;
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
	let hoveredCta: HTMLElement | null = null;
	let hoverEmitAcc = 0;
	let scrollBoost = 0;
	let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
	let lastScrollSample = 0;
	let motionTime = 0;

	const ctaButtons = [...hero.querySelectorAll<HTMLElement>('.hero-cta')];

	function sampleGlowHome() {
		const rise = Math.pow(Math.random(), 1.55);
		const y = height - rise * glowHeight + gauss() * 3;
		const bottomWeight = 1 - rise;
		const sigma = width * (0.14 + bottomWeight * 0.3);
		const x = glowOriginX + gauss() * sigma;
		const core = Math.pow(Math.max(0, bottomWeight), 1.45);
		const edge = Math.exp(-Math.pow((x - glowOriginX) / (width * 0.48), 2));
		const alpha = (0.05 + core * 0.72) * (0.32 + edge * 0.68);
		const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.floor(alpha * BUCKETS)));

		return {
			x,
			y,
			size: sparkSize(),
			alpha,
			bucket,
			zone: 'bottom' as const,
		};
	}

	/** Inverted cone along the top edge — fewer / shallower than the bottom glow. */
	function sampleTopGlowHome() {
		const drop = Math.pow(Math.random(), 2.05);
		const y = drop * topGlowHeight + gauss() * 2.4;
		const topWeight = 1 - drop;
		const sigma = width * (0.1 + topWeight * 0.3);
		const x = glowOriginX + gauss() * sigma;
		const core = Math.pow(Math.max(0, topWeight), 1.7);
		const edge = Math.exp(-Math.pow((x - glowOriginX) / (width * 0.42), 2));
		const alpha = (0.04 + core * 0.55) * (0.28 + edge * 0.72);
		const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.floor(alpha * BUCKETS)));

		return {
			x,
			y,
			size: sparkSize(),
			alpha,
			bucket,
			zone: 'top' as const,
		};
	}

	function addFieldParticle(
		home: ReturnType<typeof sampleGlowHome> | ReturnType<typeof sampleTopGlowHome>,
		x = home.x,
		y = home.y,
	) {
		const particle: Particle = {
			x,
			y,
			ox: home.x,
			oy: home.y,
			vx: 0,
			vy: 0,
			size: home.size,
			alpha: home.alpha,
			phase: Math.random() * Math.PI * 2,
			freq: 0.95 + Math.random() * 1.55,
			amp: 2.4 + Math.random() * 4.2,
			bucket: home.bucket,
			zone: home.zone,
		};

		particles.push(particle);
		buckets[home.bucket].push(particle);
	}

	function spawnParticles() {
		const bottomCount = reduceMotion ? 1200 : isTouch ? 2800 : 7000;
		const topCount = reduceMotion ? 260 : isTouch ? 560 : 1500;
		particles = [];
		buckets = Array.from({ length: BUCKETS }, () => []);
		sparks = [];
		topDripAcc = 0;

		glowOriginX = width * 0.5;
		glowHeartX = glowOriginX;
		glowHeartY = height - 6;
		glowHeight = height * 0.72;
		topGlowHeight = Math.min(height * 0.24, 220);

		for (let i = 0; i < bottomCount; i += 1) {
			addFieldParticle(sampleGlowHome());
		}

		for (let i = 0; i < topCount; i += 1) {
			addFieldParticle(sampleTopGlowHome());
		}
	}

	function dripTopParticle() {
		const tops: Particle[] = [];
		for (const particle of particles) {
			if (particle.zone === 'top') tops.push(particle);
		}
		if (!tops.length) return;

		const count = 1 + (Math.random() < 0.35 ? 1 : 0);
		for (let n = 0; n < count; n += 1) {
			const particle = tops[Math.floor(Math.random() * tops.length)];
			emitSpark(
				particle.x,
				particle.y,
				(Math.random() - 0.5) * 18,
				28 + Math.random() * 55,
				1.15,
			);

			const home = sampleTopGlowHome();
			particle.ox = home.x;
			particle.oy = home.y;
			particle.x = home.x;
			particle.y = home.y;
			particle.vx = 0;
			particle.vy = 0;
			particle.alpha = home.alpha;
		}
	}

	function emitSpark(x: number, y: number, mvx: number, mvy: number, pullScale = 1) {
		if (sparks.length >= MAX_SPARKS) sparks.shift();

		const size = sparkSize();
		const alpha = 0.62 + Math.random() * 0.28;

		sparks.push({
			x,
			y,
			vx: mvx * 0.28,
			vy: mvy * 0.28,
			size,
			baseSize: size,
			alpha,
			baseAlpha: alpha,
			life: 0,
			pullScale,
			fountain: false,
			falling: false,
			spray: false,
			gravity: 0,
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
				fountain: false,
				falling: true,
				spray: true,
				gravity: SPRAY_GRAVITY * (0.85 + Math.random() * 0.35),
				color: '#F54100',
				fromWhite: false,
			});
		}
	}

	function getCtaBox(cta: HTMLElement | null) {
		if (!cta) return null;

		const canvasRect = canvas.getBoundingClientRect();
		const rect = cta.getBoundingClientRect();

		return {
			x: rect.left - canvasRect.left,
			y: rect.top - canvasRect.top,
			w: rect.width,
			h: rect.height,
		};
	}

	/** Few particles leave the CTA and stream straight down off-screen at bottom center. */
	function emitCtaFall(cta: HTMLElement | null, count: number) {
		const box = getCtaBox(cta);
		if (!box) return;

		const fromWhite = cta?.classList.contains('hero-cta--secondary') === true;
		const color = fromWhite ? '#FFFFFF' : '#F54100';
		const targetX = glowHeartX;
		const targetY = height + 36;

		for (let n = 0; n < count; n += 1) {
			if (sparks.length >= MAX_SPARKS) sparks.shift();

			const size = sparkSize();
			const alpha = 0.82 + Math.random() * 0.18;
			const x = box.x + box.w * (0.2 + Math.random() * 0.6);
			const y = box.y + box.h * (0.35 + Math.random() * 0.55);
			const dx = targetX - x;
			const dy = targetY - y;
			const dist = Math.hypot(dx, dy) || 1;
			const speed = 320 + Math.random() * 220;

			sparks.push({
				x,
				y,
				vx: (dx / dist) * speed * (0.08 + Math.random() * 0.12) + (Math.random() - 0.5) * 28,
				vy: (dy / dist) * speed * (0.9 + Math.random() * 0.2),
				size,
				baseSize: size,
				alpha,
				baseAlpha: alpha,
				life: 0,
				pullScale: 1,
				fountain: true,
				falling: true,
				spray: false,
				gravity: CTA_FALL_GRAVITY,
				color,
				fromWhite,
			});
		}
	}

	function sizeSurface(target: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		const bufferW = Math.max(1, Math.floor(width * dpr));
		const bufferH = Math.max(1, Math.floor(height * dpr));

		// Assigning width/height resets the context (incl. transform)
		target.width = bufferW;
		target.height = bufferH;
		// Lock CSS box to the measured logical size so the bitmap never stretches
		// after mobile chrome UI / tab-resume viewport changes.
		target.style.width = `${width}px`;
		target.style.height = `${height}px`;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, bufferW, bufferH);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		context.imageSmoothingEnabled = false;
	}

	function measureHeroSize() {
		const rect = hero.getBoundingClientRect();
		return {
			nextWidth: Math.max(1, Math.floor(rect.width)),
			nextHeight: Math.max(1, Math.floor(rect.height)),
		};
	}

	function resize(force = false) {
		mobileHero = isMobileHero();
		const { nextWidth, nextHeight } = measureHeroSize();
		const nextDpr = Math.min(window.devicePixelRatio || 1, 1.5);
		if (
			!force &&
			nextWidth === width &&
			nextHeight === height &&
			nextDpr === dpr &&
			particles.length
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

	function drawStatic() {
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#F54100';
		for (let i = 0; i < BUCKETS; i += 1) {
			ctx.globalAlpha = (i + 0.55) / BUCKETS;
			for (const particle of buckets[i]) {
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

		const pointerActive = mouseX > -9000;
		const mouseActive = !mobileHero && pointerActive;

		if (!mobileHero && hoveredCta) {
			hoverEmitAcc += dt;
			if (hoverEmitAcc >= CTA_HOVER_EMIT_INTERVAL) {
				hoverEmitAcc = 0;
				emitCtaFall(hoveredCta, 1 + Math.floor(Math.random() * 2));
			}
		} else {
			hoverEmitAcc = 0;
		}

		if (mouseActive && prevMouseX > -9000) {
			const mvx = mouseX - prevMouseX;
			const mvy = mouseY - prevMouseY;
			const speed = Math.hypot(mvx, mvy) / Math.max(dt, 0.008);

			if (speed > 8) {
				emitAcc += dt * (0.16 + (speed / 150) ** 1.15 * 2.7);
				while (emitAcc >= 1 && sparks.length < MAX_SPARKS) {
					emitSpark(mouseX, mouseY, mvx, mvy, 1.05);
					emitAcc -= 1;
				}
			} else {
				emitAcc *= 0.62;
			}
		}

		if (animate) {
			topDripAcc += dt;
			while (topDripAcc >= TOP_DRIP_INTERVAL) {
				topDripAcc -= TOP_DRIP_INTERVAL * (0.75 + Math.random() * 0.7);
				dripTopParticle();
			}
		}

		prevMouseX = mouseX;
		prevMouseY = mouseY;

		if (mobileHero) {
			scrollBoost = Math.max(0, scrollBoost - dt * SCROLL_BOOST_DECAY);
		} else {
			scrollBoost = 0;
		}

		const boost = mobileHero ? scrollBoost : 0;
		motionTime += dt * (1 + boost * 4.2);
		const t = motionTime;

		for (const particle of particles) {
			const nx = Math.sin(t * particle.freq + particle.phase) * particle.amp;
			const ny = Math.cos(t * particle.freq * 0.84 + particle.phase) * particle.amp * 0.7;

			if (pointerActive) {
				const dx = particle.ox + nx + particle.vx - mouseX;
				const dy = particle.oy + ny + particle.vy - mouseY;
				const distSq = dx * dx + dy * dy;

				if (distSq < REPULSE_RADIUS_SQ && distSq > 0.0001) {
					const dist = Math.sqrt(distSq);
					const force = ((REPULSE_RADIUS - dist) / REPULSE_RADIUS) * MAX_FORCE;
					particle.vx += (dx / dist) * force;
					particle.vy += (dy / dist) * force;
				}
			}

			particle.vx *= DAMPING;
			particle.vy *= DAMPING;
			particle.x = particle.ox + nx + particle.vx;
			particle.y = particle.oy + ny + particle.vy;
		}

		const sinkX = glowHeartX;
		const sinkY = height + 28;

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

			if (spark.fountain) {
				spark.vy += spark.gravity * dt;

				const dx = sinkX - spark.x;
				const dy = sinkY - spark.y;
				const distSq = dx * dx + dy * dy;
				const dist = Math.sqrt(Math.max(distSq, 0.0001));

				if (spark.y >= height - 1 || spark.life > 1.6) {
					sparks.splice(i, 1);
					continue;
				}

				const inv = 1 / dist;
				spark.vx += dx * inv * 480 * dt;
				spark.vy += dy * inv * 760 * dt;
				spark.vx *= 0.94;
				spark.vy *= 0.985;

				spark.x += spark.vx * dt;
				spark.y += spark.vy * dt;
				spark.alpha = spark.baseAlpha;
				spark.size = spark.baseSize;
				continue;
			}

			const dx = sinkX - spark.x;
			const dy = sinkY - spark.y;
			const distSq = dx * dx + dy * dy;
			const dist = Math.sqrt(Math.max(distSq, 0.0001));

			if (dist < HEART_FADE || spark.y >= height - 1 || spark.life > 2.9) {
				sparks.splice(i, 1);
				continue;
			}

			const inv = 1 / dist;
			const pull = (0.2 + 360 / (distSq + 120)) * spark.pullScale;
			spark.vx += dx * inv * pull;
			spark.vy += dy * inv * pull * 1.12;
			spark.vx *= 0.905;
			spark.vy *= 0.905;
			spark.x += spark.vx;
			spark.y += spark.vy;

			const fade = Math.max(0, (dist - HEART_FADE) / 180);
			spark.alpha = spark.baseAlpha * fade;
			spark.size = spark.baseSize;
		}

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#F54100';

		for (let i = 0; i < BUCKETS; i += 1) {
			ctx.globalAlpha = (i + 0.55) / BUCKETS;
			const group = buckets[i];
			for (let j = 0; j < group.length; j += 1) {
				const particle = group[j];
				ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
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

	function onCtaEnter(event: Event) {
		if (mobileHero) return;
		const cta = event.currentTarget as HTMLElement;
		hoveredCta = cta;
		hoverEmitAcc = CTA_HOVER_EMIT_INTERVAL;
		emitCtaFall(cta, 6 + Math.floor(Math.random() * 4));
	}

	function onCtaLeave(event: Event) {
		if (hoveredCta === event.currentTarget) {
			hoveredCta = null;
			hoverEmitAcc = 0;
		}
	}

	function onPointerDown(event: PointerEvent) {
		const target = event.target as HTMLElement | null;
		const cta = target?.closest<HTMLElement>('.hero-cta');
		const onCta = Boolean(cta && hero.contains(cta));

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
		setPointerFromClient(event.clientX, event.clientY);
		emitTapBurst();

		if (onCta && cta) {
			emitCtaFall(cta, 8 + Math.floor(Math.random() * 5));
		}

		pointerHoldTimer = window.setTimeout(() => {
			pointerHoldTimer = 0;
			if (activePointerId === null || isScrollGesture) return;
			startHoldEmit();
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
			onLeave();
			return;
		}

		setPointerFromClient(event.clientX, event.clientY);

		if (mobileHero) {
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
			onLeave();
			return;
		}

		setPointerFromClient(event.clientX, event.clientY);
		clearPointerHold();
		pointerHoldTimer = window.setTimeout(() => {
			onLeave();
			pointerHoldTimer = 0;
		}, TAP_HOLD_MS);
	}

	let resizeFrame = 0;
	let resyncTimers: number[] = [];

	function onScroll() {
		if (!mobileHero || !visible) return;

		const now = performance.now();
		const y = window.scrollY;
		const sampleDt = lastScrollSample ? Math.max(0.008, (now - lastScrollSample) / 1000) : 0.016;
		const speed = Math.abs(y - lastScrollY) / sampleDt;
		lastScrollY = y;
		lastScrollSample = now;

		const impulse = Math.min(0.75, speed / SCROLL_SPEED_REF);
		scrollBoost = Math.min(SCROLL_BOOST_MAX, scrollBoost * 0.86 + impulse * 0.95);
	}

	function onResize() {
		if (resizeFrame) return;
		resizeFrame = window.requestAnimationFrame(() => {
			resizeFrame = 0;
			resize();
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
			resize(true);
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

	function onVisibilityChange() {
		if (document.hidden) return;
		resyncSurfaces();
	}

	function onPageShow() {
		resyncSurfaces();
	}

	function onViewportChange() {
		onResize();
	}

	resize(true);

	if (animate) {
		draw(performance.now());
	} else {
		drawStatic();
	}

	function refreshForReveal() {
		resize(true);
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
			for (const cta of ctaButtons) {
				cta.addEventListener('mouseenter', onCtaEnter);
				cta.addEventListener('mouseleave', onCtaLeave);
			}
		}

		hero.addEventListener('pointerdown', onPointerDown, { passive: true });
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerup', onPointerEnd, { passive: true });
		window.addEventListener('pointercancel', onPointerEnd, { passive: true });
	}

	window.addEventListener('resize', onResize, { passive: true });
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('pageshow', onPageShow);
	window.addEventListener('focus', onPageShow);
	document.addEventListener('visibilitychange', onVisibilityChange);
	window.visualViewport?.addEventListener('resize', onViewportChange, { passive: true });
	window.visualViewport?.addEventListener('scroll', onViewportChange, { passive: true });

	const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
	resizeObserver?.observe(hero);

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
			}
		},
		{ threshold: 0.05 },
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
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerEnd);
		window.removeEventListener('pointercancel', onPointerEnd);
		window.removeEventListener('resize', onResize);
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('pageshow', onPageShow);
		window.removeEventListener('focus', onPageShow);
		document.removeEventListener('visibilitychange', onVisibilityChange);
		window.visualViewport?.removeEventListener('resize', onViewportChange);
		window.visualViewport?.removeEventListener('scroll', onViewportChange);
		window.removeEventListener('mousemove', onMove);
		hero.removeEventListener('pointerdown', onPointerDown);
		for (const cta of ctaButtons) {
			cta.removeEventListener('mouseenter', onCtaEnter);
			cta.removeEventListener('mouseleave', onCtaLeave);
		}
		delete canvas.dataset.particlesInit;
		if (sparkCanvas) delete sparkCanvas.dataset.particlesInit;
	};
}
