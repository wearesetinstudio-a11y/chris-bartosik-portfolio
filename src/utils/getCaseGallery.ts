import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const CASES_MEDIA_DIR = 'cases';
const MEDIA_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.mp4', '.webm']);
const FILE_PATTERN = /^(\d+)(?:[._](\d+))?\.(webp|jpg|jpeg|png|mp4|webm)$/i;

export type CaseMediaItem =
	| { type: 'image'; src: string; filename: string }
	| { type: 'video'; src: string; filename: string };

export type CaseMediaGroup = {
	group: number;
	items: CaseMediaItem[];
};

function isVideoExtension(extension: string): boolean {
	return extension === '.mp4' || extension === '.webm';
}

function preferVideoOverStill(filenames: string[]): string[] {
	const set = new Set(filenames);
	return filenames.filter((filename) => {
		const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
		const base = filename.slice(0, filename.lastIndexOf('.'));
		const webmName = `${base}.webm`;
		const mp4Name = `${base}.mp4`;

		if ((extension === '.webp' || extension === '.jpg' || extension === '.jpeg' || extension === '.png') &&
			(set.has(webmName) || set.has(mp4Name))) {
			return false;
		}

		if (extension === '.mp4' && set.has(webmName)) return false;
		return true;
	});
}

function toPublicPath(folderName: string, filename: string): string {
	return `/${CASES_MEDIA_DIR}/${folderName}/${filename}`;
}

/** Encode a public asset path for use in HTML `src` attributes (keeps `?v=` query intact). */
export function encodePublicAssetPath(src: string): string {
	const [path, query] = src.split('?');
	// encodeURI keeps `/` and `,` intact — Vite static serving 404s on `%2C`.
	const encoded = encodeURI(path);
	return query ? `${encoded}?${query}` : encoded;
}

function parseCaseFilename(filename: string): { group: number; part: number | null; extension: string } | null {
	const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
	if (!MEDIA_EXTENSIONS.has(extension)) return null;

	const match = filename.match(FILE_PATTERN);
	if (!match) return null;

	return {
		group: Number(match[1]),
		part: match[2] ? Number(match[2]) : null,
		extension,
	};
}

/** Read numbered case media and group by index (`1`, `2`, `3.1`+`3.2`, …). */
export function getCaseMediaGroups(folderName: string): CaseMediaGroup[] {
	const dir = join(process.cwd(), 'public', CASES_MEDIA_DIR, folderName);

	try {
		const filenames = preferVideoOverStill(
			readdirSync(dir).filter((filename) => {
				const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
				return MEDIA_EXTENSIONS.has(extension);
			}),
		);

		const groups = new Map<number, Array<CaseMediaItem & { part: number | null }>>();

		for (const filename of filenames) {
			const parsed = parseCaseFilename(filename);
			if (!parsed) continue;

			const item: CaseMediaItem & { part: number | null } = {
				type: isVideoExtension(parsed.extension) ? 'video' : 'image',
				filename,
				src: toPublicPath(folderName, filename),
				part: parsed.part,
			};

			const existing = groups.get(parsed.group) ?? [];
			existing.push(item);
			groups.set(parsed.group, existing);
		}

		return [...groups.keys()]
			.sort((a, b) => a - b)
			.map((group) => {
				const items = (groups.get(group) ?? [])
					.sort((a, b) => (a.part ?? 0) - (b.part ?? 0))
					.map(({ type, src, filename }) => ({ type, src, filename }));
				return { group, items };
			})
			.filter((entry) => entry.items.length > 0);
	} catch {
		return [];
	}
}

export function getCaseCover(folderName: string): CaseMediaItem | null {
	const groups = getCaseMediaGroups(folderName);
	return groups[0]?.items[0] ?? null;
}

export function getCaseMediaGroup(
	folderName: string,
	groupNumber: number,
): CaseMediaGroup | null {
	return getCaseMediaGroups(folderName).find((entry) => entry.group === groupNumber) ?? null;
}
