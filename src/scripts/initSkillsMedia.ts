function mediaOf(layer: HTMLElement) {
	return layer.querySelector<HTMLVideoElement>('video');
}

export function initSkillsMedia() {
	const page = document.querySelector<HTMLElement>('[data-skills-page]');
	if (!page) return;

	const previous = (page as HTMLElement & { _skillsMediaCleanup?: () => void })._skillsMediaCleanup;
	previous?.();

	const layers = Array.from(page.querySelectorAll<HTMLElement>('[data-skills-layer]'));
	const blocks = Array.from(page.querySelectorAll<HTMLElement>('[data-skills-block]'));
	const media = page.querySelector<HTMLElement>('[data-skills-media]');
	if (!layers.length || !blocks.length || !media) return;

	const desktopQuery = window.matchMedia('(min-width: 1024px)');
	let innerCleanup = () => {};

	function setupDesktop() {
		let activeId = '';
		let ticking = false;

		function setActive(id: string) {
			if (!id || id === activeId) return;
			activeId = id;

			layers.forEach((layer) => {
				const isActive = layer.dataset.skillsLayer === id;
				layer.classList.toggle('is-active', isActive);
				const video = mediaOf(layer);
				if (!video) return;
				if (isActive) {
					video.currentTime = video.currentTime > 0 ? video.currentTime : 0;
					video.play().catch(() => {});
				} else {
					video.pause();
				}
			});
		}

		function updateActive() {
			const mediaRect = media.getBoundingClientRect();
			const line = mediaRect.top + Math.min(80, mediaRect.height * 0.12);

			let next = blocks[0];
			for (const block of blocks) {
				if (block.getBoundingClientRect().top <= line) next = block;
			}

			setActive(next.dataset.skillsBlock ?? next.id);
		}

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				ticking = false;
				updateActive();
			});
		}

		const hash = window.location.hash.replace('#', '');
		const hashed = hash ? blocks.find((block) => block.id === hash) : null;
		if (hashed) {
			setActive(hashed.dataset.skillsBlock ?? hashed.id);
		} else {
			setActive(blocks[0].dataset.skillsBlock ?? blocks[0].id);
		}

		updateActive();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		window.addEventListener('hashchange', updateActive);

		innerCleanup = () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			window.removeEventListener('hashchange', updateActive);
			layers.forEach((layer) => mediaOf(layer)?.pause());
		};
	}

	function apply() {
		innerCleanup();
		innerCleanup = () => {};
		if (desktopQuery.matches) setupDesktop();
	}

	apply();
	desktopQuery.addEventListener('change', apply);

	(page as HTMLElement & { _skillsMediaCleanup?: () => void })._skillsMediaCleanup = () => {
		desktopQuery.removeEventListener('change', apply);
		innerCleanup();
	};
}
