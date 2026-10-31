const AWAY_TITLE = "I'm waiting for U👀";

type TabTitleWindow = Window &
	typeof globalThis & {
		__tabTitleBound?: boolean;
		__tabTitleOriginal?: string;
	};

function syncOriginalTitle() {
	const w = window as TabTitleWindow;
	const current = document.title;
	if (current !== AWAY_TITLE) {
		w.__tabTitleOriginal = current;
	}
}

function onVisibilityChange() {
	const w = window as TabTitleWindow;

	if (document.visibilityState === 'hidden') {
		syncOriginalTitle();
		document.title = AWAY_TITLE;
		return;
	}

	document.title = w.__tabTitleOriginal ?? document.title;
}

export function initTabTitle() {
	const w = window as TabTitleWindow;
	if (w.__tabTitleBound) {
		syncOriginalTitle();
		if (document.visibilityState === 'hidden') {
			document.title = AWAY_TITLE;
		}
		return;
	}

	w.__tabTitleBound = true;
	w.__tabTitleOriginal = document.title;

	document.addEventListener('visibilitychange', onVisibilityChange);
	document.addEventListener('i18n-applied', () => {
		syncOriginalTitle();
		if (document.visibilityState === 'hidden') {
			document.title = AWAY_TITLE;
		}
	});
}
