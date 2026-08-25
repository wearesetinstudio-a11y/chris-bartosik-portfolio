import type { Locale } from './i18n.ts';

export type ProjectSectionTheme = 'light' | 'dark' | 'muted';

export type ProjectSectionFields = {
	label?: string;
	title?: string;
	text?: string;
};

export type ProjectSection = ProjectSectionFields & {
	theme?: ProjectSectionTheme;
	/** Insert after this gallery group's lead frame (e.g. 2 → after 2.webp, before 2.1/2.2). */
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

function normalizeTheme(theme: unknown): ProjectSectionTheme {
	if (theme === 'dark' || theme === 'muted' || theme === 'light') return theme;
	return 'light';
}

/** Prefer explicit `sections` (max 8). Fall back to legacy challenge/strategy/summary fields. */
export function resolveProjectSections(data: LegacySectionSource): ResolvedProjectSection[] {
	if (data.sections && data.sections.length > 0) {
		return data.sections.slice(0, 8).map((section, index) => ({
			index,
			label: section.label?.trim() ?? '',
			title: section.title?.trim() ?? '',
			text: section.text?.trim() ?? '',
			theme: normalizeTheme(section.theme),
			afterGroup: section.afterGroup,
		})).filter((section) => section.label || section.title || section.text);
	}

	const legacy: ResolvedProjectSection[] = [];

	if (data.challengesTitle || data.challengesText) {
		legacy.push({
			index: 0,
			label: data.challengesLabel?.trim() || 'Challenges',
			title: data.challengesTitle?.trim() ?? '',
			text: data.challengesText?.trim() ?? '',
			theme: 'dark',
			afterGroup: data.challengesAfterGroup ?? 2,
		});
	}

	if (data.strategyTitle || data.strategyText) {
		legacy.push({
			index: legacy.length,
			label: data.strategyLabel?.trim() || 'Strategy',
			title: data.strategyTitle?.trim() ?? '',
			text: data.strategyText?.trim() ?? '',
			theme: 'muted',
			afterGroup: data.strategyAfterGroup ?? 8,
		});
	}

	if (data.summaryTitle || data.summaryText) {
		legacy.push({
			index: legacy.length,
			label: data.summaryLabel?.trim() || 'Summary',
			title: data.summaryTitle?.trim() ?? '',
			text: data.summaryText?.trim() ?? '',
			theme: 'light',
		});
	}

	return legacy.slice(0, 8);
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
