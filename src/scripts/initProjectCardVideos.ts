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

	initObservedProjectVideos({
		selector: '.project-card__video',
		cleanupKey: '__projectCardVideosCleanup',
		onWarm: (video) => {
			markReady(video);
		},
	});

	const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('.project-card__video'));
	for (const video of videos) {
		if (video.dataset.warmed === 'true') markReady(video);
		else {
			video.addEventListener(
				'loadeddata',
				() => markReady(video),
				{ once: true },
			);
		}
	}
}
