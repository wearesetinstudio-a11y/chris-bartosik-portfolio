import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSectionCopyFields = z
	.object({
		label: z.string().optional(),
		title: z.string().optional(),
		text: z.string().optional(),
	})
	.partial();

const projectSectionSchema = z.object({
	label: z.string().optional().default(''),
	title: z.string().optional().default(''),
	text: z.string().optional().default(''),
	theme: z.enum(['light', 'dark', 'muted']).optional().default('light'),
	afterGroup: z.number().optional(),
});

const projectCopyFields = z
	.object({
		title: z.string().optional(),
		client: z.string().optional(),
		clientLabel: z.string().optional(),
		category: z.string().optional(),
		heroSubtitle: z.string().optional(),
		service: z.string().optional(),
		industry: z.string().optional(),
		market: z.string().optional(),
		tools: z.string().optional(),
		liveLabel: z.string().optional(),
		overviewLabel: z.string().optional(),
		overviewTitle: z.string().optional(),
		overviewText: z.string().optional(),
		challengesTitle: z.string().optional(),
		challengesText: z.string().optional(),
		strategyTitle: z.string().optional(),
		strategyText: z.string().optional(),
		summaryTitle: z.string().optional(),
		summaryText: z.string().optional(),
		quote: z.string().optional(),
		quoteAuthor: z.string().optional(),
		quoteRole: z.string().optional(),
		quoteLabel: z.string().optional(),
		sections: z.array(projectSectionCopyFields).max(10).optional(),
	})
	.partial();

const workItemSchema = z.object({
	title: z.string(),
	client: z.string(),
	tags: z.array(z.string()),
	categories: z
		.array(z.enum(['ux-ui', 'motion', 'ai-engineering', 'development', 'branding']))
		.optional()
		.default([]),
	thumbnail: z.string().optional().default(''),
	folderName: z.string().optional(),
	video: z.string().optional(),
	comingSoon: z.boolean().optional().default(false),
	order: z.number(),
	heroSubtitle: z.string().optional().default(''),
	clientLabel: z.string().optional().default(''),
	service: z.string().optional().default(''),
	industry: z.string().optional().default(''),
	market: z.string().optional().default(''),
	tools: z.string().optional().default(''),
	liveLabel: z.string().optional().default(''),
	liveUrl: z.string().optional().default(''),
	logo: z.string().optional().default(''),
	heroImage: z.string().optional().default(''),
	heroBackground: z.string().optional().default(''),
	overviewLabel: z.string().optional().default(''),
	overviewTitle: z.string().optional().default(''),
	overviewText: z.string().optional().default(''),
	overviewGraphic: z.string().optional().default(''),
	quote: z.string().optional().default(''),
	quoteAuthor: z.string().optional().default(''),
	quoteRole: z.string().optional().default(''),
	quoteLabel: z.string().optional().default(''),
	year: z.number().optional(),
	/** Flexible content sections under overview (max 10). */
	sections: z.array(projectSectionSchema).max(10).optional().default([]),
	/** @deprecated Prefer `sections` */
	challengesLabel: z.string().optional().default('Challenges'),
	challengesTitle: z.string().optional().default(''),
	challengesText: z.string().optional().default(''),
	challengesAfterGroup: z.number().optional().default(2),
	/** @deprecated Prefer `sections` */
	strategyLabel: z.string().optional().default('Strategy'),
	strategyTitle: z.string().optional().default(''),
	strategyText: z.string().optional().default(''),
	strategyAfterGroup: z.number().optional().default(8),
	/** @deprecated Prefer `sections` */
	summaryLabel: z.string().optional().default('Summary'),
	summaryTitle: z.string().optional().default(''),
	summaryText: z.string().optional().default(''),
	i18n: z
		.object({
			pl: projectCopyFields.optional(),
			pa: projectCopyFields.optional(),
		})
		.optional(),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: workItemSchema,
});

export const collections = { projects };
