function playVideo(video: HTMLVideoElement) {
	if (!video.paused) return;
	const play = video.play();
	if (play) play.catch(() => {});
}

function pauseVideo(video: HTMLVideoElement) {
	if (video.paused) return;
	video.pause();
}

function mediaShell(el: Element) {
	return el.closest<HTMLElement>('.project-card__media');
}

function markReady(el: Element) {
	mediaShell(el)?.classList.add('is-ready');
}

function warmVideo(video: HTMLVideoElement) {
	if (video.dataset.warmed === 'true') return;
	video.dataset.warmed = 'true';
	video.preload = 'auto';
	try {
		video.load();
	} catch {
		/* ignore */
	}
}

function whenVideoFrameReady(video: HTMLVideoElement, onReady: () => void) {
	if (video.readyState >= 2) {
		onReady();
		return;
	}

	const done = () => {
		video.removeEventListener('loadeddata', done);
		video.removeEventListener('canplay', done);
		onReady();
	};

	video.addEventListener('loadeddata', done, { once: true });
	video.addEventListener('canplay', done, { once: true });
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
	if (!videos.length) return;

	const previous = (window as Window & { __projectCardVideosCleanup?: () => void })
		.__projectCardVideosCleanup;
	previous?.();

	videos.forEach((video) => {
		video.loop = true;
		video.muted = true;
		video.playsInline = true;
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
		video.setAttribute('autoplay', '');
		video.preload = 'auto';
		warmVideo(video);
		markReady(video);
	});

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const cleanups: Array<() => void> = [];

	if (typeof IntersectionObserver === 'undefined') {
		videos.forEach((video) => {
			if (!reduceMotion) playVideo(video);
		});
		(window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup =
			() => {
				videos.forEach(pauseVideo);
			};
		return;
	}

	const playObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target as HTMLVideoElement;
				if (!entry.isIntersecting) {
					pauseVideo(video);
					return;
				}

				if (!reduceMotion) playVideo(video);
			});
		},
		{ root: null, rootMargin: '50% 0px', threshold: 0.01 },
	);

	videos.forEach((video) => {
		playObserver.observe(video);
		if (!reduceMotion) playVideo(video);
	});

	cleanups.push(() => {
		playObserver.disconnect();
		videos.forEach(pauseVideo);
	});

	(window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup =
		() => {
			cleanups.forEach((cleanup) => cleanup());
		};
}
