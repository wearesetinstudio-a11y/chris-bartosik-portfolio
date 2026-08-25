import { t } from '../utils/i18n.ts';
import { syncTextStreakGlow } from './initHeroBadgeStreak.ts';

function buildHeroDescription(root: HTMLElement) {
	const line1 = t('hero.descriptionLine1');
	const line2 = t('hero.descriptionLine2');
	const line3 = t('hero.descriptionLine3');
	const full = t('hero.description');

	root.replaceChildren();

	const desktop = document.createElement('span');
	desktop.className = 'hero-description__desktop';
	desktop.dataset.i18n = 'hero.description';
	desktop.textContent = full;

	const mobile = document.createElement('span');
	mobile.className = 'hero-description__mobile';
	mobile.setAttribute('aria-hidden', 'true');

	const span1 = document.createElement('span');
	span1.dataset.i18n = 'hero.descriptionLine1';
	span1.textContent = line1;

	const span2 = document.createElement('span');
	span2.dataset.i18n = 'hero.descriptionLine2';
	span2.textContent = line2;

	const span3 = document.createElement('span');
	span3.dataset.i18n = 'hero.descriptionLine3';
	span3.textContent = line3;

	mobile.append(span1, document.createElement('br'), span2, document.createElement('br'), span3);
	root.append(desktop, mobile);
}

function syncHeroDescription() {
	const root = document.querySelector<HTMLElement>('[data-hero-description]');
	if (!root) return;

	buildHeroDescription(root);
	syncTextStreakGlow(root);
}

let i18nBound = false;

export function initHeroDescriptionLines() {
	syncHeroDescription();

	if (i18nBound) return;
	i18nBound = true;
	document.addEventListener('i18n-applied', syncHeroDescription);
}
