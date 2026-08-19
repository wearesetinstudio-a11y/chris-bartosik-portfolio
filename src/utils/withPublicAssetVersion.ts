import { statSync } from 'node:fs';
import { join } from 'node:path';

export function withPublicAssetVersion(src: string): string {
	if (!src.startsWith('/')) return src;

	try {
		const filePath = join(process.cwd(), 'public', src.slice(1));
		const { mtimeMs } = statSync(filePath);
		return `${src}?v=${Math.floor(mtimeMs)}`;
	} catch {
		return src;
	}
}
