import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const IMAGE_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg']);
const VIDEO_EXT = new Set(['.webm', '.mp4']);

function fmt(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function walk(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...(await walk(full)));
		else files.push(full);
	}
	return files;
}

function run(cmd, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
		let stderr = '';
		child.stderr.on('data', (chunk) => {
			stderr += chunk.toString();
		});
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(stderr.trim() || `exit ${code}`));
		});
	});
}

async function replaceIfSmaller(originalPath, tempPath) {
	const before = (await fs.stat(originalPath)).size;
	const after = (await fs.stat(tempPath)).size;
	if (after > 0 && after < before * 0.98) {
		await fs.copyFile(tempPath, originalPath);
		await fs.unlink(tempPath).catch(() => {});
		return { changed: true, before, after, saved: before - after };
	}
	await fs.unlink(tempPath).catch(() => {});
	return { changed: false, before, after, saved: 0 };
}

async function optimizeImage(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	const tempPath = `${filePath}.opt${ext}`;
	const image = sharp(filePath, { animated: true, limitInputPixels: false }).rotate();

	if (ext === '.png') {
		await image.png({ compressionLevel: 9, palette: false }).toFile(tempPath);
	} else if (ext === '.jpg' || ext === '.jpeg') {
		await image.jpeg({ quality: 92, mozjpeg: true }).toFile(tempPath);
	} else if (ext === '.webp') {
		// Prefer near-lossless; if it doesn't shrink, try high-quality lossy and keep the smaller win.
		await image.webp({ nearLossless: true, quality: 90, effort: 6 }).toFile(tempPath);
		const near = await replaceIfSmaller(filePath, tempPath);
		if (near.changed) return near;

		const lossyTemp = `${filePath}.opt2${ext}`;
		await sharp(filePath, { animated: true, limitInputPixels: false })
			.rotate()
			.webp({ quality: 90, effort: 6 })
			.toFile(lossyTemp);
		return replaceIfSmaller(filePath, lossyTemp);
	} else {
		return null;
	}

	return replaceIfSmaller(filePath, tempPath);
}

async function optimizeVideo(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	const tempPath = `${filePath}.opt${ext}`;

	const common = [
		'-y',
		'-i',
		filePath,
		'-map_metadata',
		'-1',
		'-an',
		'-sn',
		'-dn',
		// Cap width for portfolio embeds; keep aspect, even dimensions for yuv420p.
		'-vf',
		"scale='min(1600,iw)':-2",
	];

	try {
		if (ext === '.webm') {
			await run(ffmpegPath, [
				...common,
				'-c:v',
				'libvpx-vp9',
				'-crf',
				'32',
				'-b:v',
				'0',
				'-row-mt',
				'1',
				'-deadline',
				'good',
				'-cpu-used',
				'2',
				'-pix_fmt',
				'yuv420p',
				tempPath,
			]);
		} else {
			await run(ffmpegPath, [
				...common,
				'-c:v',
				'libx264',
				'-preset',
				'slow',
				'-crf',
				'23',
				'-pix_fmt',
				'yuv420p',
				'-movflags',
				'+faststart',
				tempPath,
			]);
		}
	} catch (error) {
		await fs.unlink(tempPath).catch(() => {});
		return {
			changed: false,
			before: (await fs.stat(filePath)).size,
			after: 0,
			saved: 0,
			error: String(error.message || error),
		};
	}

	return replaceIfSmaller(filePath, tempPath);
}

const mode = process.argv.includes('--webm')
	? 'webm'
	: process.argv.includes('--videos')
		? 'videos'
		: process.argv.includes('--images')
			? 'images'
			: 'all';

const files = (await walk(publicDir)).filter((file) => {
	const ext = path.extname(file).toLowerCase();
	if (mode === 'webm') return ext === '.webm';
	if (mode === 'videos') return VIDEO_EXT.has(ext);
	if (mode === 'images') return IMAGE_EXT.has(ext);
	return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext);
});

let imageSaved = 0;
let videoSaved = 0;
let imageChanged = 0;
let videoChanged = 0;
let imageChecked = 0;
let videoChecked = 0;
const notable = [];

console.log(`Optimizing ${files.length} media files in public/ (mode: ${mode}, keep only if ≥2% smaller)...`);

for (const file of files) {
	const ext = path.extname(file).toLowerCase();
	const rel = path.relative(root, file);
	try {
		if (IMAGE_EXT.has(ext)) {
			imageChecked += 1;
			const result = await optimizeImage(file);
			if (!result) continue;
			if (result.changed) {
				imageChanged += 1;
				imageSaved += result.saved;
				notable.push({ rel, kind: 'image', ...result });
				console.log(`✓ ${rel}: ${fmt(result.before)} → ${fmt(result.after)} (−${fmt(result.saved)})`);
			}
		} else {
			videoChecked += 1;
			console.log(`… video ${rel}`);
			const result = await optimizeVideo(file);
			if (result.error) {
				console.log(`! ${rel}: ${result.error.split('\n').slice(-1)[0]}`);
				continue;
			}
			if (result.changed) {
				videoChanged += 1;
				videoSaved += result.saved;
				notable.push({ rel, kind: 'video', ...result });
				console.log(`✓ ${rel}: ${fmt(result.before)} → ${fmt(result.after)} (−${fmt(result.saved)})`);
			} else {
				console.log(`= ${rel}: already efficient (${fmt(result.before)} → ${fmt(result.after)})`);
			}
		}
	} catch (error) {
		console.log(`! ${rel}: ${error.message || error}`);
		await fs.unlink(`${file}.opt${ext}`).catch(() => {});
	}
}

console.log('\nSummary');
console.log(`Images: ${imageChanged}/${imageChecked} updated, saved ${fmt(imageSaved)}`);
console.log(`Videos: ${videoChanged}/${videoChecked} updated, saved ${fmt(videoSaved)}`);
console.log(`Total saved: ${fmt(imageSaved + videoSaved)}`);
