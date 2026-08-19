export const SYGNET_FLIP_MS = 1400;
export const PANEL_SLIDE_MS = 900;

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function waitForAnimation(
	element: HTMLElement,
	animationName: string,
	fallbackMs: number,
): Promise<void> {
	return new Promise((resolve) => {
		let finished = false;

		const finish = () => {
			if (finished) return;
			finished = true;
			element.removeEventListener('animationend', onAnimationEnd);
			resolve();
		};

		const onAnimationEnd = (event: AnimationEvent) => {
			if (event.target !== element || event.animationName !== animationName) return;
			finish();
		};

		element.addEventListener('animationend', onAnimationEnd);
		window.setTimeout(finish, fallbackMs + 80);
	});
}

export function resetSygnetFlip(sygnet: HTMLElement) {
	sygnet.classList.remove('is-flipping');
	sygnet.style.animation = 'none';
	sygnet.style.transform = 'rotateY(0deg)';
}

export async function playSygnetFlip(sygnet: HTMLElement): Promise<void> {
	if (prefersReducedMotion()) return;

	resetSygnetFlip(sygnet);
	void sygnet.offsetWidth;
	sygnet.style.animation = '';
	sygnet.style.transform = '';
	sygnet.classList.add('is-flipping');

	await waitForAnimation(sygnet, 'sygnet-flip-x', SYGNET_FLIP_MS);

	sygnet.classList.remove('is-flipping');
	resetSygnetFlip(sygnet);
}

export function findSygnetFlip(root: ParentNode = document): HTMLElement | null {
	return root.querySelector<HTMLElement>('.sygnet-flip-x');
}
