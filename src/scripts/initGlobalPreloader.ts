import {
	clearIntroPending,
	dispatchIntroComplete,
	forceDismissIntroCover,
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

/** Hard ceiling so a hung animation never leaves the site covered after deploy. */
const INTRO_HARD_TIMEOUT_MS = 4500;

function lockIntroCover(): HTMLElement | null {
	const overlay = getPageTransitionOverlay();
	setIntroPending();
	document.body.classList.add('intro-active');

	if (overlay) {
		applyOverlayCover(overlay);
	}

	return overlay;
}

function releaseIntroCover(overlay: HTMLElement | null) {
	clearIntroPending();
	document.body.classList.remove('intro-active');
	setIntroSequenceRunning(false);
	if (overlay) resetPageTransitionOverlay(overlay);
	markIntroComplete();
	dispatchIntroComplete();
}

async function runIntroSequence() {
	const overlay = getPageTransitionOverlay();
	if (!overlay) {
		releaseIntroCover(null);
		return;
	}

	let hardTimeoutId = 0;
	const hardTimeout = new Promise<void>((resolve) => {
		hardTimeoutId = window.setTimeout(resolve, INTRO_HARD_TIMEOUT_MS);
	});

	try {
		await Promise.race([
			(async () => {
				await animateIntroCover();
				markIntroComplete();
				setIntroRevealing();
				window.dispatchEvent(new CustomEvent('intro-revealing'));
				await animatePageTransitionReveal();
			})(),
			hardTimeout,
		]);
	} catch {
		/* fall through to forced release */
	} finally {
		window.clearTimeout(hardTimeoutId);
		releaseIntroCover(overlay);
	}
}

export function initGlobalPreloader() {
	if (!document.getElementById('hero-section')) {
		forceDismissIntroCover();
		return;
	}

	if (isMobileNavNavigationActive()) {
		forceDismissIntroCover();
		return;
	}

	if (hasCompletedIntro()) {
		forceDismissIntroCover();
		return;
	}

	if (isIntroSequenceRunning()) {
		// Previous run may have stalled — never leave pending forever.
		window.setTimeout(() => {
			if (document.documentElement.classList.contains('intro-pending')) {
				forceDismissIntroCover();
			}
		}, INTRO_HARD_TIMEOUT_MS);
		return;
	}

	setIntroSequenceRunning(true);
	lockIntroCover();
	void runIntroSequence();
}
