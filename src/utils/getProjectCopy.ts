import type { Locale } from './i18n.ts';
import {
	localeSectionCopy,
	resolveProjectSections,
	type ProjectSectionFields,
} from './getProjectSections.ts';

export type ProjectCopyFields = {
	title?: string;
	client?: string;
	clientLabel?: string;
	category?: string;
	heroSubtitle?: string;
	service?: string;
	industry?: string;
	market?: string;
	tools?: string;
	liveLabel?: string;
	overviewTitle?: string;
	overviewText?: string;
	challengesTitle?: string;
	challengesText?: string;
	strategyTitle?: string;
	strategyText?: string;
	summaryTitle?: string;
	summaryText?: string;
	sections?: ProjectSectionFields[];
};

type ProjectCopySource = {
	title: string;
	client: string;
	tags: string[];
	clientLabel?: string;
	heroSubtitle?: string;
	service?: string;
	industry?: string;
	market?: string;
	tools?: string;
	liveLabel?: string;
	overviewTitle?: string;
	overviewText?: string;
	challengesTitle?: string;
	challengesText?: string;
	challengesLabel?: string;
	challengesAfterGroup?: number;
	strategyTitle?: string;
	strategyText?: string;
	strategyLabel?: string;
	strategyAfterGroup?: number;
	summaryTitle?: string;
	summaryText?: string;
	summaryLabel?: string;
	sections?: {
		label?: string;
		title?: string;
		text?: string;
		theme?: 'light' | 'dark' | 'muted';
		afterGroup?: number;
	}[];
	i18n?: {
		pl?: ProjectCopyFields;
		pa?: ProjectCopyFields;
	};
};

export type ProjectCopyBundle = Record<Locale, ProjectCopyFields>;

export function buildProjectCopyBundle(data: ProjectCopySource): ProjectCopyBundle {
	const resolved = resolveProjectSections(data);

	const en: ProjectCopyFields = {
		title: data.title,
		client: data.client,
		clientLabel: data.clientLabel ?? '',
		category: data.tags[0] ?? '',
		heroSubtitle: data.heroSubtitle ?? '',
		service: data.service ?? '',
		industry: data.industry ?? '',
		market: data.market ?? '',
		tools: data.tools ?? '',
		liveLabel: data.liveLabel ?? '',
		overviewTitle: data.overviewTitle ?? '',
		overviewText: data.overviewText ?? '',
		challengesTitle: data.challengesTitle ?? '',
		challengesText: data.challengesText ?? '',
		strategyTitle: data.strategyTitle ?? '',
		strategyText: data.strategyText ?? '',
		summaryTitle: data.summaryTitle ?? '',
		summaryText: data.summaryText ?? '',
		sections: localeSectionCopy(resolved),
	};

	const withLocale = (localeCopy?: ProjectCopyFields): ProjectCopyFields => {
		const merged = { ...en, ...localeCopy };
		const hasExplicitSections = Boolean(data.sections && data.sections.length > 0);

		if (hasExplicitSections) {
			merged.sections = localeSectionCopy(resolved, localeCopy?.sections);
			return merged;
		}

		// Legacy: map old fields onto section slots by resolved order.
		const legacySections = resolved.map((section) => {
			const label = section.label;
			if (/challeng|wyzwan|reto/i.test(label)) {
				return {
					label: localeCopy?.sections?.[section.index]?.label ?? section.label,
					title: localeCopy?.challengesTitle ?? section.title,
					text: localeCopy?.challengesText ?? section.text,
				};
			}
			if (/strateg/i.test(label)) {
				return {
					label: localeCopy?.sections?.[section.index]?.label ?? section.label,
					title: localeCopy?.strategyTitle ?? section.title,
					text: localeCopy?.strategyText ?? section.text,
				};
			}
			if (/summar|podsum|resumen/i.test(label)) {
				return {
					label: localeCopy?.sections?.[section.index]?.label ?? section.label,
					title: localeCopy?.summaryTitle ?? section.title,
					text: localeCopy?.summaryText ?? section.text,
				};
			}
			return {
				label: localeCopy?.sections?.[section.index]?.label ?? section.label,
				title: localeCopy?.sections?.[section.index]?.title ?? section.title,
				text: localeCopy?.sections?.[section.index]?.text ?? section.text,
			};
		});

		merged.sections = legacySections;
		return merged;
	};

	return {
		en,
		pl: withLocale(data.i18n?.pl),
		pa: withLocale(data.i18n?.pa),
	};
}
