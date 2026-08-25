type TrailPoint = { x: number; y: number; t: number };

const TRAIL_LIFE_MS = 520;
const TRAIL_RADIUS = 34;
const TRAIL_MAX = 48;
const SAMPLE_GAP_PX = 6;

let cleanupTextStreaks: (() => void) | null = null;

function bindTextStreak(root: HTMLElement) {
	const streak = root.querySelector<HTMLElement>('[data-text-streak-glow]');
	if (!streak) return () => {};

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return () => {};

	const trail: TrailPoint[] = [];
	let rafId = 0;
	let lastSampleX = Number.NaN;
	let lastSampleY = Number.NaN;

	function clearMask() {
		streak.style.opacity = '0';
		streak.style.maskImage = 'none';
		streak.style.webkitMaskImage = 'none';
	}

	function paint(now: number) {
		while (trail.length && now - trail[0].t > TRAIL_LIFE_MS) {
			trail.shift();
		}

		if (!trail.length || !root.isConnected) {
			clearMask();
			rafId = 0;
			return;
		}

		const rect = root.getBoundingClientRect();
		const parts: string[] = [];

		for (const point of trail) {
			const age = Math.min(1, (now - point.t) / TRAIL_LIFE_MS);
			const fade = (1 - age) ** 1.55;
			if (fade < 0.03) continue;

			const x = point.x - rect.left;
			const y = point.y - rect.top;
			const radius = TRAIL_RADIUS * (0.55 + fade * 0.55);

			parts.push(
				`radial-gradient(circle ${radius.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(0,0,0,${fade.toFixed(3)}) 0%, rgba(0,0,0,${(fade * 0.45).toFixed(3)}) 42%, transparent 74%)`,
			);
		}

		if (!parts.length) {
			clearMask();
			rafId = 0;
			return;
		}

		const mask = parts.join(',');
		streak.style.opacity = '1';
		streak.style.maskImage = mask;
		streak.style.webkitMaskImage = mask;
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

	root.addEventListener('pointermove', onPointerMove, { passive: true });
	root.addEventListener('pointerleave', onPointerLeave, { passive: true });

	return () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		trail.length = 0;
		clearMask();
		root.removeEventListener('pointermove', onPointerMove);
		root.removeEventListener('pointerleave', onPointerLeave);
	};
}

/** Keep white streak layer in sync after description line-split / i18n. */
export function syncTextStreakGlow(base: HTMLElement) {
	const root = base.closest<HTMLElement>('[data-text-streak]');
	const glow = root?.querySelector<HTMLElement>('[data-text-streak-glow]');
	if (!root || !glow) return;

	glow.replaceChildren();
	for (const child of Array.from(base.childNodes)) {
		glow.appendChild(child.cloneNode(true));
	}
}

export function initHeroBadgeStreak() {
	cleanupTextStreaks?.();
	cleanupTextStreaks = null;

	const roots = document.querySelectorAll<HTMLElement>('[data-text-streak]');
	if (!roots.length) return;

	const cleanups = Array.from(roots).map((root) => bindTextStreak(root));
	cleanupTextStreaks = () => {
		for (const cleanup of cleanups) cleanup();
	};
}
