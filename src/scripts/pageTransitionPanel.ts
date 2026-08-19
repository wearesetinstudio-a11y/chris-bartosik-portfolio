import {
	findSygnetFlip,
	PANEL_SLIDE_MS,
	playSygnetFlip,
	prefersReducedMotion,
	resetSygnetFlip,
	wait,
	waitForAnimation,
} from './sygnetFlipAnimation.ts';

export const PAGE_TRANSITION_OVERLAY_ID = 'page-transition-overlay';

export function getPageTransitionOverlay(): HTMLElement | null {
	return document.getElementById(PAGE_TRANSITION_OVERLAY_ID);
}

export function resetPageTransitionOverlay(overlay: HTMLElement) {
	overlay.classList.remove('is-sliding-in', 'is-sliding-out', 'is-active');
	overlay.style.top = '-100vh';
	overlay.style.animation = 'none';
	overlay.style.pointerEvents = 'none';

	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);
}

export async function slidePanelIn(overlay: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		overlay.classList.add('is-active');
		overlay.style.top = '0';
		overlay.style.pointerEvents = 'auto';
		await wait(120);
		return;
	}

	resetPageTransitionOverlay(overlay);
	overlay.classList.add('is-active');
	overlay.style.top = '-100vh';
	overlay.style.animation = '';
	overlay.style.pointerEvents = 'auto';

	void overlay.offsetWidth;
	overlay.classList.add('is-sliding-in');
	await waitForAnimation(overlay, 'slide-in-top', PANEL_SLIDE_MS);
	overlay.classList.remove('is-sliding-in');
	overlay.style.top = '0';
	overlay.style.animation = 'none';
}

export async function slidePanelOut(overlay: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		resetPageTransitionOverlay(overlay);
		return;
	}

	overlay.style.top = '0';
	overlay.style.animation = '';

	void overlay.offsetWidth;
	overlay.classList.add('is-sliding-out');
	await waitForAnimation(overlay, 'slide-out-bottom', PANEL_SLIDE_MS);
	resetPageTransitionOverlay(overlay);
}

export async function showOverlayCover(overlay: HTMLElement): Promise<void> {
	applyOverlayCover(overlay);

	if (prefersReducedMotion()) {
		await wait(120);
	}
}

export function applyOverlayCover(overlay: HTMLElement): void {
	const sygnet = findSygnetFlip(overlay);
	if (sygnet) resetSygnetFlip(sygnet);

	overlay.classList.remove('is-sliding-in', 'is-sliding-out');
	overlay.classList.add('is-active');
	overlay.style.animation = 'none';
	overlay.style.top = '0';
	overlay.style.pointerEvents = 'auto';
}

async function playOverlaySygnetFlip(overlay: HTMLElement): Promise<void> {
	const sygnet = findSygnetFlip(overlay);
	if (sygnet) await playSygnetFlip(sygnet);
}

export async function animateIntroCover(): Promise<void> {
	const overlay = getPageTransitionOverlay();
	if (!overlay) return;

	await showOverlayCover(overlay);
	await playOverlaySygnetFlip(overlay);
}

export async function animatePageTransitionCover(): Promise<void> {
	const overlay = getPageTransitionOverlay();
	if (!overlay) return;

	await slidePanelIn(overlay);
	await playOverlaySygnetFlip(overlay);
}

export async function animatePageTransitionReveal(): Promise<boolean> {
	const overlay = getPageTransitionOverlay();
	if (!overlay?.classList.contains('is-active')) return false;

	await slidePanelOut(overlay);
	return true;
}
