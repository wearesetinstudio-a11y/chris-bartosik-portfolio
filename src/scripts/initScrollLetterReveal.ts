import { t } from '../utils/i18n.ts';

export function wrapRevealLetters(element: HTMLElement) {
	const key = element.dataset.i18n;
	const text = ((key ? t(key) : element.textContent) ?? '').replace(/\s+/g, ' ').trim();
	if (!text) return;

	element.textContent = '';

	const words = text.split(' ');
	words.forEach((word, index) => {
		const wordEl = document.createElement('span');
		wordEl.className = 'reveal-word';

		for (const char of word) {
			const span = document.createElement('span');
			span.className = 'reveal-char';
			span.textContent = char;
			wordEl.appendChild(span);
		}

		element.appendChild(wordEl);
		if (index < words.length - 1) {
			element.appendChild(document.createTextNode(' '));
		}
	});
}

export function initScrollLetterReveal(
	headingId: string,
	options: { startLine?: number; endLine?: number } = {},
): void {
	initScrollLetterReveals([headingId], options);
}

export function initScrollLetterReveals(
	headingIds: string[],
	options: { startLine?: number; endLine?: number } = {},
): void {
	const startLineRatio = options.startLine ?? 0.88;
	const endLineRatio = options.endLine ?? 0.45;

	let listenersReady = false;
	let scrollTicking = false;

	function updateReveal() {
		const viewportHeight = window.innerHeight;
		const startLine = viewportHeight * startLineRatio;
		const endLine = viewportHeight * endLineRatio;
		const range = startLine - endLine;

		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;

			const chars = heading.querySelectorAll('.reveal-char');
			if (!chars.length) continue;

			const rect = heading.getBoundingClientRect();
			const progress = Math.min(1, Math.max(0, (startLine - rect.top) / range));
			const activeCount = Math.ceil(progress * chars.length);

			chars.forEach((char, index) => {
				char.classList.toggle('active', index < activeCount);
			});
		}
	}

	function onScroll() {
		if (scrollTicking) return;
		scrollTicking = true;
		requestAnimationFrame(() => {
			updateReveal();
			scrollTicking = false;
		});
	}

	function init() {
		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;

			heading.querySelectorAll('[data-reveal-line]').forEach((line) => {
				wrapRevealLetters(line as HTMLElement);
			});
		}

		updateReveal();

		if (!listenersReady) {
			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('resize', updateReveal, { passive: true });
			listenersReady = true;
		}
	}

	init();
}
