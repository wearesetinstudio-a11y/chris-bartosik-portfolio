const MAX_TILT = 16;
const MAX_SHIFT = 5;
const LERP = 0.14;
const RANGE = 1.15;

let cleanupHeroPhotoTilt: (() => void) | null = null;

function isPhotoActive() {
	const hero = document.getElementById('hero-section');
	if (!hero) return false;

	const photo = hero.querySelector<HTMLElement>('[data-hero-photo]');
	return hero.classList.contains('is-hero-intro-complete') || photo?.classList.contains('is-photo-visible') === true;
}

export function initHeroPhotoTilt() {
	const hero = document.getElementById('hero-section');
	const tiltEl = document.querySelector<HTMLImageElement>('[data-hero-photo] img');
	if (!hero || !tiltEl) {
		cleanupHeroPhotoTilt?.();
		cleanupHeroPhotoTilt = null;
		return;
	}

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (hero.dataset.photoTiltInit === 'true' && hero.isConnected) return;

	cleanupHeroPhotoTilt?.();
	cleanupHeroPhotoTilt = null;
	hero.dataset.photoTiltInit = 'true';

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
	let activeTouchId = -1;

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	function applyTransform() {
		tiltEl.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translate3d(${currentShiftX.toFixed(2)}px, ${currentShiftY.toFixed(2)}px, 6px)`;
	}

	function tick() {
		currentX += (targetX - currentX) * LERP;
		currentY += (targetY - currentY) * LERP;
		currentShiftX += (targetShiftX - currentShiftX) * LERP;
		currentShiftY += (targetShiftY - currentShiftY) * LERP;
		applyTransform();

		if (visible) {
			rafId = window.requestAnimationFrame(tick);
			return;
		}

		rafId = 0;
	}

	function start() {
		if (!rafId) rafId = window.requestAnimationFrame(tick);
	}

	function setTiltFromPoint(clientX: number, clientY: number) {
		if (!isPhotoActive()) {
			resetTilt();
			return;
		}

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

	function onMouseMove(event: MouseEvent) {
		setTiltFromPoint(event.clientX, event.clientY);
	}

	function onPointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse' && finePointer) return;
		activeTouchId = event.pointerId;
		setTiltFromPoint(event.clientX, event.clientY);
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType === 'mouse') return;
		if (event.pointerId !== activeTouchId) return;
		setTiltFromPoint(event.clientX, event.clientY);
	}

	function onPointerEnd(event: PointerEvent) {
		if (event.pointerId !== activeTouchId) return;
		activeTouchId = -1;
		resetTilt();
	}

	if (finePointer) {
		hero.addEventListener('mousemove', onMouseMove, { passive: true });
		hero.addEventListener('mouseleave', resetTilt, { passive: true });
	}

	hero.addEventListener('pointerdown', onPointerDown, { passive: true });
	hero.addEventListener('pointermove', onPointerMove, { passive: true });
	hero.addEventListener('pointerup', onPointerEnd, { passive: true });
	hero.addEventListener('pointercancel', onPointerEnd, { passive: true });

	const observer = new IntersectionObserver(
		(entries) => {
			visible = entries.some((entry) => entry.isIntersecting);
			if (visible) start();
		},
		{ threshold: 0.05 },
	);

	observer.observe(hero);
	start();

	cleanupHeroPhotoTilt = () => {
		window.cancelAnimationFrame(rafId);
		rafId = 0;
		observer.disconnect();
		hero.removeEventListener('mousemove', onMouseMove);
		hero.removeEventListener('mouseleave', resetTilt);
		hero.removeEventListener('pointerdown', onPointerDown);
		hero.removeEventListener('pointermove', onPointerMove);
		hero.removeEventListener('pointerup', onPointerEnd);
		hero.removeEventListener('pointercancel', onPointerEnd);
		tiltEl.style.transform = '';
		delete hero.dataset.photoTiltInit;
	};
}
