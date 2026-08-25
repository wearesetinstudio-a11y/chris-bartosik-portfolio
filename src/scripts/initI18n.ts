import { applyProjectCopy } from './initProjectCopy.ts';
import {
	formatLabel,
	getLocale,
	localeMeta,
	t,
	type Locale,
} from '../utils/i18n.ts';
import { wrapRevealLetters } from './initScrollLetterReveal.ts';

function applyI18nToDocument(locale: Locale) {
	const meta = localeMeta[locale];
	document.documentElement.lang = meta.htmlLang;
	document.documentElement.dataset.locale = locale;

	document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
		if (element.closest('[data-reveal-line]')) return;

		const key = element.dataset.i18n;
		if (!key) return;

		const countAttr = element.dataset.i18nCount;
		const count = countAttr === undefined || countAttr === '' ? undefined : Number(countAttr);
		const countStyle = element.dataset.i18nCountStyle === 'plus' ? 'plus' : 'brackets';
		element.textContent =
			typeof count === 'number' && Number.isFinite(count)
				? formatLabel(key, count, locale, countStyle)
				: t(key, locale);
	});

	document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((element) => {
		const key = element.dataset.i18nAria;
		if (!key) return;
		element.setAttribute('aria-label', t(key, locale));
	});

	document.querySelectorAll<HTMLElement>('[data-i18n-alt]').forEach((element) => {
		const key = element.dataset.i18nAlt;
		if (!key) return;
		element.setAttribute('alt', t(key, locale));
	});

	const titleKey = document.documentElement.dataset.titleKey;
	const brandTitle = t('meta.title', locale);

	if (titleKey) {
		const pageTitle = t(titleKey, locale);
		document.title =
			titleKey === 'meta.title' || pageTitle === brandTitle ? brandTitle : `${pageTitle} — ${brandTitle}`;
	} else {
		document.title = document.title
			.replaceAll('Krzysztof Bartosik', 'Chris Bartosik')
			.replaceAll('Krzysztofa Bartosika', 'Chrisa Bartosika')
			.replaceAll('Chris Bartosik', t('brand.name', locale))
			.replaceAll('Chrisa Bartosika', locale === 'pl' ? 'Krzysztofa Bartosika' : 'Chrisa Bartosika');
	}

	const descriptionMeta = document.querySelector('meta[name="description"]');
	const descriptionKey = document.documentElement.dataset.descriptionKey;

	if (descriptionKey && descriptionMeta) {
		descriptionMeta.setAttribute('content', t(descriptionKey, locale));
	} else if (descriptionMeta?.getAttribute('content')) {
		descriptionMeta.setAttribute(
			'content',
			descriptionMeta
				.getAttribute('content')!
				.replaceAll('Krzysztof Bartosik', 'Chris Bartosik')
				.replaceAll('Chris Bartosik', t('brand.name', locale)),
		);
	}
}

export function applyStoredLocale() {
	applyI18nToDocument(getLocale());
}

export function applyLocale(locale: Locale) {
	applyI18nToDocument(locale);
	applyProjectCopy(locale);

	document.querySelectorAll<HTMLElement>('[data-reveal-line][data-i18n]').forEach((line) => {
		wrapRevealLetters(line);
	});

	document.dispatchEvent(new CustomEvent('i18n-applied'));
	window.dispatchEvent(new Event('scroll'));
}

export function initI18n() {
	applyLocale(getLocale());
}
