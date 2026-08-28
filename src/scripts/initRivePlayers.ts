import { Alignment, Fit, Layout, Rive } from '@rive-app/canvas';

type RiveHost = HTMLElement & {
	__riveInstance?: Rive;
	__riveBound?: boolean;
	__riveLoaded?: boolean;
	__riveWantPlay?: boolean;
};

function fitFromDataset(value: string | undefined): Fit {
	return value === 'cover' ? Fit.Cover : Fit.Contain;
}

function isCoarsePointer() {
	return (
		window.matchMedia('(pointer: coarse)').matches ||
		window.matchMedia('(max-width: 767px)').matches
	);
}

function syncCanvasSize(canvas: HTMLCanvasElement, host: HTMLElement) {
	const width = Math.max(1, Math.floor(host.clientWidth || canvas.clientWidth || 1));
	const height = Math.max(1, Math.floor(host.clientHeight || canvas.clientHeight || width * 0.66));
	const dpr = Math.min(window.devicePixelRatio || 1, isCoarsePointer() ? 1 : 1.5);

	canvas.width = Math.floor(width * dpr);
	canvas.height = Math.floor(height * dpr);
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
}

function markCardReady(host: HTMLElement) {
	host.closest('.project-card__media')?.classList.add('is-ready');
}

function isRoughlyInView(el: Element, marginRatio = 0.15) {
	const rect = el.getBoundingClientRect();
	const margin = window.innerHeight * marginRatio;
	return rect.bottom > -margin && rect.top < window.innerHeight + margin;
}

/** Prefer state machines; also start linear timelines when present (Epic logo loop). */
function startRive(instance: Rive) {
	try {
		const stateMachines = instance.stateMachineNames ?? [];
		const animations = instance.animationNames ?? [];

		if (stateMachines.length > 0) {
			instance.play(stateMachines[0]);
		} else if (animations.length > 0) {
			instance.play(animations[0]);
		} else {
			instance.play();
		}
	} catch {
		try {
			instance.play();
		} catch {
			/* ignore */
		}
	}
}

function syncPlayback(host: RiveHost) {
	const instance = host.__riveInstance;
	if (!instance || !host.__riveLoaded) return;
	if (host.__riveWantPlay) startRive(instance);
	else {
		try {
			instance.pause();
		} catch {
			/* ignore */
		}
	}
}

function mountRive(host: RiveHost) {
	if (host.__riveBound) return;
	const src = host.dataset.riveSrc;
	const canvas = host.querySelector('canvas');
	if (!src || !(canvas instanceof HTMLCanvasElement)) return;

	host.__riveBound = true;
	host.__riveLoaded = false;
	syncCanvasSize(canvas, host);

	const fit = fitFromDataset(host.dataset.riveFit);
	const instance = new Rive({
		src,
		canvas,
		autoplay: true,
		isTouchScrollEnabled: true,
		shouldDisableRiveListeners: true,
		stateMachines: undefined,
		layout: new Layout({
			fit,
			alignment: Alignment.Center,
		}),
		onLoad: () => {
			const inFixedCard = Boolean(host.closest('.project-card__media'));
			// Cards keep the grid cover ratio; overview/gallery follow the artboard.
			if (!inFixedCard) {
				const bounds = instance.bounds;
				const width = Math.max(1, (bounds ? bounds.maxX - bounds.minX : 0) || instance.artboardWidth || 1);
				const height = Math.max(1, (bounds ? bounds.maxY - bounds.minY : 0) || instance.artboardHeight || 1);
				host.style.aspectRatio = `${width} / ${height}`;
			}
			syncCanvasSize(canvas, host);
			try {
				instance.resizeDrawingSurfaceToCanvas();
			} catch {
				/* ignore */
			}
			host.__riveLoaded = true;
			markCardReady(host);
			startRive(instance);
		},
		onLoadError: (err) => {
			console.error('Rive load error for', src, err);
			host.__riveBound = false;
			host.__riveLoaded = false;
			host.dataset.riveError = 'true';
			markCardReady(host);
		},
	});

	host.__riveInstance = instance;
}

function playHost(host: RiveHost) {
	host.__riveWantPlay = true;
	if (!host.__riveBound) mountRive(host);
	else syncPlayback(host);
}

function pauseHost(host: RiveHost) {
	host.__riveWantPlay = false;
	syncPlayback(host);
}

function warmHost(host: RiveHost) {
	if (!host.__riveBound) mountRive(host);
}

export function initRivePlayers() {
	const hosts = Array.from(document.querySelectorAll<RiveHost>('[data-rive-src]'));
	if (!hosts.length) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	for (const host of hosts) {
		mountRive(host);
		if (!reduceMotion) {
			playHost(host);
		}
	}

	const onResize = () => {
		for (const host of hosts) {
			const canvas = host.querySelector('canvas');
			const instance = host.__riveInstance;
			if (!(canvas instanceof HTMLCanvasElement) || !instance || !host.__riveLoaded) continue;
			syncCanvasSize(canvas, host);
			try {
				instance.resizeDrawingSurfaceToCanvas();
			} catch {
				/* ignore */
			}
			if (host.__riveWantPlay) startRive(instance);
		}
	};

	window.addEventListener('resize', onResize, { passive: true });
	document.addEventListener(
		'astro:before-swap',
		() => {
			window.removeEventListener('resize', onResize);
			for (const host of hosts) {
				try {
					host.__riveInstance?.cleanup();
				} catch {
					/* ignore */
				}
				host.__riveInstance = undefined;
				host.__riveBound = false;
				host.__riveLoaded = false;
				host.__riveWantPlay = false;
			}
		},
		{ once: true },
	);
}
