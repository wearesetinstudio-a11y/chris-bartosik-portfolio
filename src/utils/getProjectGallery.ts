import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MEDIA_EXTENSIONS = new Set(['.webp', '.mp4', '.webm', '.riv', '.svg']);
const DEFAULT_EXCLUDED = new Set([
	'bg.webp',
	'cover.webp',
	'cover.mp4',
	'cover.webm',
	'cover.riv',
	'cover.svg',
]);
const PROJECT_MEDIA_DIR = 'portfolio';

function isVideoExtension(extension: string): boolean {
	return extension === '.mp4' || extension === '.webm';
}

function isRiveExtension(extension: string): boolean {
	return extension === '.riv';
}

function isSvgExtension(extension: string): boolean {
	return extension === '.svg';
}

function mediaTypeFromExtension(extension: string): GalleryMediaItem['type'] {
	if (isRiveExtension(extension)) return 'rive';
	if (isSvgExtension(extension)) return 'svg';
	if (isVideoExtension(extension)) return 'video';
	return 'image';
}

export type GalleryMediaItem =
	| { type: 'image'; src: string; filename: string }
	| { type: 'video'; src: string; filename: string }
	| { type: 'rive'; src: string; filename: string }
	| { type: 'svg'; src: string; filename: string };

export type GalleryLayoutBlock =
	| { kind: 'full'; item: GalleryMediaItem; group: number; part?: number | null }
	| { kind: 'grid'; items: GalleryMediaItem[]; group: number; leadFull?: boolean };

type ParsedMediaFile = GalleryMediaItem & {
	group: number;
	part: number | null;
};

const FILE_PATTERN = /^(\d+)(?:\.(\d+))?\.(webp|mp4|webm|riv|svg)$/i;

export function getCoverFilename(thumbnail: string): string {
	return thumbnail.split('/').pop() ?? 'cover.webp';
}

export function resolveProjectFolderName(project: {
	id: string;
	data: { folderName?: string };
}): string {
	return project.data.folderName ?? project.id;
}

export function getProjectCoverMedia(project: {
	id: string;
	data: { folderName?: string; thumbnail?: string; video?: string };
}): { src: string; type: GalleryMediaItem['type'] } {
	const folder = resolveProjectFolderName(project);
	const folderDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folder);
	try {
		const files = readdirSync(folderDir);
		const coverFiles = files.filter((f) => /^cover\.(riv|webm|mp4|webp|svg)$/i.test(f));
		const preferred = preferRiveFilenames(coverFiles)[0];
		if (preferred) {
			const ext = preferred.slice(preferred.lastIndexOf('.')).toLowerCase();
			return {
				src: `/${PROJECT_MEDIA_DIR}/${folder}/${preferred}`,
				type: mediaTypeFromExtension(ext),
			};
		}
	} catch {
		/* ignore */
	}

	const explicit = project.data.video || project.data.thumbnail || '';
	const ext = explicit.slice(explicit.lastIndexOf('.')).toLowerCase();
	return {
		src: explicit,
		type: mediaTypeFromExtension(ext),
	};
}

/** Prefer .riv, then .svg, then video over raster siblings with the same basename. */
export function preferRiveFilenames(filenames: string[]): string[] {
	const set = new Set(filenames);
	return filenames.filter((filename) => {
		const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
		const base = filename.slice(0, filename.lastIndexOf('.'));
		const rivName = `${base}.riv`;
		const svgName = `${base}.svg`;
		const webmName = `${base}.webm`;
		const mp4Name = `${base}.mp4`;

		if (isRiveExtension(extension)) return true;
		if (set.has(rivName)) return false;

		if (isSvgExtension(extension)) return true;
		if (set.has(svgName)) return false;

		// Prefer motion over still when both share a basename (e.g. 5.webm + 5.webp).
		if (extension === '.webp' && (set.has(webmName) || set.has(mp4Name))) return false;

		// Prefer webm over mp4 when both exist.
		if (extension === '.mp4' && set.has(webmName)) return false;

		return true;
	});
}

function parseMediaFilename(filename: string): ParsedMediaFile | null {
	const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
	if (!MEDIA_EXTENSIONS.has(extension)) return null;

	const match = filename.match(FILE_PATTERN);
	if (!match) return null;

	const group = Number(match[1]);
	const part = match[2] ? Number(match[2]) : null;

	return {
		type: mediaTypeFromExtension(extension),
		src: '',
		filename,
		group,
		part,
	};
}

function toMediaItem(
	folderName: string,
	filename: string,
	type: GalleryMediaItem['type'],
): GalleryMediaItem {
	return {
		type,
		filename,
		src: `/${PROJECT_MEDIA_DIR}/${folderName}/${filename}`,
	};
}

export function getProjectGalleryFiles(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryMediaItem[] {
	const portfolioDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folderName);
	const excluded = new Set([coverFilename, ...DEFAULT_EXCLUDED, ...excludedFilenames]);

	try {
		const filenames = preferRiveFilenames(
			readdirSync(portfolioDir).filter((filename) => {
				if (excluded.has(filename)) return false;
				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return MEDIA_EXTENSIONS.has(extension);
			}),
		);

		return filenames
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.map((filename) => {
				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return toMediaItem(folderName, filename, mediaTypeFromExtension(extension));
			});
	} catch {
		return [];
	}
}

/**
 * Builds gallery layout per section/group.
 * Rule:
 * - 1 large (part 1 or single) → full block
 * - 2 smaller (part 2 and 3) → 2-column grid block
 * - 1 large (part 4 or last single) → full block
 * Also supports legacy part naming (.1, .2) or plain singles seamlessly.
 */
export function buildGalleryLayout(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryLayoutBlock[] {
	const portfolioDir = join(process.cwd(), 'public', PROJECT_MEDIA_DIR, folderName);
	const excluded = new Set([coverFilename, ...DEFAULT_EXCLUDED, ...excludedFilenames]);

	try {
		const filenames = preferRiveFilenames(
			readdirSync(portfolioDir).filter((filename) => !excluded.has(filename)),
		);

		const parsedFiles = filenames
			.map((filename) => {
				const parsed = parseMediaFilename(filename);
				if (!parsed) return null;

				return {
					...parsed,
					src: `/${PROJECT_MEDIA_DIR}/${folderName}/${filename}`,
				};
			})
			.filter((file): file is ParsedMediaFile => file !== null)
			.sort((a, b) => {
				if (a.group !== b.group) return a.group - b.group;
				return (a.part ?? 0) - (b.part ?? 0);
			});

		const groups = new Map<number, ParsedMediaFile[]>();

		for (const file of parsedFiles) {
			const existing = groups.get(file.group) ?? [];
			existing.push(file);
			groups.set(file.group, existing);
		}

		const layout: GalleryLayoutBlock[] = [];

		for (const group of [...groups.keys()].sort((a, b) => a - b)) {
			const files = groups.get(group) ?? [];
			const parts = files.filter((file) => file.part !== null);
			const singles = files.filter((file) => file.part === null);

			// Check if files follow X.1, X.2, X.3, X.4 structure
			if (parts.length > 0) {
				const p1 = parts.find((f) => f.part === 1);
				const p2 = parts.find((f) => f.part === 2);
				const p3 = parts.find((f) => f.part === 3);
				const p4 = parts.find((f) => f.part === 4);
				const others = parts.filter((f) => f.part !== null && ![1, 2, 3, 4].includes(f.part));

				// If we have 1 large at start
				if (p1) {
					layout.push({
						kind: 'full',
						group,
						part: 1,
						item: toMediaItem(folderName, p1.filename, p1.type),
					});
				}

				// If we have 2 middle smaller (or even just p2 or p3)
				const middleParts = [p2, p3].filter((f): f is ParsedMediaFile => Boolean(f));
				if (middleParts.length > 0) {
					layout.push({
						kind: 'grid',
						group,
						items: middleParts.map((p) => toMediaItem(folderName, p.filename, p.type)),
					});
				}

				// If we have 1 large at end (part 4)
				if (p4) {
					layout.push({
						kind: 'full',
						group,
						part: 4,
						item: toMediaItem(folderName, p4.filename, p4.type),
					});
				}

				// Fallback for legacy parts that were only .1 and .2 without 3/4 and without p1
				if (!p1 && !p4 && middleParts.length === 0 && others.length > 0) {
					layout.push({
						kind: 'grid',
						group,
						items: others.map((p) => toMediaItem(folderName, p.filename, p.type)),
					});
				} else if (others.length > 0) {
					layout.push({
						kind: 'grid',
						group,
						items: others.map((p) => toMediaItem(folderName, p.filename, p.type)),
					});
				}
			}

			// Also process singles if any exist for this group
			for (const single of singles) {
				layout.push({
					kind: 'full',
					group,
					part: null,
					item: toMediaItem(folderName, single.filename, single.type),
				});
			}
		}

		if (layout.length > 0) return layout;

		return getProjectGalleryFiles(folderName, coverFilename, excludedFilenames).map((item, index) => ({
			kind: 'full' as const,
			group: index + 1,
			item,
		}));
	} catch {
		return [];
	}
}

export function getOverviewGraphic(
	folderName: string,
	coverFilename = 'cover.webp',
	excludedFilenames: string[] = [],
): GalleryMediaItem | null {
	const layout = buildGalleryLayout(folderName, coverFilename, excludedFilenames);
	const groupOne = layout.find((block) => block.group === 1);
	if (!groupOne) return null;

	if (groupOne.kind === 'full') return groupOne.item;
	return groupOne.items[0] ?? null;
}

/** @deprecated Use buildGalleryLayout instead */
export function getProjectGallery(folderName: string, coverFilename = 'cover.webp'): GalleryMediaItem[] {
	return getProjectGalleryFiles(folderName, coverFilename);
}
