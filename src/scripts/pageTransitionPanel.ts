import { t } from '../utils/i18n.ts';
import {
	PANEL_SLIDE_MS,
	prefersReducedMotion,
	wait,
	waitForAnimation,
} from './sygnetFlipAnimation.ts';
import { playHandWave, resetHandWave } from './preloaderWave.ts';

export const PAGE_TRANSITION_OVERLAY_ID = 'page-transition-overlay';

export type OverlayDestination = {
	href: string;
	source?: Element | null;
};

const PAGE_NAME_KEYS: Record<string, string> = {
	'/skills': 'nav.skills',
	'/projects': 'nav.projects',
	'/about': 'nav.about',
};

export function getPageTransitionOverlay(): HTMLElement | null {
	return document.getElementById(PAGE_TRANSITION_OVERLAY_ID);
}

function overlayChris(overlay: HTMLElement) {
	return (
		overlay.querySelector<HTMLElement>('#overlay-chris-name') ??
		overlay.querySelector<HTMLElement>('[data-overlay-chris]')
	);
}

function overlayPage(overlay: HTMLElement) {
	return (
		overlay.querySelector<HTMLElement>('#overlay-page-name') ??
		overlay.querySelector<HTMLElement>('[data-overlay-page]')
	);
}

function showChrisMark(overlay: HTMLElement) {
	const chris = overlayChris(overlay);
	const page = overlayPage(overlay);

	chris?.classList.remove('is-hidden');
	page?.classList.add('is-hidden');
	if (page) page.textContent = '';
}

function showPageMark(overlay: HTMLElement, label: string) {
	const chris = overlayChris(overlay);
	const page = overlayPage(overlay);

	chris?.classList.add('is-hidden');
	if (page) {
		page.textContent = label;
		page.classList.remove('is-hidden');
	}
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

function normalizePath(href: string): string {
	try {
		return new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/';
	} catch {
		return '/';
	}
}

function lockedOverlayLabel(overlay: HTMLElement): string {
	return overlay.dataset.overlayLockedLabel?.trim() ?? '';
}

function lockOverlayLabel(overlay: HTMLElement, label: string) {
	overlay.dataset.overlayLockedLabel = label;
}

function clearLockedOverlayLabel(overlay: HTMLElement) {
	delete overlay.dataset.overlayLockedLabel;
}

function projectClientFromPage(): string {
	return document.querySelector<HTMLElement>('[data-project-client]')?.dataset.projectClient?.trim() ?? '';
}

function destinationLabel(destination: OverlayDestination): string | null {
	const path = normalizePath(destination.href);
	if (path === '/' || path.endsWith('/index.html')) return null;

	const key = PAGE_NAME_KEYS[path];
	if (key) return t(key);

	if (path.startsWith('/projects/')) {
		const fromLink = destination.source
			?.closest('[data-transition-label]')
			?.getAttribute('data-transition-label')
			?.trim();
		if (fromLink) return fromLink;

		const fromPage = projectClientFromPage();
		if (fromPage) return fromPage;

		return null;
	}

	return null;
}

export function applyOverlayDestination(overlay: HTMLElement, destination?: OverlayDestination) {
	const locked = lockedOverlayLabel(overlay);
	if (locked) {
		showPageMark(overlay, locked);
		return;
	}

	const label = destination ? destinationLabel(destination) : null;
	if (!label) {
		showChrisMark(overlay);
		return;
	}

	lockOverlayLabel(overlay, label);
	showPageMark(overlay, label);
}

export function resetPageTransitionOverlay(overlay: HTMLElement) {
	overlay.classList.remove('is-sliding-in', 'is-sliding-out', 'is-active');
	overlay.style.top = '-100vh';
	overlay.style.animation = 'none';
	overlay.style.pointerEvents = 'none';
	clearLockedOverlayLabel(overlay);
	resetHandWave(overlay);
}

export async function slidePanelIn(
	overlay: HTMLElement,
	destination?: OverlayDestination,
): Promise<void> {
	if (destination) applyOverlayDestination(overlay, destination);

	if (prefersReducedMotion()) {
		overlay.classList.add('is-active');
		overlay.style.top = '0';
		overlay.style.pointerEvents = 'auto';
		await wait(120);
		return;
	}

	overlay.classList.remove('is-sliding-in', 'is-sliding-out');
	overlay.classList.add('is-active');
	overlay.style.top = '-100vh';
	overlay.style.animation = '';
	overlay.style.pointerEvents = 'auto';
	resetHandWave(overlay);

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
		showChrisMark(overlay);
		return;
	}

	overlay.style.top = '0';
	overlay.style.animation = '';

	void overlay.offsetWidth;
	overlay.classList.add('is-sliding-out');
	await waitForAnimation(overlay, 'slide-out-bottom', PANEL_SLIDE_MS);
	resetPageTransitionOverlay(overlay);
	showChrisMark(overlay);
}

export async function showOverlayCover(overlay: HTMLElement): Promise<void> {
	applyOverlayCover(overlay);

	if (prefersReducedMotion()) {
		await wait(120);
	}
}

export function applyOverlayCover(overlay: HTMLElement): void {
	resetHandWave(overlay);
	overlay.classList.remove('is-sliding-in', 'is-sliding-out');
	overlay.classList.add('is-active');
	overlay.style.animation = 'none';
	overlay.style.top = '0';
	overlay.style.pointerEvents = 'auto';
	clearLockedOverlayLabel(overlay);
	showChrisMark(overlay);
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

	if (destination) applyOverlayDestination(overlay, destination);
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
