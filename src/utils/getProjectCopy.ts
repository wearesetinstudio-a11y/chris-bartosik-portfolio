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
	overviewLabel?: string;
	overviewTitle?: string;
	overviewText?: string;
	challengesTitle?: string;
	challengesText?: string;
	strategyTitle?: string;
	strategyText?: string;
	summaryTitle?: string;
	summaryText?: string;
	quote?: string;
	quoteAuthor?: string;
	quoteRole?: string;
	quoteLabel?: string;
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
	overviewLabel?: string;
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
	quote?: string;
	quoteAuthor?: string;
	quoteRole?: string;
	quoteLabel?: string;
	sections?: {
		label?: string;
		title?: string;
		text?: string;
		theme?: 'light' | 'dark' | 'muted';
		afterGroup?: number;
	}[];
};

export type ProjectCopyBundle = {
	en: ProjectCopyFields;
};

export function buildProjectCopyBundle(data: ProjectCopySource): ProjectCopyBundle {
	const resolved = resolveProjectSections(data);

	return {
		en: {
			title: data.title,
			client: data.client,
			clientLabel: data.clientLabel ?? '',
			category: data.tags && data.tags.length > 0 ? data.tags.join(', ') : (data.tags?.[0] ?? ''),
			heroSubtitle: data.heroSubtitle ?? '',
			service: data.service ?? '',
			industry: data.industry ?? '',
			market: data.market ?? '',
			tools: data.tools ?? '',
			liveLabel: data.liveLabel ?? '',
			overviewLabel: data.overviewLabel ?? '',
			overviewTitle: data.overviewTitle ?? '',
			overviewText: data.overviewText ?? '',
			challengesTitle: data.challengesTitle ?? '',
			challengesText: data.challengesText ?? '',
			strategyTitle: data.strategyTitle ?? '',
			strategyText: data.strategyText ?? '',
			summaryTitle: data.summaryTitle ?? '',
			summaryText: data.summaryText ?? '',
			quote: data.quote ?? '',
			quoteAuthor: data.quoteAuthor ?? '',
			quoteRole: data.quoteRole ?? '',
			quoteLabel: data.quoteLabel ?? '',
			sections: localeSectionCopy(resolved),
		},
	};
}
