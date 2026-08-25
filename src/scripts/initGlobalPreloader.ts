import {
	clearIntroPending,
	dispatchIntroComplete,
	hasCompletedIntro,
	isIntroSequenceRunning,
	markIntroComplete,
	setIntroPending,
	setIntroRevealing,
	setIntroSequenceRunning,
} from './introState.ts';
import { isMobileNavNavigationActive } from './mobileNavPanel.ts';
import {
	animateIntroCover,
	animatePageTransitionReveal,
	applyOverlayCover,
	getPageTransitionOverlay,
	resetPageTransitionOverlay,
} from './pageTransitionPanel.ts';

function lockIntroCover(): HTMLElement | null {
	const overlay = getPageTransitionOverlay();
	setIntroPending();
	document.body.classList.add('intro-active');

	if (overlay) {
		applyOverlayCover(overlay);
	}

	return overlay;
}

async function runIntroSequence() {
	const overlay = getPageTransitionOverlay();
	if (!overlay) {
		markIntroComplete();
		clearIntroPending();
		document.body.classList.remove('intro-active');
		dispatchIntroComplete();
		return;
	}

	try {
		await animateIntroCover();
		markIntroComplete();
		setIntroRevealing();
		window.dispatchEvent(new CustomEvent('intro-revealing'));
		await animatePageTransitionReveal();
	} catch {
		clearIntroPending();
		resetPageTransitionOverlay(overlay);
		markIntroComplete();
	} finally {
		clearIntroPending();
		document.body.classList.remove('intro-active');
		setIntroSequenceRunning(false);
		dispatchIntroComplete();
	}
}

export function initGlobalPreloader() {
	if (!document.getElementById('hero-section')) {
		clearIntroPending();
		return;
	}

	if (isMobileNavNavigationActive()) {
		clearIntroPending();
		const overlay = getPageTransitionOverlay();
		if (overlay) resetPageTransitionOverlay(overlay);
		markIntroComplete();
		dispatchIntroComplete();
		return;
	}

	if (hasCompletedIntro()) {
		clearIntroPending();
		dispatchIntroComplete();
		return;
	}

	if (isIntroSequenceRunning()) return;

	setIntroSequenceRunning(true);
	lockIntroCover();
	void runIntroSequence();
}
