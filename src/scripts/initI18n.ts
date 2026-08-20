import {
	formatLabel,
	getLocale,
	localeMeta,
	t,
	type Locale,
} from '../utils/i18n.ts';

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
		element.textContent =
			typeof count === 'number' && Number.isFinite(count)
				? formatLabel(key, count, locale)
				: t(key, locale);
	});

	document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((element) => {
		const key = element.dataset.i18nAria;
		if (!key) return;
		element.setAttribute('aria-label', t(key, locale));
	});
}

export function applyStoredLocale() {
	applyI18nToDocument(getLocale());
}

export function initI18n() {
	applyStoredLocale();
	document.dispatchEvent(new CustomEvent('i18n-applied'));
}
