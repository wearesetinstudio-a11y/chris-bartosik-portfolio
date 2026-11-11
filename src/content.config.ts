import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSectionSchema = z.object({
	label: z.string().optional().default(''),
	title: z.string().optional().default(''),
	text: z.string().optional().default(''),
	theme: z.enum(['light', 'dark', 'muted']).optional().default('light'),
	afterGroup: z.number().optional(),
});

const workItemSchema = z.object({
	title: z.string(),
	client: z.string(),
	tags: z.array(z.string()),
	categories: z
		.array(
			z.enum([
				'ai-direction',
				'motion',
				'websites',
				'engineering',
				'brand-design',
				'product-design',
				'applications',
			]),
		)
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
	overviewYoutube: z.string().optional().default(''),
	quote: z.string().optional().default(''),
	quoteAuthor: z.string().optional().default(''),
	quoteRole: z.string().optional().default(''),
	quoteLabel: z.string().optional().default(''),
	year: z.union([z.number(), z.string()]).optional(),
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
	/** Legacy PL/ES project translations — ignored (English-only site). */
	i18n: z.record(z.string(), z.unknown()).optional(),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: workItemSchema,
});

export const collections = { projects };
