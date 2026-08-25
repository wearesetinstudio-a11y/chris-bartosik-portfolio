function playVideo(video: HTMLVideoElement) {
	if (!video.paused) return;
	const play = video.play();
	if (play) play.catch(() => {});
}

function pauseVideo(video: HTMLVideoElement) {
	if (video.paused) return;
	video.pause();
}

export function initProjectCardVideos() {
	const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('.project-card__video'));
	if (!videos.length) return;

	const previous = (window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup;
	previous?.();

	videos.forEach((video) => {
		video.loop = true;
		video.muted = true;
		video.playsInline = true;
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
	});

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		videos.forEach(pauseVideo);
		return;
	}

	const cleanups: Array<() => void> = [];

	if (typeof IntersectionObserver === 'undefined') {
		videos.forEach(playVideo);
		(window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup = () => {
			videos.forEach(pauseVideo);
		};
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target as HTMLVideoElement;
				if (entry.isIntersecting) playVideo(video);
				else pauseVideo(video);
			});
		},
		{ root: null, rootMargin: '10% 0px', threshold: 0.05 },
	);

	videos.forEach((video) => {
		observer.observe(video);
		const rect = video.getBoundingClientRect();
		const inView = rect.bottom > 0 && rect.top < window.innerHeight;
		if (inView) playVideo(video);
	});

	cleanups.push(() => {
		observer.disconnect();
		videos.forEach(pauseVideo);
	});

	(window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup = () => {
		cleanups.forEach((cleanup) => cleanup());
	};
}
