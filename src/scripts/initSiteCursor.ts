export function initSiteCursor() {
	const cursor = document.getElementById('site-cursor');
	if (!cursor) return;

	const finePointer = window.matchMedia('(pointer: fine)').matches;
	if (!finePointer) {
		document.documentElement.classList.remove('has-site-cursor');
		return;
	}

	document.documentElement.classList.add('has-site-cursor');

	if (cursor.dataset.cursorInit === 'true') return;
	cursor.dataset.cursorInit = 'true';

	let glow = cursor.querySelector<HTMLElement>('.site-cursor__glow');
	if (!glow) {
		glow = document.createElement('span');
		glow.className = 'site-cursor__glow';
		cursor.prepend(glow);
	}

	if (!cursor.querySelector('.site-cursor__dot')) {
		const dot = document.createElement('span');
		dot.className = 'site-cursor__dot';
		cursor.append(dot);
	}

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let x = -100;
	let y = -100;
	let lastX = x;
	let lastY = y;
	let vx = 0;
	let vy = 0;
	let glowAngle = 0;
	let motion = 0;
	let hasAngle = false;
	let visible = false;
	let rafId = 0;

	function lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	function lerpAngle(a: number, b: number, t: number) {
		let diff = b - a;
		while (diff > Math.PI) diff -= Math.PI * 2;
		while (diff < -Math.PI) diff += Math.PI * 2;
		return a + diff * t;
	}

	function isOverHero(px: number, py: number) {
		const hero = document.getElementById('hero-section');
		if (!hero) return false;
		const rect = hero.getBoundingClientRect();
		return px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
	}

	function isOverHeader(px: number, py: number) {
		const header = document.getElementById('site-header');
		if (!header) return null;

		const rect = header.getBoundingClientRect();
		if (px < rect.left || px > rect.right || py < rect.top || py > rect.bottom) return null;

		if (header.classList.contains('site-header--light-bg')) return true;
		if (header.classList.contains('header-solid')) return false;

		return null;
	}

	function parseRgb(color: string) {
		const match = color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
		if (!match) return null;
		return {
			r: Number(match[1]),
			g: Number(match[2]),
			b: Number(match[3]),
			a: match[4] === undefined ? 1 : Number(match[4]),
		};
	}

	function isLightSurface(px: number, py: number) {
		let element = document.elementFromPoint(px, py) as HTMLElement | null;

		while (element && element !== document.documentElement) {
			const rgb = parseRgb(getComputedStyle(element).backgroundColor);
			if (rgb && rgb.a >= 0.85) {
				const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
				return luminance > 0.45;
			}

			element = element.parentElement;
		}

		return false;
	}

	function useOrangeCursor(px: number, py: number) {
		const headerSurface = isOverHeader(px, py);
		return headerSurface ?? (isOverHero(px, py) || isLightSurface(px, py));
	}

	function render() {
		const dx = x - lastX;
		const dy = y - lastY;
		lastX = x;
		lastY = y;
		vx += (dx - vx) * 0.12;
		vy += (dy - vy) * 0.12;

		const speed = Math.hypot(vx, vy);
		const targetMotion = reduceMotion ? 0 : Math.min(1, Math.max(0, (speed - 0.18) / 1.9));
		motion = lerp(motion, targetMotion, 0.08);

		if (motion > 0.08) {
			const targetAngle = Math.atan2(vy, vx);
			glowAngle = hasAngle ? lerpAngle(glowAngle, targetAngle, 0.1) : targetAngle;
			hasAngle = true;
		}

		const width = lerp(72, 98, motion);
		const height = lerp(72, 16, motion);
		const originX = lerp(50, 100, motion);
		const tx = lerp(-50, -100, motion);
		const gx = lerp(50, 90, motion);
		const length = lerp(1, 0.72 + Math.min(1.7, speed * 0.08), motion);

		const projectActive = Boolean(document.querySelector('.project-cursor.is-active'));
		cursor.classList.toggle('is-visible', visible && !projectActive);
		cursor.classList.toggle('is-orange', useOrangeCursor(x, y));
		cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
		glow.style.width = `${width.toFixed(1)}px`;
		glow.style.height = `${height.toFixed(1)}px`;
		glow.style.transformOrigin = `${originX.toFixed(1)}% 50%`;
		glow.style.setProperty('--gx', `${gx.toFixed(1)}%`);
		glow.style.transform = `translate(${tx.toFixed(1)}%, -50%) rotate(${glowAngle}rad) scale(${length.toFixed(3)}, 1)`;
	}

	function tick() {
		render();
		if (visible && (Math.hypot(vx, vy) > 0.03 || motion > 0.01)) {
			rafId = window.requestAnimationFrame(tick);
			return;
		}
		rafId = 0;
	}

	function schedule() {
		if (!rafId) rafId = window.requestAnimationFrame(tick);
	}

	window.addEventListener(
		'pointermove',
		(event) => {
			if (event.pointerType === 'touch') return;
			x = event.clientX;
			y = event.clientY;
			visible = true;
			schedule();
		},
		{ passive: true },
	);

	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });

	document.documentElement.addEventListener('mouseleave', () => {
		visible = false;
		schedule();
	});

	document.documentElement.addEventListener('mouseenter', () => {
		visible = true;
		schedule();
	});
}
