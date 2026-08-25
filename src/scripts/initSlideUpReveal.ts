let slideUpObserver: IntersectionObserver | null = null;
let slideUpTimers: number[] = [];

export function initSlideUpReveal(root: ParentNode = document) {
	const targets = root.querySelectorAll<HTMLElement>('[data-slide-up]');
	if (!targets.length) return;

	slideUpObserver?.disconnect();
	slideUpTimers.forEach((id) => window.clearTimeout(id));
	slideUpTimers = [];

	const revealClass = 'is-revealed';

	function revealElement(element: HTMLElement) {
		if (element.classList.contains(revealClass)) return;

		const delay = Number(element.dataset.slideUpDelay ?? 0);
		slideUpTimers.push(
			window.setTimeout(() => {
				element.classList.add(revealClass);
			}, delay),
		);
	}

	function isInViewport(element: HTMLElement) {
		const rect = element.getBoundingClientRect();
		return rect.top < window.innerHeight * 0.98 && rect.bottom > 0;
	}

	slideUpObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				revealElement(entry.target as HTMLElement);
				slideUpObserver?.unobserve(entry.target);
			}
		},
		{
			threshold: 0.05,
			rootMargin: '0px 0px 0px 0px',
		},
	);

	targets.forEach((target) => {
		if (isInViewport(target)) {
			revealElement(target);
			return;
		}

		slideUpObserver?.observe(target);
	});
}

export function bootSlideUpReveal() {
	initSlideUpReveal(document);
}
