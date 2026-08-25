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
};

const HAND_PATH =
	'M37.5457 54.9821C38.2277 51.2243 39.5644 46.761 41.4071 42.0938C44.2746 34.8305 48.1463 27.6268 51.9235 22.6413L45.3119 18.0413C41.0019 23.7301 36.8164 31.594 33.764 39.3253C33.5309 39.9159 33.303 40.5091 33.0811 41.1037C33.5584 39.4654 34.082 37.7986 34.6476 36.118C37.8058 26.7323 42.0987 17.4158 46.3273 10.951L39.4041 6.79314C34.8911 13.6927 30.5071 23.177 27.2416 32.6282L27.2857 32.4295C29.7214 21.4866 33.1004 10.6316 36.492 3.10075L28.9893 0C25.3161 8.15602 21.7987 19.5443 19.2934 30.7995C18.8124 32.9605 18.3655 35.1308 17.9604 37.2855C18.0643 35.8375 18.1852 34.3818 18.3243 32.9259C19.3195 22.5072 21.2198 12.4048 24.3563 5.14485L16.8061 2.15173C13.1967 10.5063 11.206 21.5401 10.1862 32.2162C10.0366 33.7813 9.9074 35.3456 9.79689 36.9006C8.22855 32.4272 7.52862 28.0145 8.91789 22.5362L0.977001 20.6904C-1.38864 30.0187 0.951516 37.121 3.64454 43.4709C4.07418 44.4839 4.5052 45.4663 4.92785 46.4296C6.21078 49.3536 7.41663 52.1019 8.27296 55L37.5457 54.9821Z';

const HAND_VIEW_W = 52;
const HAND_VIEW_H = 55;

const REPULSE_RADIUS = 170;
const REPULSE_RADIUS_SQ = REPULSE_RADIUS * REPULSE_RADIUS;
const DAMPING = 0.82;
const MAX_FORCE = 5.4;
const BUCKETS = 8;
const MAX_SPARKS = 180;

function sparkSize() {
	return 2;
}

function isMobileStage() {
	return (
		window.matchMedia('(pointer: coarse)').matches ||
		window.matchMedia('(max-width: 767px)').matches
	);
}

function sampleHandHomes(width: number, height: number, count: number) {
	const sampleScale = 10;
	const sw = Math.max(1, Math.round(HAND_VIEW_W * sampleScale));
	const sh = Math.max(1, Math.round(HAND_VIEW_H * sampleScale));
	const offscreen = document.createElement('canvas');
	offscreen.width = sw;
	offscreen.height = sh;
	const ctx = offscreen.getContext('2d', { willReadFrequently: true });
	if (!ctx) return [];

	const path = new Path2D(HAND_PATH);
	ctx.setTransform(sampleScale, 0, 0, sampleScale, 0, 0);
	ctx.fillStyle = '#fff';
	ctx.fill(path);

	const { data } = ctx.getImageData(0, 0, sw, sh);
	const filled: { x: number; y: number }[] = [];

	for (let y = 0; y < sh; y += 1) {
		for (let x = 0; x < sw; x += 1) {
			if (data[(y * sw + x) * 4 + 3] > 24) {
				filled.push({ x, y });
			}
		}
	}

	if (!filled.length) return [];

	const pad = 0.26;
	const fit = Math.min((width * (1 - pad * 2)) / HAND_VIEW_W, (height * (1 - pad * 2)) / HAND_VIEW_H);
	const drawW = HAND_VIEW_W * fit;
	const drawH = HAND_VIEW_H * fit;
	const offsetX = (width - drawW) / 2;
	const offsetY = (height - drawH) / 2;
	const cx = offsetX + drawW * 0.48;
	const cy = offsetY + drawH * 0.55;

	const homes: Array<{
		x: number;
		y: number;
		size: number;
		alpha: number;
		bucket: number;
	}> = [];

	for (let i = 0; i < count; i += 1) {
		const point = filled[Math.floor(Math.random() * filled.length)];
		const nx = point.x / sw;
		const ny = point.y / sh;
		const x = offsetX + nx * drawW + (Math.random() - 0.5) * 1.2;
		const y = offsetY + ny * drawH + (Math.random() - 0.5) * 1.2;
		const dist = Math.hypot(x - cx, y - cy);
		const maxDist = Math.hypot(drawW, drawH) * 0.55;
		const core = Math.max(0, 1 - dist / maxDist);
		const alpha = 0.12 + core * 0.78 + Math.random() * 0.08;
		const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.floor(alpha * BUCKETS)));

		homes.push({
			x,
			y,
			size: sparkSize(),
			alpha,
			bucket,
		});
	}

	return homes;
}

let cleanupHandParticles: (() => void) | null = null;

export function initHandParticles() {
	const canvas = document.getElementById('hand-particles') as HTMLCanvasElement | null;
	const stage = document.getElementById('error-hand-stage');

	if (!canvas || !stage) {
		cleanupHandParticles?.();
		cleanupHandParticles = null;
		return;
	}

	if (canvas.dataset.particlesInit === 'true' && canvas.isConnected) return;

	cleanupHandParticles?.();
	cleanupHandParticles = null;

	const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
	if (!ctx) return;

	canvas.dataset.particlesInit = 'true';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isTouch = window.matchMedia('(pointer: coarse)').matches;
	const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	const animate = !reduceMotion;

	let width = 0;
	let height = 0;
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
	let mobileStage = isMobileStage();

	function spawnParticles() {
		const count = reduceMotion ? 2200 : isTouch ? 5200 : 14000;
		particles = [];
		buckets = Array.from({ length: BUCKETS }, () => []);
		sparks = [];

		const homes = sampleHandHomes(width, height, count);
		for (const home of homes) {
			const particle: Particle = {
				x: home.x,
				y: home.y,
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
			};
			particles.push(particle);
			buckets[home.bucket].push(particle);
		}
	}

	function emitSpark(x: number, y: number, mvx: number, mvy: number) {
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
		});
	}

	function sizeSurface() {
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		canvas.style.removeProperty('width');
		canvas.style.removeProperty('height');
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function resize(force = false) {
		mobileStage = isMobileStage();
		const rect = stage.getBoundingClientRect();
		const nextWidth = Math.max(1, Math.floor(rect.width));
		const nextHeight = Math.max(1, Math.floor(rect.height));
		if (!force && nextWidth === width && nextHeight === height && particles.length) return;

		width = nextWidth;
		height = nextHeight;
		sizeSurface();
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

		const time = now * 0.001;
		const dt = lastTime ? Math.min(0.033, (now - lastTime) / 1000) : 0.016;
		lastTime = now;

		const pointerActive = mouseX > -9000;
		const mouseActive = !mobileStage && pointerActive;

		if (mouseActive && prevMouseX > -9000) {
			const mvx = mouseX - prevMouseX;
			const mvy = mouseY - prevMouseY;
			const speed = Math.hypot(mvx, mvy) / Math.max(dt, 0.008);

			if (speed > 8) {
				emitAcc += dt * (0.16 + (speed / 150) ** 1.15 * 2.7);
				while (emitAcc >= 1 && sparks.length < MAX_SPARKS) {
					emitSpark(mouseX, mouseY, mvx, mvy);
					emitAcc -= 1;
				}
			} else {
				emitAcc *= 0.62;
			}
		}

		prevMouseX = mouseX;
		prevMouseY = mouseY;

		for (const particle of particles) {
			const nx = Math.sin(time * particle.freq + particle.phase) * particle.amp;
			const ny = Math.cos(time * particle.freq * 0.84 + particle.phase) * particle.amp * 0.7;

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

		for (let i = sparks.length - 1; i >= 0; i -= 1) {
			const spark = sparks[i];
			spark.life += dt;
			spark.vx *= 0.94;
			spark.vy *= 0.94;
			spark.x += spark.vx;
			spark.y += spark.vy;
			spark.alpha = spark.baseAlpha * Math.max(0, 1 - spark.life / 0.85);
			spark.size = spark.baseSize;

			if (spark.life > 0.9 || spark.alpha <= 0.02) {
				sparks.splice(i, 1);
			}
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

		for (const spark of sparks) {
			ctx.fillStyle = '#F54100';
			ctx.globalAlpha = spark.alpha;
			ctx.fillRect(spark.x, spark.y, spark.size, spark.size);
		}

		ctx.globalAlpha = 1;

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
		const rect = stage.getBoundingClientRect();
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

	function onPointerDown(event: PointerEvent) {
		if (!mobileStage && event.pointerType === 'mouse') return;
		setPointerFromClient(event.clientX, event.clientY);
	}

	function onPointerMove(event: PointerEvent) {
		if (!mobileStage) return;
		if (event.pointerType === 'mouse') return;
		setPointerFromClient(event.clientX, event.clientY);
	}

	function onPointerEnd() {
		if (!mobileStage) return;
		onLeave();
	}

	let resizeFrame = 0;
	function onResize() {
		if (resizeFrame) return;
		resizeFrame = window.requestAnimationFrame(() => {
			resizeFrame = 0;
			resize();
			if (!animate) drawStatic();
		});
	}

	function onVisibilityChange() {
		if (document.hidden) return;
		lastTime = 0;
		resize(true);
		if (!animate) {
			drawStatic();
			return;
		}
		startLoop();
	}

	resize(true);

	if (animate) {
		draw(performance.now());
	} else {
		drawStatic();
	}

	if (!reduceMotion) {
		if (!mobileStage) {
			window.addEventListener('mousemove', onMove, { passive: true });
		}
		stage.addEventListener('pointerdown', onPointerDown, { passive: true });
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerup', onPointerEnd, { passive: true });
		window.addEventListener('pointercancel', onPointerEnd, { passive: true });
	}

	window.addEventListener('resize', onResize, { passive: true });
	document.addEventListener('visibilitychange', onVisibilityChange);

	const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
	resizeObserver?.observe(stage);

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

	observer.observe(stage);

	cleanupHandParticles = () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		if (resizeFrame) {
			window.cancelAnimationFrame(resizeFrame);
			resizeFrame = 0;
		}
		observer.disconnect();
		resizeObserver?.disconnect();
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerEnd);
		window.removeEventListener('pointercancel', onPointerEnd);
		window.removeEventListener('resize', onResize);
		document.removeEventListener('visibilitychange', onVisibilityChange);
		stage.removeEventListener('pointerdown', onPointerDown);
		delete canvas.dataset.particlesInit;
	};
}
