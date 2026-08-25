import { prefersReducedMotion, wait, waitForAnimation } from './sygnetFlipAnimation.ts';

export const HAND_WAVE_MS = 1600;

function getHand(root: ParentNode): HTMLElement | null {
	return root.querySelector<HTMLElement>('.logo-mark__hand');
}

export function resetHandWave(overlay: HTMLElement) {
	const hand = getHand(overlay);
	if (!hand) return;

	hand.classList.remove('is-waving');
	hand.style.animation = 'none';
}

export async function playHandWave(overlay: HTMLElement): Promise<void> {
	const hand = getHand(overlay);
	if (!hand) return;

	if (prefersReducedMotion()) {
		await wait(200);
		return;
	}

	resetHandWave(overlay);
	void hand.offsetWidth;
	hand.style.animation = '';
	hand.classList.add('is-waving');

	await waitForAnimation(hand, 'preloader-wave', HAND_WAVE_MS);
	resetHandWave(overlay);
	await wait(220);
}

export function waveLogoHand(hand: HTMLElement) {
	if (prefersReducedMotion()) return;
	if (hand.classList.contains('is-waving')) return;

	hand.style.animation = '';
	hand.classList.add('is-waving');

	const onEnd = (event: AnimationEvent) => {
		if (event.animationName !== 'preloader-wave') return;
		hand.classList.remove('is-waving');
		hand.removeEventListener('animationend', onEnd);
	};

	hand.addEventListener('animationend', onEnd);
}

export function initLogoWave() {
	document.querySelectorAll<HTMLElement>('[data-logo-hand="nav"]').forEach((hand) => {
		if (hand.dataset.waveBound === 'true') return;
		hand.dataset.waveBound = 'true';

		const mark = hand.closest('a, .logo-mark');
		mark?.addEventListener('mouseenter', () => waveLogoHand(hand));
	});

	const scrollWindow = window as Window & { __logoWaveScrollReady?: boolean };
	if (scrollWindow.__logoWaveScrollReady) return;
	scrollWindow.__logoWaveScrollReady = true;

	let lastWaveAt = 0;
	const WAVE_COOLDOWN_MS = 1800;

	window.addEventListener(
		'scroll',
		() => {
			const now = performance.now();
			if (now - lastWaveAt < WAVE_COOLDOWN_MS) return;
			lastWaveAt = now;
			document.querySelectorAll<HTMLElement>('[data-logo-hand="nav"]').forEach((hand) => {
				waveLogoHand(hand);
			});
		},
		{ passive: true },
	);
}
