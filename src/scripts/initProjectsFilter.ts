const FILTER_ATTR = 'data-project-filter';

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function cardMatchesFilter(card: HTMLElement, filter: string) {
	if (filter === 'all') return true;

	const categories = (card.dataset.categories ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);

	if (categories.includes(filter)) return true;

	const projectId = (card.dataset.projectId ?? '').trim().toLowerCase();
	if (projectId === filter) return true;

	const client = slugify(card.dataset.client ?? '');
	if (client && (client === filter || client.includes(filter))) return true;

	return false;
}

function readFilterFromUrl(buttons: HTMLButtonElement[]) {
	try {
		const params = new URLSearchParams(window.location.search);
		const fromUrl = (params.get('filter') ?? params.get('client') ?? '').trim().toLowerCase();
		if (!fromUrl) return 'all';
		if (fromUrl === 'all') return 'all';
		if (buttons.some((button) => button.getAttribute(FILTER_ATTR) === fromUrl)) return fromUrl;
		return fromUrl;
	} catch {
		return 'all';
	}
}

function syncFilterToUrl(filter: string) {
	try {
		const url = new URL(window.location.href);
		if (!url.pathname.includes('/projects')) return;

		if (filter === 'all') {
			url.searchParams.delete('filter');
			url.searchParams.delete('client');
		} else {
			url.searchParams.set('filter', filter);
			url.searchParams.delete('client');
		}

		window.history.replaceState({}, '', url);
	} catch {
		/* ignore */
	}
}

function initFilterSection(section: HTMLElement) {
	if (section.dataset.projectsFilterInit === 'true') return;

	const filters = section.querySelector<HTMLElement>('[data-projects-filters]');
	const grid = section.querySelector<HTMLElement>('[data-projects-grid]');
	if (!filters || !grid) return;

	section.dataset.projectsFilterInit = 'true';

	const buttons = [...filters.querySelectorAll<HTMLButtonElement>(`button[${FILTER_ATTR}]`)];
	const cards = [...grid.querySelectorAll<HTMLElement>('.project-card')];
	let userScrolledFilters = false;
	let ignoreScrollUntil = 0;

	function scrollActiveIntoView(behavior: ScrollBehavior = 'smooth') {
		if (userScrolledFilters) return;

		const active = filters.querySelector<HTMLButtonElement>(`button[${FILTER_ATTR}].is-active`);
		if (!active) return;

		ignoreScrollUntil = performance.now() + 450;
		active.scrollIntoView({
			behavior,
			block: 'nearest',
			inline: 'center',
		});
	}

	function setActive(filter: string, syncUrl = true, revealActive = true) {
		buttons.forEach((button) => {
			const isActive = button.getAttribute(FILTER_ATTR) === filter;
			button.classList.toggle('is-active', isActive);
			button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});

		cards.forEach((card) => {
			const match = cardMatchesFilter(card, filter);
			card.hidden = !match;
			card.classList.toggle('is-filter-hidden', !match);
		});

		if (syncUrl) syncFilterToUrl(filter);
		if (revealActive) {
			requestAnimationFrame(() => scrollActiveIntoView());
		}
	}

	filters.addEventListener(
		'scroll',
		() => {
			if (performance.now() < ignoreScrollUntil) return;
			userScrolledFilters = true;
		},
		{ passive: true },
	);

	filters.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const button = target.closest<HTMLButtonElement>(`button[${FILTER_ATTR}]`);
		if (!button || !filters.contains(button)) return;

		const filter = button.getAttribute(FILTER_ATTR);
		if (!filter) return;

		// Clicking a filter is intentional — allow bringing it into view again.
		userScrolledFilters = false;
		setActive(filter);
	});

	const initial = readFilterFromUrl(buttons);
	setActive(initial, false, false);

	if (initial !== 'all') {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => scrollActiveIntoView('auto'));
		});
	}
}

export function initProjectsFilter() {
	document.querySelectorAll<HTMLElement>('[data-projects-filters]').forEach((filters) => {
		const section = filters.closest<HTMLElement>('section');
		if (section) initFilterSection(section);
	});
}
