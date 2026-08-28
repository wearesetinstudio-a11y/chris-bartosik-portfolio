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
		video.preload = 'none';
	});

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const cleanups: Array<() => void> = [];

	if (typeof IntersectionObserver === 'undefined') {
		videos.forEach((video) => {
			warmVideo(video);
			whenVideoFrameReady(video, () => {
				markReady(video);
				if (!reduceMotion) playVideo(video);
			});
		});
		(window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup =
			() => {
				videos.forEach(pauseVideo);
			};
		return;
	}

	// Warm + decode first frame before the card enters the viewport.
	const preloadObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const video = entry.target as HTMLVideoElement;
				warmVideo(video);
				whenVideoFrameReady(video, () => markReady(video));
				preloadObserver.unobserve(video);
			});
		},
		{ root: null, rootMargin: '80% 0px', threshold: 0.01 },
	);

	const playObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target as HTMLVideoElement;
				if (!entry.isIntersecting) {
					pauseVideo(video);
					return;
				}

				warmVideo(video);
				whenVideoFrameReady(video, () => {
					markReady(video);
					if (!reduceMotion) playVideo(video);
				});
			});
		},
		{ root: null, rootMargin: '12% 0px', threshold: 0.05 },
	);

	videos.forEach((video) => {
		preloadObserver.observe(video);
		playObserver.observe(video);

		const rect = video.getBoundingClientRect();
		const near =
			rect.bottom > -window.innerHeight * 0.8 && rect.top < window.innerHeight * 1.8;
		const inView = rect.bottom > 0 && rect.top < window.innerHeight;
		if (near) {
			warmVideo(video);
			whenVideoFrameReady(video, () => {
				markReady(video);
				if (inView && !reduceMotion) playVideo(video);
			});
		}
	});

	cleanups.push(() => {
		preloadObserver.disconnect();
		playObserver.disconnect();
		videos.forEach(pauseVideo);
	});

	(window as Window & { __projectCardVideosCleanup?: () => void }).__projectCardVideosCleanup =
		() => {
			cleanups.forEach((cleanup) => cleanup());
		};
}
