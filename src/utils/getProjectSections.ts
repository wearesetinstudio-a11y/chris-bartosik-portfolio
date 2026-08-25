import type { Locale } from './i18n.ts';

export type ProjectSectionTheme = 'light' | 'dark' | 'muted';

export type ProjectSectionFields = {
	label?: string;
	title?: string;
	text?: string;
};

export type ProjectSection = ProjectSectionFields & {
	theme?: ProjectSectionTheme;
	/** Insert after this full gallery group (e.g. 2 → after 2.webp + 2.1/2.2). */
	afterGroup?: number;
};

export type ResolvedProjectSection = {
	index: number;
	label: string;
	title: string;
	text: string;
	theme: ProjectSectionTheme;
	afterGroup?: number;
};

type LegacySectionSource = {
	sections?: ProjectSection[];
	challengesLabel?: string;
	challengesTitle?: string;
	challengesText?: string;
	challengesAfterGroup?: number;
	strategyLabel?: string;
	strategyTitle?: string;
	strategyText?: string;
	strategyAfterGroup?: number;
	summaryLabel?: string;
	summaryTitle?: string;
	summaryText?: string;
};

/** Fixed rhythm after overview: dark → light → muted → dark → … */
const SECTION_THEME_CYCLE: ProjectSectionTheme[] = ['dark', 'light', 'muted'];

function themeForSectionIndex(index: number): ProjectSectionTheme {
	return SECTION_THEME_CYCLE[index % SECTION_THEME_CYCLE.length];
}

function isSummaryLabel(label: string): boolean {
	return /summar|podsum|resultado|resumen/i.test(label);
}

function stripLabelBrackets(label: string): string {
	return label.replace(/^\[\s*/, '').replace(/\s*\]$/, '').replace(/\s*\}$/, '').trim();
}

/** Prefer explicit `sections` (max 8). Fall back to legacy challenge/strategy/summary fields. */
export function resolveProjectSections(data: LegacySectionSource): ResolvedProjectSection[] {
	let resolved: ResolvedProjectSection[] = [];

	if (data.sections && data.sections.length > 0) {
		resolved = data.sections
			.slice(0, 8)
			.map((section, index) => {
				const label = stripLabelBrackets(section.label?.trim() ?? '');
				const isSummary = isSummaryLabel(label);
				return {
					index,
					label,
					title: section.title?.trim() ?? '',
					text: section.text?.trim() ?? '',
					theme: themeForSectionIndex(index),
					// Summary is always trailing (after the full gallery)
					afterGroup: isSummary ? undefined : section.afterGroup,
				};
			})
			.filter((section) => section.label || section.title || section.text);
	} else {
		const legacy: ResolvedProjectSection[] = [];

		if (data.challengesTitle || data.challengesText) {
			legacy.push({
				index: 0,
				label: stripLabelBrackets(data.challengesLabel?.trim() || 'Challenges'),
				title: data.challengesTitle?.trim() ?? '',
				text: data.challengesText?.trim() ?? '',
				theme: themeForSectionIndex(0),
				afterGroup: data.challengesAfterGroup ?? 2,
			});
		}

		if (data.strategyTitle || data.strategyText) {
			legacy.push({
				index: legacy.length,
				label: stripLabelBrackets(data.strategyLabel?.trim() || 'Strategy'),
				title: data.strategyTitle?.trim() ?? '',
				text: data.strategyText?.trim() ?? '',
				theme: themeForSectionIndex(legacy.length),
				afterGroup: data.strategyAfterGroup ?? 8,
			});
		}

		if (data.summaryTitle || data.summaryText) {
			legacy.push({
				index: legacy.length,
				label: stripLabelBrackets(data.summaryLabel?.trim() || 'Summary'),
				title: data.summaryTitle?.trim() ?? '',
				text: data.summaryText?.trim() ?? '',
				theme: themeForSectionIndex(legacy.length),
			});
		}

		resolved = legacy.slice(0, 8);
	}

	// Re-index + re-theme after filter; keep Summary sections last (trailing).
	// Default rhythm without explicit afterGroup:
	// group 2 → section 0 → group 3 → section 1 → … → remaining gallery → Summary
	const content = resolved.filter((section) => !isSummaryLabel(section.label));
	const summaries = resolved.filter((section) => isSummaryLabel(section.label));
	const ordered = [...content, ...summaries].slice(0, 8);

	return ordered.map((section, index) => ({
		...section,
		index,
		theme: themeForSectionIndex(index),
		afterGroup: isSummaryLabel(section.label)
			? undefined
			: section.afterGroup ?? index + 2,
	}));
}

export function mergeSectionCopy(
	base: ProjectSectionFields[],
	override?: ProjectSectionFields[],
): ProjectSectionFields[] {
	if (!override?.length) return base;

	const length = Math.max(base.length, override.length);
	return Array.from({ length }, (_, index) => ({
		...base[index],
		...override[index],
	}));
}

export type ProjectPageSegment =
	| { type: 'gallery'; blocks: import('./getProjectGallery.ts').GalleryLayoutBlock[] }
	| { type: 'section'; section: ResolvedProjectSection };

export function buildProjectPageSegments(
	gallery: import('./getProjectGallery.ts').GalleryLayoutBlock[],
	sections: ResolvedProjectSection[],
	splitAfterLead: (
		blocks: import('./getProjectGallery.ts').GalleryLayoutBlock[],
		afterGroup: number,
	) => {
		before: import('./getProjectGallery.ts').GalleryLayoutBlock[];
		after: import('./getProjectGallery.ts').GalleryLayoutBlock[];
	},
): ProjectPageSegment[] {
	const placed = sections
		.filter((section) => typeof section.afterGroup === 'number')
		.sort((a, b) => (a.afterGroup ?? 0) - (b.afterGroup ?? 0));
	const trailing = sections.filter((section) => typeof section.afterGroup !== 'number');

	const segments: ProjectPageSegment[] = [];
	let remaining = gallery;

	for (const section of placed) {
		const { before, after } = splitAfterLead(remaining, section.afterGroup as number);
		if (before.length > 0) segments.push({ type: 'gallery', blocks: before });
		segments.push({ type: 'section', section });
		remaining = after;
	}

	if (remaining.length > 0) segments.push({ type: 'gallery', blocks: remaining });

	for (const section of trailing) {
		segments.push({ type: 'section', section });
	}

	return segments;
}

export function localeSectionCopy(
	sections: ResolvedProjectSection[],
	localeSections?: ProjectSectionFields[],
): ProjectSectionFields[] {
	return sections.map((section, index) => ({
		label: localeSections?.[index]?.label ?? section.label,
		title: localeSections?.[index]?.title ?? section.title,
		text: localeSections?.[index]?.text ?? section.text,
	}));
}
