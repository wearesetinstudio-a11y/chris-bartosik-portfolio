export function wrapRevealLetters(element: HTMLElement) {
	if (element.querySelector('.reveal-char')) return;

	const text = (element.textContent ?? '').trim();
	if (!text) return;

	element.textContent = '';

	for (const char of text) {
		const span = document.createElement('span');
		span.className = 'reveal-char';
		span.textContent = char === ' ' ? ' ' : char;
		element.appendChild(span);
	}
}

export function initScrollLetterReveal(
	headingId: string,
	options: { startLine?: number; endLine?: number } = {},
): void {
	initScrollLetterReveals([headingId], options);
}

export function initScrollLetterReveals(
	headingIds: string[],
	options: { startLine?: number; endLine?: number } = {},
): void {
	const startLineRatio = options.startLine ?? 0.88;
	const endLineRatio = options.endLine ?? 0.45;

	let listenersReady = false;
	let scrollTicking = false;

	function updateReveal() {
		const viewportHeight = window.innerHeight;
		const startLine = viewportHeight * startLineRatio;
		const endLine = viewportHeight * endLineRatio;
		const range = startLine - endLine;

		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;

			const chars = heading.querySelectorAll('.reveal-char');
			if (!chars.length) continue;

			const rect = heading.getBoundingClientRect();
			const progress = Math.min(1, Math.max(0, (startLine - rect.top) / range));
			const activeCount = Math.ceil(progress * chars.length);

			chars.forEach((char, index) => {
				char.classList.toggle('active', index < activeCount);
			});
		}
	}

	function onScroll() {
		if (scrollTicking) return;
		scrollTicking = true;
		requestAnimationFrame(() => {
			updateReveal();
			scrollTicking = false;
		});
	}

	function init() {
		for (const headingId of headingIds) {
			const heading = document.getElementById(headingId);
			if (!heading) continue;

			heading.querySelectorAll('[data-reveal-line]').forEach((line) => {
				if (!line.querySelector('.reveal-char')) {
					wrapRevealLetters(line as HTMLElement);
				}
			});
		}

		updateReveal();

		if (!listenersReady) {
			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('resize', updateReveal, { passive: true });
			listenersReady = true;
		}
	}

	init();
}
