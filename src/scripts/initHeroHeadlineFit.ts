const MOBILE_MQ = '(max-width: 767px)';
const MIN_FONT_PX = 16;
const WIDTH_TOLERANCE_PX = 6;
const MEASURING_CLASS = 'is-hero-headline-measuring';

/** Mobile fit anchor per locale — line that should fill 100% width */
const MOBILE_FIT_LINE = {
	en: 'role-a',
	pa: 'role-a',
	pl: 'name',
} as const;

let cleanupHeroHeadlineFit: (() => void) | null = null;
let cachedFit: { locale: string; width: number; fontSize: number } | null = null;

function isMobileHeadline() {
	return window.matchMedia(MOBILE_MQ).matches;
}

function getHeadlineLocale() {
	return document.documentElement.dataset.locale || document.documentElement.lang || 'en';
}

function getHeadlineSlot() {
	return document.querySelector<HTMLElement>('[data-hero-headline-slot]');
}

function getTargetFitLine(slot: HTMLElement, locale: string) {
	const groupId = MOBILE_FIT_LINE[locale as keyof typeof MOBILE_FIT_LINE] ?? MOBILE_FIT_LINE.en;
	return slot.querySelector<HTMLElement>(`[data-hero-intro-group="${groupId}"]`);
}

function getLineWidth(line: HTMLElement) {
	return line.scrollWidth;
}

function getAllIntroLines(slot: HTMLElement) {
	return [...slot.querySelectorAll<HTMLElement>('.hero-intro-line')];
}

function allLinesFit(slot: HTMLElement, availableWidth: number) {
	return getAllIntroLines(slot).every((line) => line.scrollWidth <= availableWidth + 1);
}

function withMeasuringState(hero: HTMLElement, run: () => void) {
	hero.classList.add(MEASURING_CLASS);
	try {
		run();
	} finally {
		hero.classList.remove(MEASURING_CLASS);
	}
}

export function fitHeroHeadline(force = false) {
	const slot = getHeadlineSlot();
	const hero = document.getElementById('hero-section');
	if (!slot || !hero) return;

	if (!isMobileHeadline()) {
		slot.style.fontSize = '';
		cachedFit = null;
		return;
	}

	const availableWidth = slot.clientWidth;
	if (availableWidth < 8) return;

	const locale = getHeadlineLocale();
	const cacheHit =
		!force &&
		cachedFit &&
		cachedFit.locale === locale &&
		Math.abs(cachedFit.width - availableWidth) < WIDTH_TOLERANCE_PX;

	if (cacheHit && cachedFit) {
		slot.style.fontSize = `${cachedFit.fontSize}px`;
		return;
	}

	const targetLine = getTargetFitLine(slot, locale);
	if (!targetLine) return;

	withMeasuringState(hero, () => {
		slot.style.fontSize = '';
		const cssPx = parseFloat(getComputedStyle(slot).fontSize);
		if (!Number.isFinite(cssPx) || cssPx <= 0) return;

		const fits = (sizePx: number) => {
			slot.style.fontSize = `${sizePx}px`;
			return getLineWidth(targetLine) <= availableWidth + 1;
		};

		let lo = MIN_FONT_PX;
		let hi = Math.max(cssPx, availableWidth * 0.22);
		let best = MIN_FONT_PX;

		if (!fits(lo)) {
			slot.style.fontSize = `${MIN_FONT_PX}px`;
			cachedFit = { locale, width: availableWidth, fontSize: MIN_FONT_PX };
			return;
		}

		best = lo;
		for (let i = 0; i < 24; i += 1) {
			const mid = (lo + hi) / 2;
			if (fits(mid)) {
				best = mid;
				lo = mid;
			} else {
				hi = mid;
			}
		}

		slot.style.fontSize = `${best}px`;

		while (best > MIN_FONT_PX && !allLinesFit(slot, availableWidth)) {
			best -= 0.5;
			slot.style.fontSize = `${best}px`;
		}

		slot.style.fontSize = `${best}px`;
		cachedFit = { locale, width: availableWidth, fontSize: best };
	});
}

export function initHeroHeadlineFit() {
	cleanupHeroHeadlineFit?.();
	cleanupHeroHeadlineFit = null;

	const runFit = (force = false) => {
		requestAnimationFrame(() => {
			fitHeroHeadline(force);
		});
	};

	const boot = async () => {
		if (document.fonts?.ready) {
			await document.fonts.ready.catch(() => undefined);
		}
		runFit(true);
	};

	void boot();

	let resizeTimer = 0;
	const onResize = () => {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(() => {
			cachedFit = null;
			runFit(true);
		}, 120);
	};

	const onI18nApplied = () => {
		cachedFit = null;
		runFit(true);
	};

	window.addEventListener('resize', onResize);
	document.addEventListener('i18n-applied', onI18nApplied);

	cleanupHeroHeadlineFit = () => {
		window.clearTimeout(resizeTimer);
		window.removeEventListener('resize', onResize);
		document.removeEventListener('i18n-applied', onI18nApplied);
		cachedFit = null;
	};
}
