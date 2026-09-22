import { animateMobileNavClose, isMobileNavOpen } from './mobileNavPanel.ts';
import { prefersReducedMotion } from './sygnetFlipAnimation.ts';

type SmoothHashWindow = Window &
	typeof globalThis & {
		__smoothHashScrollBound?: boolean;
		__smoothHashScrollRaf?: number;
	};

function samePageHashLink(anchor: HTMLAnchorElement): string | null {
	if (!anchor.hash) return null;

	try {
		const url = new URL(anchor.href, window.location.origin);
		if (url.origin !== window.location.origin) return null;

		const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
		const linkPath = url.pathname.replace(/\/$/, '') || '/';
		if (linkPath !== currentPath) return null;

		return url.hash;
	} catch {
		return null;
	}
}

function cancelRunningScroll() {
	const navWindow = window as SmoothHashWindow;
	if (navWindow.__smoothHashScrollRaf) {
		window.cancelAnimationFrame(navWindow.__smoothHashScrollRaf);
		navWindow.__smoothHashScrollRaf = 0;
	}
}

function revealForMeasure(element: HTMLElement) {
	const previous = element.style.contentVisibility;
	element.style.contentVisibility = 'visible';
	return () => {
		element.style.contentVisibility = previous;
	};
}

function measureScrollTop(element: Element) {
	const el = element instanceof HTMLElement ? element : null;
	const restore = el ? revealForMeasure(el) : null;
	const scrollMarginTop = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
	const top = Math.max(0, window.scrollY + element.getBoundingClientRect().top - scrollMarginTop);
	restore?.();
	return top;
}

/** Custom smooth scroll — iOS often ignores window.scrollTo({ behavior: 'smooth' }). */
function animateScrollTo(top: number) {
	cancelRunningScroll();

	if (prefersReducedMotion()) {
		window.scrollTo(0, top);
		return;
	}

	const navWindow = window as SmoothHashWindow;
	const start = window.scrollY || document.documentElement.scrollTop || 0;
	const distance = top - start;
	if (Math.abs(distance) < 2) {
		window.scrollTo(0, top);
		return;
	}

	const duration = Math.min(1400, Math.max(480, Math.abs(distance) * 0.35));
	const startTime = performance.now();

	const step = (now: number) => {
		const t = Math.min(1, (now - startTime) / duration);
		// easeInOutCubic
		const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
		window.scrollTo(0, start + distance * eased);
		if (t < 1) {
			navWindow.__smoothHashScrollRaf = window.requestAnimationFrame(step);
			return;
		}
		navWindow.__smoothHashScrollRaf = 0;
		window.scrollTo(0, top);
	};

	navWindow.__smoothHashScrollRaf = window.requestAnimationFrame(step);
}

async function scrollToHash(hash: string) {
	const section = document.querySelector(hash);
	if (!section) return false;

	if (isMobileNavOpen()) {
		await animateMobileNavClose();
		// Wait a frame so body unlock / position:fixed teardown settles.
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	}

	const url = `${window.location.pathname}${window.location.search}${hash}`;
	if (window.location.hash !== hash) {
		history.pushState(null, '', url);
	}

	animateScrollTo(measureScrollTop(section));
	return true;
}

export function initSmoothHashScroll() {
	const navWindow = window as SmoothHashWindow;
	if (navWindow.__smoothHashScrollBound) return;
	navWindow.__smoothHashScrollBound = true;

	document.addEventListener(
		'click',
		(event) => {
			if (event.defaultPrevented) return;
			// Touch-generated clicks can omit button; only ignore non-primary mouse buttons.
			if (typeof event.button === 'number' && event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

			const target = event.target;
			if (!(target instanceof Element)) return;

			// Mobile menu hash links have their own capture handler.
			if (target.closest('#mobile-nav-panel [data-mobile-nav-link]')) return;

			const anchor =
				target.closest('a') ??
				target.closest('.work-with-us-button')?.querySelector('a') ??
				null;
			if (!(anchor instanceof HTMLAnchorElement)) return;

			const hash = samePageHashLink(anchor);
			if (!hash) return;

			const section = document.querySelector(hash);
			if (!section) return;

			event.preventDefault();
			event.stopPropagation();
			void scrollToHash(hash);
		},
		true,
	);
}
