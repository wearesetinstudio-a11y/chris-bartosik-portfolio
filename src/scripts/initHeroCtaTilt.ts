const MAX_TILT = 11;
const MAX_TWIST = 3;

let cleanupHeroCtaTilt: (() => void) | null = null;

export function initHeroCtaTilt() {
	const buttons = [...document.querySelectorAll<HTMLElement>('.hero-cta')];
	if (!buttons.length) return;

	cleanupHeroCtaTilt?.();
	cleanupHeroCtaTilt = null;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (!window.matchMedia('(pointer: fine)').matches) return;

	const cleanups: Array<() => void> = [];

	buttons.forEach((button) => {
		function onMove(event: MouseEvent) {
			const rect = button.getBoundingClientRect();
			const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
			const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
			const rx = (0.5 - py) * 2 * MAX_TILT;
			const ry = (px - 0.5) * 2 * MAX_TILT;
			const rz = (px - 0.5) * -MAX_TWIST;

			button.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
			button.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
			button.style.setProperty('--rz', `${rz.toFixed(2)}deg`);
			button.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
			button.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
			button.classList.add('is-tilting');
		}

		function onLeave() {
			button.style.setProperty('--rx', '0deg');
			button.style.setProperty('--ry', '0deg');
			button.style.setProperty('--rz', '0deg');
			button.classList.remove('is-tilting');
		}

		button.addEventListener('mousemove', onMove);
		button.addEventListener('mouseleave', onLeave);
		cleanups.push(() => {
			button.removeEventListener('mousemove', onMove);
			button.removeEventListener('mouseleave', onLeave);
			onLeave();
		});
	});

	cleanupHeroCtaTilt = () => {
		cleanups.forEach((fn) => fn());
	};
}
