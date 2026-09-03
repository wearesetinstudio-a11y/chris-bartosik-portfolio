import { initObservedProjectVideos } from './projectVideoPlayback.ts';

const PROJECT_VIDEO_SELECTOR =
	'.project-gallery__item--video video, .project-overview__video';

export function initProjectGalleryVideos() {
	initObservedProjectVideos({
		selector: PROJECT_VIDEO_SELECTOR,
		cleanupKey: '__projectGalleryVideosCleanup',
	});
}
