import { initObservedProjectVideos } from './projectVideoPlayback.ts';

function mediaShell(el: Element) {
	return el.closest<HTMLElement>('.project-card__media');
}

function markReady(el: Element) {
	mediaShell(el)?.classList.add('is-ready');
}

function initProjectCardImages() {
	const images = Array.from(
		document.querySelectorAll<HTMLImageElement>('.project-card__media > img'),
	);

	for (const image of images) {
		const reveal = () => markReady(image);
		if (image.complete && image.naturalWidth > 0) {
			reveal();
			continue;
		}
		image.addEventListener('load', reveal, { once: true });
		image.addEventListener('error', reveal, { once: true });
	}
}

export function initProjectCardVideos() {
	initProjectCardImages();

	const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('.project-card__video'));

	// Grid covers: download + play immediately so cards are ready before scroll.
	for (const video of videos) {
		video.preload = 'auto';
		video.muted = true;
		video.playsInline = true;
		video.autoplay = true;
		video.dataset.warmed = 'true';
		try {
			video.load();
		} catch {
			/* ignore */
		}
		const reveal = () => markReady(video);
		if (video.readyState >= 2) reveal();
		else {
			video.addEventListener('loadeddata', reveal, { once: true });
			video.addEventListener('error', reveal, { once: true });
		}
		const play = video.play();
		if (play) play.catch(() => {});
	}

	initObservedProjectVideos({
		selector: '.project-card__video',
		cleanupKey: '__projectCardVideosCleanup',
		eagerWarm: true,
		onWarm: (video) => {
			markReady(video);
		},
	});
}
