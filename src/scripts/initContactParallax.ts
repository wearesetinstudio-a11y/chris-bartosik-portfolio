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

	const mobileMq = window.matchMedia('(max-width: 767px)');

	const resetParallax = () => {
		cleanupContactParallax?.();
		cleanupContactParallax = null;
		track.style.transform = '';
		delete shell.dataset.parallaxInit;
	};

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || mobileMq.matches) {
		resetParallax();

		const onMqChange = () => {
			if (!mobileMq.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				mobileMq.removeEventListener('change', onMqChange);
				initContactParallax();
			}
		};

		mobileMq.addEventListener('change', onMqChange);
		return;
	}

	if (shell.dataset.parallaxInit === 'true' && shell.isConnected) return;

	resetParallax();
	shell.dataset.parallaxInit = 'true';

	let cachedWidth = 0;
	let cachedOverlapPx = 0;
	let cachedTrackHeight = 0;
	let cachedMaxTravel = 0;
	let lastTransform = '';
	let trackResizeTimer = 0;

	const readOverlapPx = () => {
		const marginTop = getComputedStyle(shell).marginTop;
		const overlap = Math.abs(parseFloat(marginTop));
		if (Number.isFinite(overlap) && overlap > 0) return overlap;
		return window.innerHeight * 0.4;
	};

	const recacheMetrics = (forceOverlap = false) => {
		const width = window.innerWidth;
		if (forceOverlap || width !== cachedWidth || cachedOverlapPx === 0) {
			cachedWidth = width;
			cachedOverlapPx = readOverlapPx();
		}

		cachedTrackHeight = track.offsetHeight;
		cachedMaxTravel = cachedOverlapPx + cachedTrackHeight;
	};

	const update = () => {
		const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
		const shellRect = shell.getBoundingClientRect();

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
		const next = rounded > 0 ? `translate3d(0, ${rounded}px, 0)` : '';

		if (next !== lastTransform) {
			track.style.transform = next;
			lastTransform = next;
		}
	};

	const onWindowResize = () => {
		if (window.innerWidth <= 767) {
			resetParallax();
			initContactParallax();
			return;
		}

		if (window.innerWidth === cachedWidth) return;
		recacheMetrics(true);
		update();
	};

	const onTrackResize = () => {
		window.clearTimeout(trackResizeTimer);
		trackResizeTimer = window.setTimeout(() => {
			const nextHeight = track.offsetHeight;
			if (nextHeight === cachedTrackHeight) return;
			cachedTrackHeight = nextHeight;
			cachedMaxTravel = cachedOverlapPx + cachedTrackHeight;
			update();
		}, 120);
	};

	recacheMetrics(true);
	update();

	const unsubscribe = onScrollFrame(update);
	window.addEventListener('resize', onWindowResize, { passive: true });

	const trackObserver = new ResizeObserver(onTrackResize);
	trackObserver.observe(track);

	cleanupContactParallax = () => {
		unsubscribe();
		window.removeEventListener('resize', onWindowResize);
		trackObserver.disconnect();
		window.clearTimeout(trackResizeTimer);
		track.style.transform = '';
		lastTransform = '';
		delete shell.dataset.parallaxInit;
	};
}
