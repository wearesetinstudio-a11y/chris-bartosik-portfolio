import { hasCompletedIntro, isIntroSequenceRunning } from './introState.ts';
import {
	animatePageTransitionCover,
	animatePageTransitionReveal,
	applyOverlayDestination,
	getPageTransitionOverlay,
	hrefFromUnknown,
	resetPageTransitionOverlay,
	type OverlayDestination,
} from './pageTransitionPanel.ts';

type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

type TransitionWindow = Window &
	typeof globalThis & {
		__setinPageTransitionsReady?: boolean;
		__setinPageTransitionPhase?: TransitionPhase;
	};

type PreparationEvent = Event & {
	loader: () => Promise<void>;
	to?: URL | string;
	sourceElement?: Element | null;
};

const transitionWindow = window as TransitionWindow;

function getPhase(): TransitionPhase {
	return transitionWindow.__setinPageTransitionPhase ?? 'idle';
}

function setPhase(phase: TransitionPhase) {
	transitionWindow.__setinPageTransitionPhase = phase;
}

function cleanupIntroState() {
	if (!hasCompletedIntro()) return;
	document.body.classList.remove('intro-active');
}

function destinationFromLink(anchor: HTMLAnchorElement | null): OverlayDestination | null {
	if (!anchor?.href) return null;
	if (anchor.target === '_blank' || anchor.hasAttribute('download')) return null;

	try {
		const url = new URL(anchor.href, window.location.origin);
		if (url.origin !== window.location.origin) return null;
		if (url.pathname === window.location.pathname && url.hash) return null;
	} catch {
		return null;
	}

	return { href: anchor.href, source: anchor };
}

function destinationFromEvent(event: PreparationEvent): OverlayDestination {
	const source = event.sourceElement ?? null;
	const fromTo = hrefFromUnknown(event.to);
	const fromLink = source instanceof Element ? source.closest('a') : null;

	return {
		href: fromTo || fromLink?.href || window.location.href,
		source: fromLink ?? source,
	};
}

export function initPageTransitionOverlay() {
	if (transitionWindow.__setinPageTransitionsReady) return;
	transitionWindow.__setinPageTransitionsReady = true;
	setPhase('idle');

	document.addEventListener(
		'click',
		(event) => {
			if (event.defaultPrevented) return;
			if (event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

			const overlay = getPageTransitionOverlay();
			if (!overlay) return;

			const destination = destinationFromLink(
				(event.target as Element | null)?.closest('a') ?? null,
			);
			if (!destination) return;

			applyOverlayDestination(overlay, destination);
		},
		true,
	);

	document.addEventListener('astro:before-preparation', (event) => {
		const prepEvent = event as PreparationEvent;
		const defaultLoader = prepEvent.loader;
		const destination = destinationFromEvent(prepEvent);

		cleanupIntroState();

		if (getPhase() !== 'idle' || isIntroSequenceRunning()) {
			prepEvent.loader = defaultLoader;
			return;
		}

		prepEvent.loader = async () => {
			try {
				setPhase('covering');
				await animatePageTransitionCover(destination);
				setPhase('covered');
				await defaultLoader();
			} catch (error) {
				const overlay = getPageTransitionOverlay();
				if (overlay) resetPageTransitionOverlay(overlay);
				setPhase('idle');
				throw error;
			}
		};
	});

	document.addEventListener('astro:after-swap', () => {
		cleanupIntroState();

		if (getPhase() !== 'covered') return;

		setPhase('revealing');
		void animatePageTransitionReveal().finally(() => setPhase('idle'));
	});
}
