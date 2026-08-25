import {
	PANEL_SLIDE_MS,
	prefersReducedMotion,
	wait,
	waitForAnimation,
} from './sygnetFlipAnimation.ts';
import { playHandWave, resetHandWave } from './preloaderWave.ts';

export const PAGE_TRANSITION_OVERLAY_ID = 'page-transition-overlay';
export const BAR_STAGGER_MS = 75;
export const BAR_COUNT = 5;
export const BAR_TRANSITION_MS = PANEL_SLIDE_MS + (BAR_COUNT - 1) * BAR_STAGGER_MS;

const BAR_COVER_ANIMATION = 'preloader-bar-cover';
const BAR_REVEAL_ANIMATION = 'preloader-bar-reveal';

export type OverlayDestination = {
	href: string;
	source?: Element | null;
};

export function getPageTransitionOverlay(): HTMLElement | null {
	return document.getElementById(PAGE_TRANSITION_OVERLAY_ID);
}

function getBars(overlay: HTMLElement): HTMLElement[] {
	return Array.from(overlay.querySelectorAll<HTMLElement>('.page-transition-bar'));
}

function resetBarAnimations(overlay: HTMLElement) {
	for (const bar of getBars(overlay)) {
		bar.style.animation = 'none';
	}
	void overlay.offsetWidth;
	for (const bar of getBars(overlay)) {
		bar.style.animation = '';
	}
}

async function waitForBarsAnimation(
	overlay: HTMLElement,
	animationName: string,
	durationMs: number,
): Promise<void> {
	const bars = getBars(overlay);
	if (!bars.length) {
		await wait(durationMs);
		return;
	}

	await Promise.all(
		bars.map((bar, index) =>
			waitForAnimation(bar, animationName, durationMs + index * BAR_STAGGER_MS),
		),
	);
}

export function hrefFromUnknown(value: unknown): string {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (value instanceof URL) return value.href;
	if (typeof value === 'object' && 'href' in value) {
		const href = (value as { href: unknown }).href;
		if (typeof href === 'string') return href;
	}
	return '';
}

export function applyOverlayDestination(_overlay: HTMLElement, _destination?: OverlayDestination) {
	// Hand-only overlay — no destination labels.
}

export function resetPageTransitionOverlay(overlay: HTMLElement) {
	overlay.classList.remove('is-covering', 'is-revealing', 'is-covered', 'is-active');
	overlay.style.pointerEvents = 'none';
	resetBarAnimations(overlay);
	resetHandWave(overlay);
}

export async function slidePanelIn(
	overlay: HTMLElement,
	_destination?: OverlayDestination,
): Promise<void> {
	if (prefersReducedMotion()) {
		overlay.classList.add('is-active', 'is-covered');
		overlay.style.pointerEvents = 'auto';
		await wait(120);
		return;
	}

	overlay.classList.remove('is-revealing', 'is-covered');
	overlay.classList.add('is-active');
	overlay.style.pointerEvents = 'auto';
	resetHandWave(overlay);
	resetBarAnimations(overlay);

	void overlay.offsetWidth;
	overlay.classList.add('is-covering');
	await waitForBarsAnimation(overlay, BAR_COVER_ANIMATION, PANEL_SLIDE_MS);
	overlay.classList.remove('is-covering');
	overlay.classList.add('is-covered');
}

export async function slidePanelOut(overlay: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		resetPageTransitionOverlay(overlay);
		return;
	}

	overlay.classList.remove('is-covering');
	resetBarAnimations(overlay);
	void overlay.offsetWidth;
	overlay.classList.add('is-revealing');
	await waitForBarsAnimation(overlay, BAR_REVEAL_ANIMATION, PANEL_SLIDE_MS);
	resetPageTransitionOverlay(overlay);
}

export async function showOverlayCover(overlay: HTMLElement): Promise<void> {
	applyOverlayCover(overlay);

	if (prefersReducedMotion()) {
		await wait(120);
	}
}

export function applyOverlayCover(overlay: HTMLElement): void {
	resetHandWave(overlay);
	overlay.classList.remove('is-covering', 'is-revealing');
	overlay.classList.add('is-active', 'is-covered');
	overlay.style.pointerEvents = 'auto';
	resetBarAnimations(overlay);
}

export async function animateIntroCover(): Promise<void> {
	const overlay = getPageTransitionOverlay();
	if (!overlay) return;

	await showOverlayCover(overlay);
	await playHandWave(overlay);
}

export async function animatePageTransitionCover(
	destination?: OverlayDestination,
): Promise<void> {
	const overlay = getPageTransitionOverlay();
	if (!overlay) return;

	if (destination?.source?.closest('.hero-cta')) await wait(240);

	await slidePanelIn(overlay, destination);
	await playHandWave(overlay);
}

export async function animatePageTransitionReveal(): Promise<boolean> {
	const overlay = getPageTransitionOverlay();
	if (!overlay?.classList.contains('is-active')) return false;

	await slidePanelOut(overlay);
	return true;
}
