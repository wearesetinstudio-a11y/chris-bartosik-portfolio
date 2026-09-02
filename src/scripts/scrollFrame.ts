const listeners = new Set<() => void>();
let rafId = 0;
let bound = false;

function flush() {
	rafId = 0;
	for (const listener of listeners) {
		listener();
	}
}

function schedule() {
	if (rafId) return;
	rafId = window.requestAnimationFrame(flush);
}

function ensureBound() {
	if (bound || typeof window === 'undefined') return;
	bound = true;
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
}

export function onScrollFrame(listener: () => void): () => void {
	ensureBound();
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function requestScrollFrame(listener: () => void) {
	ensureBound();
	listeners.add(listener);
	schedule();
	return () => listeners.delete(listener);
}
