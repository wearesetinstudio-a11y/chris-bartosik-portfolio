import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		client: z.string(),
		tags: z.array(z.string()),
		thumbnail: z.string(),
		folderName: z.string().optional(),
		video: z.string().optional(),
		order: z.number(),
		heroSubtitle: z.string().optional().default(''),
		service: z.string().optional().default(''),
		industry: z.string().optional().default(''),
		market: z.string().optional().default(''),
		liveUrl: z.string().optional().default(''),
		logo: z.string().optional().default(''),
		heroImage: z.string().optional().default(''),
		heroBackground: z.string().optional().default(''),
		overviewLabel: z.string().optional().default('Overview'),
		overviewTitle: z.string().optional().default(''),
		overviewText: z.string().optional().default(''),
		overviewGraphic: z.string().optional().default(''),
		year: z.number().optional(),
		challengesLabel: z.string().optional().default('Challenges'),
		challengesText: z.string().optional().default(''),
		challengesAfterGroup: z.number().optional().default(2),
		strategyLabel: z.string().optional().default('Strategy'),
		strategyTitle: z.string().optional().default(''),
		strategyText: z.string().optional().default(''),
		strategyAfterGroup: z.number().optional().default(8),
		summaryLabel: z.string().optional().default('Summary'),
		summaryTitle: z.string().optional().default(''),
		summaryText: z.string().optional().default(''),
	}),
});

export const collections = { projects };
