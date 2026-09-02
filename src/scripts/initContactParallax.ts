import { onScrollFrame } from './scrollFrame.ts';

const CONTACT_SCROLL_FACTOR = 0.58;

let cleanupContactParallax: (() => void) | null = null;

export function initContactParallax() {
	const shell = document.querySelector<HTMLElement>('[data-contact-parallax-shell]');
	const track = document.querySelector<HTMLElement>('[data-contact-parallax-track]');
	const testimonials = document.getElementById('testimonials');

	if (!shell || !track || !testimonials) {
		cleanupContactParallax?.();
		cleanupContactParallax = null;
		return;
	}

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		track.style.transform = '';
		return;
	}

	if (shell.dataset.parallaxInit === 'true' && shell.isConnected) return;

	cleanupContactParallax?.();
	cleanupContactParallax = null;
	shell.dataset.parallaxInit = 'true';

	let cachedMaxTravel = 0;
	let lastTransform = '';

	const recacheMetrics = () => {
		const marginTop = getComputedStyle(shell).marginTop;
		const overlap = Math.abs(parseFloat(marginTop));
		const overlapPx =
			Number.isFinite(overlap) && overlap > 0 ? overlap : window.innerHeight * 0.4;
		cachedMaxTravel = overlapPx + track.offsetHeight;
	};

	const update = () => {
		const shellRect = shell.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		if (shellRect.top > viewportHeight) {
			if (lastTransform !== '') {
				track.style.transform = '';
				lastTransform = '';
			}
			return;
		}

		const traveled = Math.max(0, viewportHeight - shellRect.top);
		const clampedTravel = Math.min(traveled, cachedMaxTravel);
		const offset = clampedTravel * (1 - CONTACT_SCROLL_FACTOR);
		const rounded = Math.round(offset * 10) / 10;
		const next = rounded > 0.5 ? `translate3d(0, ${rounded}px, 0)` : '';

		if (next !== lastTransform) {
			track.style.transform = next;
			lastTransform = next;
		}
	};

	recacheMetrics();
	update();

	const unsubscribe = onScrollFrame(update);
	const resizeObserver = new ResizeObserver(() => {
		recacheMetrics();
		update();
	});
	resizeObserver.observe(shell);
	resizeObserver.observe(track);

	cleanupContactParallax = () => {
		unsubscribe();
		resizeObserver.disconnect();
		track.style.transform = '';
		lastTransform = '';
		delete shell.dataset.parallaxInit;
	};
}
