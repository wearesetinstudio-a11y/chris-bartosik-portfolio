type LoadScrollState = {
	stayTop: boolean;
	restoreY: number;
	cancelled?: boolean;
	bound?: boolean;
};

type LoadScrollWindow = Window &
	typeof globalThis & {
		__cbLoadScroll?: LoadScrollState;
	};

const TOP_PX = 24;

function loadWindow() {
	return window as LoadScrollWindow;
}

function currentY() {
	return window.scrollY || document.documentElement.scrollTop || 0;
}

function jumpTo(y: number) {
	const html = document.documentElement;
	const previousBehavior = html.style.scrollBehavior;
	html.style.scrollBehavior = 'auto';
	window.scrollTo(0, y);
	html.scrollTop = y;
	document.body.scrollTop = y;
	html.style.scrollBehavior = previousBehavior;
}

function getState(): LoadScrollState {
	const existing = loadWindow().__cbLoadScroll;
	if (existing) return existing;

	const state: LoadScrollState = {
		stayTop: !window.location.hash && currentY() <= TOP_PX,
		restoreY: 0,
	};
	loadWindow().__cbLoadScroll = state;
	return state;
}

function cancelGuard(state: LoadScrollState) {
	state.cancelled = true;
	state.stayTop = false;
}

function pinTop(state: LoadScrollState) {
	if (state.cancelled || !state.stayTop || window.location.hash) return;
	if (currentY() > 0) jumpTo(0);
}

function guardTopUntilSettled(state: LoadScrollState) {
	const introPending = document.documentElement.classList.contains('intro-pending');
	let until = Date.now() + (introPending ? 4000 : 1400);

	const extendAfterIntro = () => {
		until = Date.now() + 450;
		pinTop(state);
	};

	const onUserIntent = () => cancelGuard(state);

	window.addEventListener('wheel', onUserIntent, { passive: true, once: true });
	window.addEventListener('touchmove', onUserIntent, { passive: true, once: true });
	window.addEventListener(
		'keydown',
		(event) => {
			if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
				onUserIntent();
			}
		},
		{ once: true },
	);

	window.addEventListener('intro-revealing', extendAfterIntro, { once: true });
	window.addEventListener('intro-complete', extendAfterIntro, { once: true });
	window.addEventListener('load', () => pinTop(state), { once: true });
	window.addEventListener('pageshow', () => pinTop(state), { once: true });
	document.addEventListener('astro:page-load', () => pinTop(state), { once: true });

	void document.fonts?.ready.then(() => pinTop(state)).catch(() => undefined);

	const tick = () => {
		if (state.cancelled || Date.now() > until) return;
		pinTop(state);
		requestAnimationFrame(tick);
	};

	requestAnimationFrame(tick);
}

export function initLoadScroll() {
	const state = getState();
	if (state.bound) return;
	state.bound = true;

	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}

	if (window.location.hash) return;

	if (state.stayTop) {
		pinTop(state);
		guardTopUntilSettled(state);
		return;
	}

	if (state.restoreY > TOP_PX) {
		jumpTo(state.restoreY);
		void document.fonts?.ready.then(() => {
			if (!state.cancelled && currentY() < 8) jumpTo(state.restoreY);
		}).catch(() => undefined);
	}
}
