export function initCinemaPureNoise(
	canvasId: string,
	options: { observeElementId?: string } = {},
): void {
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	const container = canvas.parentElement;
	if (!ctx || !container) return;

	const NOISE_DENSITY = 0.052;
	const GRAIN_SIZE = 0.75;
	const BASE_OPACITY = 0.17;
	const MAX_NOISE_WIDTH = 1100;
	const MAX_NOISE_HEIGHT = 700;

	let dpr = window.devicePixelRatio || 1;
	let noiseBuffers: HTMLCanvasElement[] = [];
	const TOTAL_BUFFERS = 6;
	let currentBufferFrame = 0;
	let noiseWidth = 0;
	let noiseHeight = 0;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function getNoiseDimensions(w: number, h: number) {
		const scale = Math.min(1, MAX_NOISE_WIDTH / w, MAX_NOISE_HEIGHT / h);
		return {
			w: Math.max(1, Math.floor(w * scale)),
			h: Math.max(1, Math.floor(h * scale)),
		};
	}

	function preRenderNoise(w: number, h: number) {
		noiseBuffers = [];
		const grainCount = Math.floor(w * h * NOISE_DENSITY);

		for (let b = 0; b < TOTAL_BUFFERS; b++) {
			const bufferCanvas = document.createElement('canvas');
			bufferCanvas.width = w;
			bufferCanvas.height = h;
			const bCtx = bufferCanvas.getContext('2d');
			if (!bCtx) continue;

			bCtx.fillStyle = `rgba(255, 255, 255, ${BASE_OPACITY})`;

			for (let i = 0; i < grainCount; i++) {
				bCtx.fillRect(Math.random() * w, Math.random() * h, GRAIN_SIZE, GRAIN_SIZE);
			}

			bCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
			const scratchCount = Math.floor(Math.random() * 2) + 1;
			for (let s = 0; s < scratchCount; s++) {
				bCtx.fillRect(
					Math.random() * w,
					Math.random() * (h * 0.2),
					0.75,
					Math.random() * (h * 0.5) + h * 0.1,
				);
			}

			noiseBuffers.push(bufferCanvas);
		}
	}

	function resizeCanvas() {
		const rect = container.getBoundingClientRect();
		dpr = window.devicePixelRatio || 1;

		canvas.width = Math.max(1, Math.floor(rect.width * dpr));
		canvas.height = Math.max(1, Math.floor(rect.height * dpr));
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		const noiseSize = getNoiseDimensions(rect.width, rect.height);
		noiseWidth = noiseSize.w;
		noiseHeight = noiseSize.h;

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		preRenderNoise(noiseWidth, noiseHeight);
	}

	function drawFrame() {
		const width = canvas.width / dpr;
		const height = canvas.height / dpr;
		const frame = noiseBuffers[currentBufferFrame];

		ctx.clearRect(0, 0, width, height);
		if (frame) {
			ctx.drawImage(frame, 0, 0, width, height);
		}

		currentBufferFrame = (currentBufferFrame + 1) % TOTAL_BUFFERS;
	}

	function startNoise() {
		if (intervalId) return;
		drawFrame();
		intervalId = window.setInterval(drawFrame, 100);
	}

	function stopNoise() {
		if (!intervalId) return;
		window.clearInterval(intervalId);
		intervalId = null;
	}

	resizeCanvas();
	window.addEventListener('resize', resizeCanvas, { passive: true });

	const observeElementId = options.observeElementId;
	if (observeElementId) {
		const observedElement = document.getElementById(observeElementId);
		if (observedElement) {
			const visibilityObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) startNoise();
						else stopNoise();
					}
				},
				{ threshold: 0 },
			);
			visibilityObserver.observe(observedElement);
		} else {
			startNoise();
		}
	} else {
		startNoise();
	}

	window.addEventListener(
		'pagehide',
		() => {
			stopNoise();
			window.removeEventListener('resize', resizeCanvas);
		},
		{ once: true },
	);
}
