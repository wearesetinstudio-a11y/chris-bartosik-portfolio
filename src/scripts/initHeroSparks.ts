type Spark = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	life: number;
};

const MAX_SPARKS = 180;

let cleanupHeroSparks: (() => void) | null = null;

function sparkSize() {
	return 3;
}

export function initHeroSparks() {
	const canvas = document.getElementById('hero-sparks') as HTMLCanvasElement | null;
	const hero = document.getElementById('hero-section');

	if (!canvas || !hero) {
		cleanupHeroSparks?.();
		cleanupHeroSparks = null;
		return;
	}

	if (canvas.dataset.sparksInit === 'true' && canvas.isConnected) return;

	cleanupHeroSparks?.();
	cleanupHeroSparks = null;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isTouch = window.matchMedia('(pointer: coarse)').matches;
	const ctx = canvas.getContext('2d', { alpha: true });
	if (!ctx || reduceMotion) return;

	canvas.dataset.sparksInit = 'true';

	let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
	let width = 0;
	let height = 0;
	let sparks: Spark[] = [];
	let mouseX = -9999;
	let mouseY = -9999;
	let prevMouseX = -9999;
	let prevMouseY = -9999;
	let emitAcc = 0;
	let lastTime = 0;
	let rafId = 0;
	let visible = true;

	function sizeSurface() {
		dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		canvas.width = Math.max(1, Math.floor(width * dpr));
		canvas.height = Math.max(1, Math.floor(height * dpr));
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function measure() {
		const rect = hero.getBoundingClientRect();
		width = Math.max(1, rect.width);
		height = Math.max(1, rect.height);
		sizeSurface();
	}

	function emitSpark(x: number, y: number, mvx: number, mvy: number, burst = false) {
		if (sparks.length >= MAX_SPARKS) sparks.shift();

		let vx: number;
		let vy: number;

		if (burst) {
			const angle = Math.random() * Math.PI * 2;
			const force = 58 + Math.random() * 92;
			const horizontal = 0.95 + Math.random() * 0.55;
			vx = Math.cos(angle) * force * horizontal;
			vy = Math.sin(angle) * force * 0.62 + 42 + Math.random() * 34;
		} else {
			const speed = Math.hypot(mvx, mvy);
			const angle = speed > 0.001 ? Math.atan2(mvy, mvx) : Math.random() * Math.PI * 2;
			const spread = isTouch ? 0.95 + Math.random() * 1.15 : 0.55 + Math.random() * 0.9;
			const impulse = isTouch ? 24 + Math.random() * 52 : 18 + Math.random() * 42;
			const fallBias = isTouch ? 18 + Math.random() * 24 : 12;

			vx = Math.cos(angle + (Math.random() - 0.5) * spread) * impulse;
			vy = Math.sin(angle + (Math.random() - 0.5) * spread) * impulse + fallBias;
		}

		sparks.push({
			x: x + (Math.random() - 0.5) * (burst ? 14 : 6),
			y: y + (Math.random() - 0.5) * (burst ? 14 : 6),
			vx,
			vy,
			size: burst ? sparkSize() + (Math.random() > 0.5 ? 1 : 0) : sparkSize(),
			alpha: burst ? 0.62 + Math.random() * 0.3 : 0.55 + Math.random() * 0.35,
			life: 0,
		});
	}

	function setPointer(clientX: number, clientY: number) {
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
		setPointer(event.clientX, event.clientY);
	}

	function onLeave() {
		mouseX = -9999;
		mouseY = -9999;
		prevMouseX = -9999;
		prevMouseY = -9999;
		emitAcc = 0;
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType !== 'touch') return;
		if (!isInsideHero(event.clientX, event.clientY)) return;

		setPointer(event.clientX, event.clientY);
		emitSpray(mouseX, mouseY, 3 + Math.floor(Math.random() * 3));
	}

	function onPointerDown(event: PointerEvent) {
		if (event.pointerType !== 'touch') return;
		if (!isInsideHero(event.clientX, event.clientY)) return;

		setPointer(event.clientX, event.clientY);
		emitTapBurst(mouseX, mouseY);
	}

	function emitSpray(x: number, y: number, count: number) {
		for (let index = 0; index < count; index += 1) {
			emitSpark(x, y, (Math.random() - 0.5) * 40, 20 + Math.random() * 30);
		}
	}

	function emitTapBurst(x: number, y: number) {
		const count = 14 + Math.floor(Math.random() * 6);
		for (let index = 0; index < count; index += 1) {
			emitSpark(x, y, 0, 0, true);
		}
	}

	function isInsideHero(clientX: number, clientY: number) {
		const rect = hero.getBoundingClientRect();
		return (
			clientX >= rect.left &&
			clientX <= rect.right &&
			clientY >= rect.top &&
			clientY <= rect.bottom
		);
	}

	function draw(now: number) {
		if (!canvas.isConnected) {
			rafId = 0;
			return;
		}

		const dt = lastTime ? Math.min(0.033, (now - lastTime) / 1000) : 0.016;
		lastTime = now;

		if (!isTouch && mouseX > -9000 && prevMouseX > -9000) {
			const mvx = mouseX - prevMouseX;
			const mvy = mouseY - prevMouseY;
			const speed = Math.hypot(mvx, mvy) / Math.max(dt, 0.008);

			if (speed > 8) {
				emitAcc += dt * (0.14 + (speed / 150) ** 1.12 * 2.4);
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

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#F54100';

		for (let index = sparks.length - 1; index >= 0; index -= 1) {
			const spark = sparks[index];
			spark.life += dt;
			spark.vy += (isTouch ? 760 : 520) * dt;
			spark.vx *= 0.985;
			spark.x += spark.vx * dt;
			spark.y += spark.vy * dt;

			const fade = Math.max(0, 1 - spark.life / 1.35);
			if (spark.y > height + 20 || fade <= 0.02) {
				sparks.splice(index, 1);
				continue;
			}

			ctx.globalAlpha = spark.alpha * fade;
			ctx.fillRect(spark.x, spark.y, spark.size, spark.size);
		}

		ctx.globalAlpha = 1;

		if (visible && !document.hidden) {
			rafId = window.requestAnimationFrame(draw);
		} else {
			rafId = 0;
		}
	}

	function startLoop() {
		if (!rafId && visible && !document.hidden) {
			rafId = window.requestAnimationFrame(draw);
		}
	}

	function onResize() {
		measure();
	}

	const observer = new IntersectionObserver(
		(entries) => {
			visible = entries.some((entry) => entry.isIntersecting);
			if (visible) startLoop();
		},
		{ threshold: 0.05 },
	);

	measure();
	observer.observe(hero);
	window.addEventListener('resize', onResize, { passive: true });
	document.addEventListener('visibilitychange', startLoop);

	if (!isTouch) {
		window.addEventListener('mousemove', onMove, { passive: true });
		hero.addEventListener('mouseleave', onLeave, { passive: true });
	} else {
		hero.addEventListener('pointerdown', onPointerDown, { passive: true });
		hero.addEventListener('pointermove', onPointerMove, { passive: true });
	}

	startLoop();

	cleanupHeroSparks = () => {
		if (rafId) window.cancelAnimationFrame(rafId);
		observer.disconnect();
		window.removeEventListener('resize', onResize);
		document.removeEventListener('visibilitychange', startLoop);
		window.removeEventListener('mousemove', onMove);
		hero.removeEventListener('mouseleave', onLeave);
		hero.removeEventListener('pointerdown', onPointerDown);
		hero.removeEventListener('pointermove', onPointerMove);
		delete canvas.dataset.sparksInit;
	};
}
