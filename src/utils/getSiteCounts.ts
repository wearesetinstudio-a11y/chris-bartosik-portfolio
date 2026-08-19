import { getCollection } from 'astro:content';
import { articles } from '../data/articles.ts';

export async function getSiteCounts() {
	const projects = await getCollection('projects');

	return {
		projectCount: projects.length,
		articleCount: articles.length,
	};
}
