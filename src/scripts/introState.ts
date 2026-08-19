type IntroWindow = Window &
	typeof globalThis & {
		__setinIntroComplete?: boolean;
		__setinIntroRunning?: boolean;
	};

function introWindow(): IntroWindow {
	return window as IntroWindow;
}

export function hasCompletedIntro(): boolean {
	return introWindow().__setinIntroComplete === true;
}

export function markIntroComplete(): void {
	introWindow().__setinIntroComplete = true;
}

export function dispatchIntroComplete(): void {
	window.dispatchEvent(new CustomEvent('intro-complete'));
}

export function isIntroSequenceRunning(): boolean {
	return introWindow().__setinIntroRunning === true;
}

export function clearIntroPending(): void {
	document.documentElement.classList.remove('intro-pending', 'intro-revealing');
}

export function setIntroPending(): void {
	document.documentElement.classList.add('intro-pending');
	document.documentElement.classList.remove('intro-revealing');
}

export function setIntroRevealing(): void {
	document.documentElement.classList.add('intro-pending', 'intro-revealing');
}

export function setIntroSequenceRunning(running: boolean): void {
	introWindow().__setinIntroRunning = running;
}
