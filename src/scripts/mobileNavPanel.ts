import { BAR_COUNT, BAR_STAGGER_MS } from './pageTransitionPanel.ts';
import { PANEL_SLIDE_MS, prefersReducedMotion, wait } from './sygnetFlipAnimation.ts';

export const MOBILE_NAV_PANEL_ID = 'mobile-nav-panel';
export const MOBILE_NAV_TOGGLE_ID = 'mobile-nav-toggle';

export const MOBILE_NAV_BAR_MS = PANEL_SLIDE_MS + (BAR_COUNT - 1) * BAR_STAGGER_MS;
const MOBILE_NAV_LINK_TRANSITION_MS = 400;
const MOBILE_NAV_LINK_STAGGER_MS = 55;
const MOBILE_NAV_LINK_COUNT = 5;
export const MOBILE_NAV_CONTENT_EXIT_MS =
	MOBILE_NAV_LINK_TRANSITION_MS + (MOBILE_NAV_LINK_COUNT - 1) * MOBILE_NAV_LINK_STAGGER_MS;

type MobileNavWindow = Window &
	typeof globalThis & {
		__mobileNavNavigationActive?: boolean;
		__mobileNavContentTimer?: number;
		__mobileNavLockedScrollY?: number;
		__mobileNavStateListener?: (() => void) | null;
	};

const navWindow = window as MobileNavWindow;

function getPanel() {
	return document.getElementById(MOBILE_NAV_PANEL_ID);
}

function getToggle() {
	return document.getElementById(MOBILE_NAV_TOGGLE_ID);
}

function notifyStateChange() {
	navWindow.__mobileNavStateListener?.();
}

function restoreScroll(scrollY: number) {
	const html = document.documentElement;
	const previousBehavior = html.style.scrollBehavior;
	html.style.scrollBehavior = 'auto';
	window.scrollTo(0, scrollY);
	html.style.scrollBehavior = previousBehavior;
}

function lockBodyScroll() {
	navWindow.__mobileNavLockedScrollY =
		window.scrollY || document.documentElement.scrollTop || 0;
	document.body.classList.add('mobile-nav-open');
	document.body.style.position = 'fixed';
	document.body.style.top = `-${navWindow.__mobileNavLockedScrollY}px`;
	document.body.style.left = '0';
	document.body.style.right = '0';
	document.body.style.width = '100%';
}

function unlockBodyScroll() {
	if (!document.body.classList.contains('mobile-nav-open')) return;

	const scrollY = navWindow.__mobileNavLockedScrollY ?? 0;
	document.body.classList.remove('mobile-nav-open');
	document.documentElement.classList.remove('mobile-nav-open');
	document.body.style.position = '';
	document.body.style.top = '';
	document.body.style.left = '';
	document.body.style.right = '';
	document.body.style.width = '';
	restoreScroll(scrollY);
}

function getHashScrollTarget(element: Element): number {
	const lockedScroll = navWindow.__mobileNavLockedScrollY ?? window.scrollY;
	const scrollMarginTop = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
	return Math.max(0, lockedScroll + element.getBoundingClientRect().top - scrollMarginTop);
}

function jumpToHashWhileMenuLocked(hash: string): boolean {
	const target = document.querySelector(hash);
	if (!target) return false;

	const url = `${window.location.pathname}${window.location.search}${hash}`;
	history.pushState(null, '', url);

	if (!document.body.classList.contains('mobile-nav-open')) {
		target.scrollIntoView({ behavior: 'auto', block: 'start' });
		return true;
	}

	const targetScrollY = getHashScrollTarget(target);
	navWindow.__mobileNavLockedScrollY = targetScrollY;
	document.body.style.top = `-${targetScrollY}px`;
	return true;
}

function resetMobileNavBarAnimations(panel: HTMLElement) {
	for (const bar of panel.querySelectorAll<HTMLElement>('.mobile-nav-bar')) {
		bar.style.animation = 'none';
		bar.style.transform = '';
	}
	void panel.offsetWidth;
	for (const bar of panel.querySelectorAll<HTMLElement>('.mobile-nav-bar')) {
		bar.style.animation = '';
	}
}

function restartBarAnimation(panel: HTMLElement, className: 'is-revealing' | 'is-covering') {
	for (const bar of panel.querySelectorAll<HTMLElement>('.mobile-nav-bar')) {
		bar.style.animation = 'none';
	}
	void panel.offsetWidth;
	for (const bar of panel.querySelectorAll<HTMLElement>('.mobile-nav-bar')) {
		bar.style.animation = '';
	}
	panel.classList.add(className);
}

async function animateBarsOut(panel: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		panel.classList.remove('is-covered');
		return;
	}

	restartBarAnimation(panel, 'is-revealing');
	await waitForBarReveal(panel);
}

function clearMobileNavTimer() {
	if (navWindow.__mobileNavContentTimer) {
		window.clearTimeout(navWindow.__mobileNavContentTimer);
		navWindow.__mobileNavContentTimer = 0;
	}
}

function finishClose(panel: HTMLElement, toggle: HTMLElement | null) {
	panel.classList.remove(
		'is-open',
		'is-covered',
		'is-revealing',
		'is-covering',
		'is-content-ready',
		'is-content-exiting',
		'is-content-hidden',
	);
	panel.setAttribute('aria-hidden', 'true');
	toggle?.classList.remove('is-open');
	toggle?.setAttribute('aria-expanded', 'false');
	resetMobileNavBarAnimations(panel);
	unlockBodyScroll();
	notifyStateChange();
}

export function registerMobileNavStateListener(listener: (() => void) | null) {
	navWindow.__mobileNavStateListener = listener;
}

export function isMobileNavLink(element: Element | null | undefined): boolean {
	return !!element?.closest('#mobile-nav-panel [data-mobile-nav-link]');
}

export function isMobileNavOpen(): boolean {
	const panel = getPanel();
	return panel?.classList.contains('is-open') === true;
}

export function isMobileNavNavigationActive(): boolean {
	return navWindow.__mobileNavNavigationActive === true;
}

function setMobileNavNavigationActive(active: boolean) {
	navWindow.__mobileNavNavigationActive = active;
}

export function forceCloseMobileNav() {
	const panel = getPanel();
	if (!panel) return;
	clearMobileNavTimer();
	finishClose(panel, getToggle());
}

function waitForBarReveal(panel: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		return wait(120);
	}

	return new Promise((resolve) => {
		const bars = panel.querySelectorAll<HTMLElement>('.mobile-nav-bar');
		if (!bars.length) {
			resolve();
			return;
		}

		let remaining = bars.length;
		const timeout = window.setTimeout(resolve, MOBILE_NAV_BAR_MS + 120);

		const onEnd = (event: AnimationEvent) => {
			if (event.animationName !== 'mobile-nav-bar-reveal') return;
			remaining -= 1;
			if (remaining <= 0) {
				window.clearTimeout(timeout);
				for (const bar of bars) {
					bar.removeEventListener('animationend', onEnd);
				}
				resolve();
			}
		};

		for (const bar of bars) {
			bar.addEventListener('animationend', onEnd);
		}
	});
}

function waitForLinksOut(panel: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) {
		return wait(80);
	}

	return new Promise((resolve) => {
		const firstLink = panel.querySelector<HTMLElement>('.mobile-nav-link:nth-child(1)');
		if (!firstLink) {
			resolve();
			return;
		}

		const timeout = window.setTimeout(resolve, MOBILE_NAV_CONTENT_EXIT_MS + 80);

		const onEnd = (event: TransitionEvent) => {
			if (event.target !== firstLink) return;
			if (event.propertyName !== 'opacity' && event.propertyName !== 'transform') return;

			window.clearTimeout(timeout);
			firstLink.removeEventListener('transitionend', onEnd);
			resolve();
		};

		firstLink.addEventListener('transitionend', onEnd);
	});
}

async function animateLinksOut(panel: HTMLElement): Promise<void> {
	if (!panel.classList.contains('is-content-ready')) return;

	panel.classList.add('is-content-exiting');
	panel.classList.remove('is-content-ready');
	void panel.offsetWidth;

	await waitForLinksOut(panel);

	panel.classList.remove('is-content-exiting');
	panel.classList.add('is-content-hidden');
}

export async function navigateMobileNavToHash(hash: string): Promise<void> {
	if (!getPanel()?.classList.contains('is-open')) return;
	if (!hash) return;

	jumpToHashWhileMenuLocked(hash);
	await animateMobileNavClose();
	notifyStateChange();
}

export function getMobileNavHashLink(target: EventTarget | null): HTMLAnchorElement | null {
	if (!(target instanceof Element)) return null;
	if (!isMobileNavLink(target)) return null;

	const anchor = target.closest('a');
	if (!anchor?.hash) return null;

	try {
		const url = new URL(anchor.href, window.location.origin);
		const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
		const linkPath = url.pathname.replace(/\/$/, '') || '/';
		if (linkPath !== currentPath) return null;
	} catch {
		return null;
	}

	return anchor;
}

export async function prepareMobileNavNavigation(): Promise<void> {
	const panel = getPanel();
	const toggle = getToggle();
	if (!panel?.classList.contains('is-covered')) return;

	clearMobileNavTimer();
	setMobileNavNavigationActive(true);

	toggle?.classList.remove('is-open');
	toggle?.setAttribute('aria-expanded', 'false');

	await animateLinksOut(panel);
}

export async function completeMobileNavNavigation(): Promise<void> {
	const panel = getPanel();
	const toggle = getToggle();
	if (!panel) {
		setMobileNavNavigationActive(false);
		return;
	}

	try {
		if (panel.classList.contains('is-covered')) {
			await animateBarsOut(panel);
		}
		navWindow.__mobileNavLockedScrollY = 0;
		finishClose(panel, toggle);
	} finally {
		setMobileNavNavigationActive(false);
	}
}

export async function animateMobileNavClose(): Promise<void> {
	const panel = getPanel();
	const toggle = getToggle();
	if (!panel?.classList.contains('is-open')) return;

	clearMobileNavTimer();

	if (prefersReducedMotion() || !panel.classList.contains('is-covered')) {
		toggle?.classList.remove('is-open');
		toggle?.setAttribute('aria-expanded', 'false');
		finishClose(panel, toggle);
		return;
	}

	toggle?.classList.remove('is-open');
	toggle?.setAttribute('aria-expanded', 'false');

	await animateLinksOut(panel);
	await animateBarsOut(panel);
	finishClose(panel, toggle);
}

export function setMobileNavOpen(
	isOpen: boolean,
	labels?: { open: string; close: string },
): void {
	const toggle = getToggle();
	const panel = getPanel();
	if (!toggle || !panel) return;

	clearMobileNavTimer();

	if (labels) {
		toggle.setAttribute('aria-label', isOpen ? labels.close : labels.open);
		toggle.dataset.i18nAria = isOpen ? 'nav.closeMenu' : 'nav.openMenu';
	}

	toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
	if (isOpen) {
		panel.setAttribute('aria-hidden', 'false');
	}

	if (isOpen) {
		toggle.classList.add('is-open');
		panel.classList.add('is-open');
		panel.classList.remove('is-covered', 'is-revealing', 'is-covering', 'is-content-ready', 'is-content-exiting', 'is-content-hidden');
		lockBodyScroll();
		resetMobileNavBarAnimations(panel);
		notifyStateChange();

		if (prefersReducedMotion()) {
			panel.classList.add('is-covered', 'is-content-ready');
			return;
		}

		void panel.offsetWidth;
		panel.classList.add('is-covering');

		navWindow.__mobileNavContentTimer = window.setTimeout(() => {
			if (!panel.classList.contains('is-open')) return;
			panel.classList.remove('is-covering');
			panel.classList.add('is-covered', 'is-content-ready');
		}, MOBILE_NAV_BAR_MS);
	} else {
		void animateMobileNavClose();
	}
}
