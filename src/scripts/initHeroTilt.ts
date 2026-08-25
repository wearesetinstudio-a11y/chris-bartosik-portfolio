const MAX_TILT = 11;
const MAX_SHIFT = 6;
const LERP = 0.14;
const RANGE = 1.25;
const IDLE_TILT_X = 0.85;
const IDLE_TILT_Y = 1.15;
const IDLE_TILT_Z = 0.35;
const IDLE_SHIFT = 1.8;
const TAP_HOLD_MS = 520;
const SCROLL_INTENT_PX = 14;

let cleanupHeroTilt: (() => void) | null = null;

export function initHeroTilt() {
	const hero = document.getElementById('hero-section');
	const portrait = document.getElementById('hero-portrait-tilt');
	if (!hero || !portrait) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (hero.dataset.tiltInit === 'true' && hero.isConnected) return;

	cleanupHeroTilt?.();
	cleanupHeroTilt = null;

	hero.dataset.tiltInit = 'true';

	const tiltEl = portrait;
	const finePointer = window.matchMedia('(pointer: fine)').matches;

	let targetX = 0;
	let targetY = 0;
	let targetShiftX = 0;
	let targetShiftY = 0;
	let currentX = 0;
	let currentY = 0;
	let currentShiftX = 0;
	let currentShiftY = 0;
	let rafId = 0;
	let visible = true;
	let activePointerId: number | null = null;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let isScrollGesture = false;
	let resetTimer = 0;

	function applyTransform(idleX: number, idleY: number, idleZ: number, idleSx: number, idleSy: number) {
		tiltEl.style.transform = `rotateX(${(currentX + idleX).toFixed(2)}deg) rotateY(${(currentY + idleY).toFixed(2)}deg) rotateZ(${idleZ.toFixed(2)}deg) translate3d(${(currentShiftX + idleSx).toFixed(2)}px, ${(currentShiftY + idleSy).toFixed(2)}px, 10px)`;
	}

	function tick() {
		const time = performance.now() / 1000;
		const idleX = Math.sin(time * 0.42) * IDLE_TILT_X;
		const idleY = Math.cos(time * 0.34) * IDLE_TILT_Y;
		const idleZ = Math.sin(time * 0.28) * IDLE_TILT_Z;
		const idleSx = Math.sin(time * 0.31) * IDLE_SHIFT;
		const idleSy = Math.cos(time * 0.37) * IDLE_SHIFT;

		currentX += (targetX - currentX) * LERP;
		currentY += (targetY - currentY) * LERP;
		currentShiftX += (targetShiftX - currentShiftX) * LERP;
		currentShiftY += (targetShiftY - currentShiftY) * LERP;
		applyTransform(idleX, idleY, idleZ, idleSx, idleSy);

		if (visible) {
			rafId = window.requestAnimationFrame(tick);
			return;
		}

		rafId = 0;
	}

	function start() {
		if (!rafId) rafId = window.requestAnimationFrame(tick);
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	function setTiltFromPoint(clientX: number, clientY: number) {
		const rect = tiltEl.getBoundingClientRect();
		const nx = clamp((clientX - (rect.left + rect.width / 2)) / ((rect.width / 2) * RANGE), -1, 1);
		const ny = clamp((clientY - (rect.top + rect.height / 2)) / ((rect.height / 2) * RANGE), -1, 1);

		targetY = nx * MAX_TILT;
		targetX = -ny * MAX_TILT;
		targetShiftX = nx * MAX_SHIFT;
		targetShiftY = ny * MAX_SHIFT;
	}

	function resetTilt() {
		targetX = 0;
		targetY = 0;
		targetShiftX = 0;
		targetShiftY = 0;
	}

	function clearResetTimer() {
		window.clearTimeout(resetTimer);
		resetTimer = 0;
	}

	function scheduleReset() {
		clearResetTimer();
		resetTimer = window.setTimeout(() => {
			resetTilt();
			resetTimer = 0;
		}, TAP_HOLD_MS);
	}

	function onMouseMove(event: MouseEvent) {
		setTiltFromPoint(event.clientX, event.clientY);
	}

	function onPointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse') return;

		activePointerId = event.pointerId;
		pointerStartX = event.clientX;
		pointerStartY = event.clientY;
		isScrollGesture = false;
		clearResetTimer();
		setTiltFromPoint(event.clientX, event.clientY);
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerId !== activePointerId || isScrollGesture) return;

		const dx = event.clientX - pointerStartX;
		const dy = event.clientY - pointerStartY;

		if (Math.abs(dy) > SCROLL_INTENT_PX && Math.abs(dy) > Math.abs(dx) * 1.15) {
			isScrollGesture = true;
			clearResetTimer();
			resetTilt();
			activePointerId = null;
			return;
		}

		setTiltFromPoint(event.clientX, event.clientY);
	}

	function endPointer(event: PointerEvent) {
		if (event.pointerId !== activePointerId) return;

		activePointerId = null;

		if (isScrollGesture) {
			resetTilt();
			return;
		}

		setTiltFromPoint(event.clientX, event.clientY);
		scheduleReset();
	}

	if (finePointer) {
		hero.addEventListener('mousemove', onMouseMove, { passive: true });
		hero.addEventListener('mouseleave', resetTilt, { passive: true });
	}

	tiltEl.addEventListener('pointerdown', onPointerDown, { passive: true });
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerup', endPointer, { passive: true });
	window.addEventListener('pointercancel', endPointer, { passive: true });

	const observer = new IntersectionObserver(
		(entries) => {
			visible = entries.some((entry) => entry.isIntersecting);
			if (visible) start();
		},
		{ threshold: 0.05 },
	);

	observer.observe(hero);
	start();

	cleanupHeroTilt = () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		clearResetTimer();
		observer.disconnect();
		hero.removeEventListener('mousemove', onMouseMove);
		hero.removeEventListener('mouseleave', resetTilt);
		tiltEl.removeEventListener('pointerdown', onPointerDown);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', endPointer);
		window.removeEventListener('pointercancel', endPointer);
		delete hero.dataset.tiltInit;
	};
}
