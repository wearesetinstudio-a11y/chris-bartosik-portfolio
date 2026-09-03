/** Start loading/decoding before the element is near the viewport. */
export const PROJECT_VIDEO_WARM_MARGIN = '200% 0px';
/** Start playback while still off-screen (one viewport ahead). */
export const PROJECT_VIDEO_PLAY_MARGIN = '100% 0px';

export function prepareProjectVideo(video: HTMLVideoElement) {
	video.loop = true;
	video.muted = true;
	video.playsInline = true;
	video.setAttribute('muted', '');
	video.setAttribute('playsinline', '');
}

export function warmProjectVideo(video: HTMLVideoElement) {
	if (video.dataset.warmed === 'true') return;
	video.dataset.warmed = 'true';
	video.preload = 'auto';
	try {
		video.load();
	} catch {
		/* ignore */
	}
}

export function playProjectVideo(video: HTMLVideoElement) {
	if (!video.paused) return;
	const play = video.play();
	if (play) play.catch(() => {});
}

export function pauseProjectVideo(video: HTMLVideoElement) {
	if (video.paused) return;
	video.pause();
}

type ObservedVideoOptions = {
	selector: string;
	warmMargin?: string;
	playMargin?: string;
	cleanupKey: string;
	onWarm?: (video: HTMLVideoElement) => void;
};

export function initObservedProjectVideos({
	selector,
	warmMargin = PROJECT_VIDEO_WARM_MARGIN,
	playMargin = PROJECT_VIDEO_PLAY_MARGIN,
	cleanupKey,
	onWarm,
}: ObservedVideoOptions) {
	const videos = Array.from(document.querySelectorAll<HTMLVideoElement>(selector));
	if (!videos.length) return;

	const win = window as Window & { [key: string]: (() => void) | undefined };
	win[cleanupKey]?.();

	videos.forEach((video) => {
		prepareProjectVideo(video);
	});

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const cleanups: Array<() => void> = [];

	if (reduceMotion) {
		videos.forEach(pauseProjectVideo);
		win[cleanupKey] = () => {
			videos.forEach(pauseProjectVideo);
		};
		return;
	}

	if (typeof IntersectionObserver === 'undefined') {
		videos.forEach((video) => {
			warmProjectVideo(video);
			onWarm?.(video);
			playProjectVideo(video);
		});
		win[cleanupKey] = () => {
			videos.forEach(pauseProjectVideo);
		};
		return;
	}

	const warmObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const video = entry.target as HTMLVideoElement;
				warmProjectVideo(video);
				onWarm?.(video);
			});
		},
		{ root: null, rootMargin: warmMargin, threshold: 0 },
	);

	const playObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target as HTMLVideoElement;
				if (entry.isIntersecting) {
					warmProjectVideo(video);
					playProjectVideo(video);
				} else {
					pauseProjectVideo(video);
				}
			});
		},
		{ root: null, rootMargin: playMargin, threshold: 0 },
	);

	for (const video of videos) {
		warmObserver.observe(video);
		playObserver.observe(video);
		if (isNearViewport(video, warmMargin)) {
			warmProjectVideo(video);
			onWarm?.(video);
		}
		if (isNearViewport(video, playMargin)) {
			playProjectVideo(video);
		}
	}

	cleanups.push(() => {
		warmObserver.disconnect();
		playObserver.disconnect();
		videos.forEach(pauseProjectVideo);
	});

	win[cleanupKey] = () => {
		cleanups.forEach((cleanup) => cleanup());
	};
}

function marginToPx(margin: string) {
	const match = margin.match(/^(-?\d+(?:\.\d+)?)%/);
	if (!match) return 0;
	return (parseFloat(match[1]) / 100) * window.innerHeight;
}

function isNearViewport(el: Element, margin: string) {
	const rect = el.getBoundingClientRect();
	const offset = marginToPx(margin);
	return rect.bottom > -offset && rect.top < window.innerHeight + offset;
}
