const PRESS_SELECTOR = [
	'.hero-cta',
	'.hero-pillar',
	'.project-card:not(.project-card--soon)',
	'.see-all-projects',
	'.work-with-us-button',
	'.rolling-link',
	'.contact-email-cta',
	'.contact-modal__submit',
	'.contact-social__link',
	'.project-live-result',
	'.case-study__chip',
	'.project-overview__case-link',
	'.projects-filters__btn',
	'.testimonials-slider__arrow',
].join(', ');

const SCROLL_CANCEL_PX = 10;
const RELEASE_DELAY_MS = 150;

function isCoarsePointer() {
	return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function clearPressed(except?: Element) {
	document.querySelectorAll('.is-pressed').forEach((el) => {
		if (el !== except) el.classList.remove('is-pressed');
	});
}

function bindPressTarget(el: HTMLElement) {
	if (el.dataset.pressBound === 'true') return;
	el.dataset.pressBound = 'true';

	let startY = 0;
	let startX = 0;
	let releaseTimer = 0;

	const releaseNow = () => {
		if (releaseTimer) {
			window.clearTimeout(releaseTimer);
			releaseTimer = 0;
		}
		el.classList.remove('is-pressed');
	};

	const releaseDelayed = () => {
		if (releaseTimer) window.clearTimeout(releaseTimer);
		releaseTimer = window.setTimeout(() => {
			releaseTimer = 0;
			el.classList.remove('is-pressed');
		}, RELEASE_DELAY_MS);
	};

	el.addEventListener(
		'touchstart',
		(event) => {
			if (!isCoarsePointer()) return;
			const touch = event.touches[0];
			startY = touch?.clientY ?? 0;
			startX = touch?.clientX ?? 0;
			if (releaseTimer) {
				window.clearTimeout(releaseTimer);
				releaseTimer = 0;
			}
			clearPressed(el);
			el.classList.add('is-pressed');
		},
		{ passive: true },
	);

	el.addEventListener(
		'touchmove',
		(event) => {
			if (!el.classList.contains('is-pressed')) return;
			const touch = event.touches[0];
			const y = touch?.clientY ?? startY;
			const x = touch?.clientX ?? startX;
			if (Math.abs(y - startY) > SCROLL_CANCEL_PX || Math.abs(x - startX) > SCROLL_CANCEL_PX) {
				releaseNow();
			}
		},
		{ passive: true },
	);

	el.addEventListener('touchend', releaseDelayed, { passive: true });
	el.addEventListener('touchcancel', releaseNow, { passive: true });
}

export function initPressFeedback() {
	if (!isCoarsePointer()) return;

	document.querySelectorAll<HTMLElement>(PRESS_SELECTOR).forEach(bindPressTarget);

	if (document.body.dataset.pressClearBound === 'true') return;
	document.body.dataset.pressClearBound = 'true';

	document.addEventListener(
		'touchstart',
		(event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (target.closest(PRESS_SELECTOR)) return;
			clearPressed();
		},
		{ passive: true, capture: true },
	);
}
