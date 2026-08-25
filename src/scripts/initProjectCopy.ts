import type { Locale } from '../utils/i18n.ts';
import { parseProjectCopyBlocks } from '../utils/parseProjectCopyBlocks.ts';
import { wrapRevealLetters } from './initScrollLetterReveal.ts';

type CopyMap = Record<string, string> & {
	sections?: { label?: string; title?: string; text?: string }[];
};
type Bundle = Partial<Record<Locale, CopyMap>> & { en?: CopyMap };

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderProjectCopyHtml(value: string, paragraphClass: string) {
	return parseProjectCopyBlocks(value)
		.map((block) => {
			if (block.type === 'list') {
				const items = block.items
					.map((item) => {
						const label = item.title
							? `<strong>${escapeHtml(item.title)}:</strong>${item.body ? ` ${escapeHtml(item.body)}` : ''}`
							: escapeHtml(item.body);
						return `<li>${label}</li>`;
					})
					.join('');
				return `<ul class="project-content-block__list">${items}</ul>`;
			}

			return `<p class="${paragraphClass}">${escapeHtml(block.text)}</p>`;
		})
		.join('');
}

function clearWindowCopy() {
	if (typeof globalThis === 'undefined') return;
	delete (globalThis as { __projectCopy?: Bundle }).__projectCopy;
}

function readBundleFromNode(node: HTMLElement): Bundle | null {
	const raw =
		node instanceof HTMLTemplateElement
			? node.content.textContent || node.innerHTML
			: node.textContent || node.innerHTML;

	if (!raw?.trim()) return null;

	try {
		return JSON.parse(raw) as Bundle;
	} catch {
		return null;
	}
}

function readBundle(): Bundle | null {
	const node = document.getElementById('project-copy-data');

	if (!node) {
		clearWindowCopy();
		return null;
	}

	const fromDom = readBundleFromNode(node);
	if (fromDom?.en) {
		(globalThis as { __projectCopy?: Bundle }).__projectCopy = fromDom;
		return fromDom;
	}

	const fromWindow =
		typeof globalThis !== 'undefined'
			? (globalThis as { __projectCopy?: Bundle }).__projectCopy
			: undefined;

	return fromWindow?.en ? fromWindow : null;
}

function applySectionCopy(copy: CopyMap) {
	document.querySelectorAll<HTMLElement>('[data-project-section]').forEach((section) => {
		const index = Number(section.dataset.projectSection);
		if (!Number.isFinite(index)) return;

		const sectionCopy = copy.sections?.[index];
		if (!sectionCopy) return;

		section.querySelectorAll<HTMLElement>('[data-project-section-field]').forEach((element) => {
			const field = element.dataset.projectSectionField;
			if (!field) return;

			const value = sectionCopy[field as 'label' | 'title' | 'text'];
			if (value == null) return;

			if (field === 'text') {
				const className = element.dataset.paragraphClass || 'project-content-block__text';
				element.innerHTML = value.trim()
					? renderProjectCopyHtml(value, className)
					: '';
				return;
			}

			const revealLine = element.hasAttribute('data-reveal-line')
				? element
				: element.querySelector<HTMLElement>('[data-reveal-line]');

			if (revealLine) {
				revealLine.textContent = value;
				wrapRevealLetters(revealLine);
				return;
			}

			element.textContent = value;
		});
	});
}

export function applyProjectCopy(locale: Locale) {
	document.querySelectorAll<HTMLElement>('[data-locale-copy]').forEach((element) => {
		try {
			const map = JSON.parse(element.dataset.localeCopy || '{}') as CopyMap;
			const value = map[locale] || map.en;
			if (value) element.textContent = value;
		} catch {
			/* ignore malformed maps */
		}
	});

	const bundle = readBundle();
	if (!bundle?.en) return;

	const copy = { ...bundle.en, ...(bundle[locale] ?? {}) } as CopyMap;
	if (bundle[locale]?.sections || bundle.en?.sections) {
		copy.sections = bundle[locale]?.sections ?? bundle.en?.sections;
	}

	const hero =
		document.getElementById('project-hero-headline') ??
		document.querySelector<HTMLElement>('#project-hero #hero-headline');

	if (hero) {
		if (copy.heroSubtitle) {
			const lines = copy.heroSubtitle
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean);
			hero.innerHTML = lines.map((line) => `<span class="block">${escapeHtml(line)}</span>`).join('');
			hero.closest<HTMLElement>('[data-hero-part="tagline"]')?.removeAttribute('hidden');
		} else {
			hero.innerHTML = '';
			hero.closest<HTMLElement>('[data-hero-part="tagline"]')?.setAttribute('hidden', '');
		}
	}

	document.querySelectorAll<HTMLElement>('[data-project-field]').forEach((element) => {
		const key = element.dataset.projectField;
		if (!key) return;

		const value = copy[key];

		if (key === 'clientLabel') {
			const next = (typeof value === 'string' ? value : '').trim();
			if (next) {
				element.textContent = next;
				element.closest('.project-hero__client-label')?.removeAttribute('hidden');
			} else if (element.hasAttribute('data-i18n')) {
				/* i18n layer fills the default Client / Klient / Cliente label */
			} else {
				element.textContent = '';
				element.closest('.project-hero__client-label')?.setAttribute('hidden', '');
			}
			return;
		}

		if (key === 'overviewLabel') {
			const next = (typeof value === 'string' ? value : '').trim();
			if (next) {
				element.textContent = next;
			} else if (element.hasAttribute('data-i18n')) {
				/* i18n layer fills Overview / Kontekst / Descripción */
			}
			return;
		}

		if (typeof value !== 'string' || value === '') {
			if (key === 'client') {
				element.textContent = '';
				element.setAttribute('hidden', '');
			}
			return;
		}

		if (key === 'client') {
			element.textContent = value.toUpperCase();
			element.removeAttribute('hidden');
			return;
		}

		const revealLine = element.hasAttribute('data-reveal-line')
			? element
			: element.querySelector<HTMLElement>('[data-reveal-line]');

		if (revealLine) {
			revealLine.textContent = value;
			wrapRevealLetters(revealLine);
			return;
		}

		if (element.dataset.projectParagraphs === 'true') {
			const className = element.dataset.paragraphClass || '';
			element.innerHTML = renderProjectCopyHtml(value, className);
			return;
		}

		element.textContent = value;
	});

	applySectionCopy(copy);
}
