import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type SmoothScrollWindow = Window &
	typeof globalThis & {
		__cbLenis?: Lenis;
		__cbSmoothScrollBound?: boolean;
	};

function smoothWindow() {
	return window as SmoothScrollWindow;
}

function prefersFinePointer() {
	return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function isScrollLocked() {
	const { documentElement: html, body } = document;
	if (!body) return false;
	if (html.classList.contains('intro-pending')) return true;
	if (body.classList.contains('mobile-nav-open')) return true;
	if (body.style.position === 'fixed') return true;
	return false;
}

export function getLenis() {
	return smoothWindow().__cbLenis ?? null;
}

/** Glide to a pixel offset. Returns false when native scrolling is in use. */
export function smoothScrollTo(top: number) {
	const lenis = getLenis();
	if (!lenis || lenis.isStopped) return false;
	lenis.scrollTo(top, { force: true });
	return true;
}

function syncToNativeScroll(lenis: Lenis) {
	lenis.resize();
	const y = window.scrollY || document.documentElement.scrollTop || 0;
	lenis.scrollTo(y, { immediate: true, force: true });
}

export function initSmoothScroll() {
	const navWindow = smoothWindow();
	if (navWindow.__cbSmoothScrollBound) return;
	navWindow.__cbSmoothScrollBound = true;

	// Touch scrolling already has momentum. A second smoothing pass fights it.
	if (!prefersFinePointer()) return;

	const lenis = new Lenis({
		autoRaf: true,
		lerp: 0.1,
		smoothWheel: true,
		syncTouch: false,
		allowNestedScroll: true,
		stopInertiaOnNavigate: true,
		anchors: false,
		respectReducedMotion: true,
	});

	navWindow.__cbLenis = lenis;

	let observedBody: HTMLElement | null = null;
	const observer = new MutationObserver(syncLock);

	function syncLock() {
		if (isScrollLocked()) {
			if (!lenis.isStopped) lenis.stop();
			return;
		}

		if (!lenis.isStopped) return;
		lenis.start();
		syncToNativeScroll(lenis);
	}

	function observeLockTargets() {
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		if (!document.body || document.body === observedBody) return;
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ['class', 'style'],
		});
		observedBody = document.body;
	}

	observeLockTargets();
	syncLock();

	window.addEventListener('intro-complete', () => {
		lenis.resize();
	});

	document.addEventListener('astro:page-load', () => {
		observeLockTargets();
		syncToNativeScroll(lenis);
		syncLock();
	});
}
