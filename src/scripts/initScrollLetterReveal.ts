import { t } from '../utils/i18n.ts';
import { onScrollFrame } from './scrollFrame.ts';

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

type RevealOptions = { startLine?: number; endLine?: number };

const revealJobs = new Map<string, () => void>();
let scrollBound = false;

function bindRevealScroll() {
	if (scrollBound) return;
	scrollBound = true;
	onScrollFrame(() => {
		for (const job of revealJobs.values()) {
			job();
		}
	});
}

function createRevealJob(headingIds: string[], options: RevealOptions) {
	const startLineRatio = options.startLine ?? 0.88;
	const endLineRatio = options.endLine ?? 0.45;

	return () => {
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
	};
}

export function initScrollLetterReveal(
	headingId: string,
	options: RevealOptions = {},
): void {
	initScrollLetterReveals([headingId], options);
}

export function initScrollLetterReveals(
	headingIds: string[],
	options: RevealOptions = {},
): void {
	const key = [...headingIds].sort().join('|');
	if (revealJobs.has(key)) {
		revealJobs.get(key)?.();
		return;
	}

	for (const headingId of headingIds) {
		const heading = document.getElementById(headingId);
		if (!heading) continue;

		heading.querySelectorAll('[data-reveal-line]').forEach((line) => {
			wrapRevealLetters(line as HTMLElement);
		});
	}

	const job = createRevealJob(headingIds, options);
	revealJobs.set(key, job);
	bindRevealScroll();
	job();
}
