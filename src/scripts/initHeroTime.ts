export const PANAMA_TZ = 'America/Panama';

export function formatPanamaTime(date = new Date()): string {
	return new Intl.DateTimeFormat('en-US', {
		timeZone: PANAMA_TZ,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	}).format(date);
}

export function formatPanamaTimeLabel(date = new Date()): string {
	return `[${formatPanamaTime(date)}]`;
}

export function initHeroTime() {
	const nodes = document.querySelectorAll<HTMLElement>('[data-hero-time]');
	if (!nodes.length) return;

	const tick = () => {
		const label = formatPanamaTimeLabel();
		nodes.forEach((node) => {
			node.textContent = label;
		});
	};

	tick();

	const lead = nodes[0];
	window.clearInterval(Number(lead.dataset.timeInterval));
	const intervalId = window.setInterval(tick, 1000);
	lead.dataset.timeInterval = String(intervalId);
}
