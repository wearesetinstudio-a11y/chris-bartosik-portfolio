import { getCollection } from 'astro:content';

export async function getSiteCounts() {
	const [projects, articles] = await Promise.all([
		getCollection('projects'),
		getCollection('articles'),
	]);

	return {
		projectCount: projects.length,
		articleCount: articles.length,
	};
}
