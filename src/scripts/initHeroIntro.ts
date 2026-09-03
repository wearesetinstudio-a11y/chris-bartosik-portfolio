import { hasCompletedIntro } from './introState.ts';

/** Keep in sync with --hero-duration in HeroSection.astro */
const HERO_DURATION_MS = 600;
/** Gap between intro sequence groups */
const HERO_STAGGER_MS = 180;
/** Gap between consecutive skill / pillar links */
const HERO_PILLAR_STAGGER_MS = 70;
const HAND_WAVE_INTERVAL_MS = 3000;
const MOBILE_INTRO_MQ = '(max-width: 767px)';

const MOBILE_INTRO_STEPS = [['greeting'], ['name'], ['role-a'], ['role-b']] as const;
const DESKTOP_INTRO_STEPS = [
	['greeting', 'name'],
	['role-a', 'role-b'],
] as const;

let heroIntroRunId = 0;
let heroIntroHasRun = false;
let handWaveIntervalId: number | null = null;

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});
}

function isMobileIntro() {
	return window.matchMedia(MOBILE_INTRO_MQ).matches;
}

function getIntroGroup(hero: HTMLElement, id: string) {
	return hero.querySelector<HTMLElement>(`[data-hero-intro-group="${id}"]`);
}

function getIntroGroups(hero: HTMLElement) {
	return [...hero.querySelectorAll<HTMLElement>('[data-hero-intro-group]')];
}

function getFollowItems(hero: HTMLElement) {
	return [...hero.querySelectorAll<HTMLElement>('[data-hero-follow-item]')];
}

function getIntroSteps(hero: HTMLElement) {
	const stepIds = isMobileIntro() ? MOBILE_INTRO_STEPS : DESKTOP_INTRO_STEPS;
	return stepIds.map((ids) =>
		ids.map((id) => getIntroGroup(hero, id)).filter((group): group is HTMLElement => group !== null),
	);
}

function getPhoto(hero: HTMLElement) {
	return hero.querySelector<HTMLElement>('[data-hero-photo]');
}

function stepIncludesName(step: HTMLElement[]) {
	return step.some((group) => group.dataset.heroIntroGroup === 'name');
}

function stopHandWaveLoop() {
	if (handWaveIntervalId !== null) {
		window.clearInterval(handWaveIntervalId);
		handWaveIntervalId = null;
	}
}

function playHandWave(hero: HTMLElement) {
	const hand = hero.querySelector<HTMLElement>('[data-hero-hand]');
	if (!hand) return;

	hand.classList.remove('is-waving');
	void hand.offsetWidth;
	hand.classList.add('is-waving');

	const onWaveEnd = () => {
		hand.classList.remove('is-waving');
		hand.removeEventListener('animationend', onWaveEnd);
	};

	hand.addEventListener('animationend', onWaveEnd);
}

function startHandWaveLoop(hero: HTMLElement) {
	stopHandWaveLoop();
	playHandWave(hero);
	handWaveIntervalId = window.setInterval(() => {
		playHandWave(hero);
	}, HAND_WAVE_INTERVAL_MS);
}

function showAllFollowItems(hero: HTMLElement) {
	getFollowItems(hero).forEach((item) => {
		item.classList.add('is-visible');
	});
	hero.classList.add('is-hero-follow-complete');
}

function hideAllFollowItems(hero: HTMLElement) {
	getFollowItems(hero).forEach((item) => {
		item.classList.remove('is-visible');
	});
	hero.classList.remove('is-hero-follow-complete');
}

function setFinalState(hero: HTMLElement) {
	heroIntroHasRun = true;
	getIntroGroups(hero).forEach((group) => {
		group.classList.add('is-visible');
	});
	getPhoto(hero)?.classList.add('is-photo-visible');
	hero.classList.add('is-hero-intro-complete');
	showAllFollowItems(hero);
	startHandWaveLoop(hero);
}

function resetHeroIntro(hero: HTMLElement) {
	stopHandWaveLoop();
	hero.classList.add('is-hero-intro-resetting');
	hero.classList.remove('is-hero-intro-complete');
	hideAllFollowItems(hero);
	getIntroGroups(hero).forEach((group) => {
		group.classList.remove('is-visible');
	});
	getPhoto(hero)?.classList.remove('is-photo-visible');

	const hand = hero.querySelector<HTMLElement>('[data-hero-hand]');
	hand?.classList.remove('is-waving');

	const photoImg = hero.querySelector<HTMLImageElement>('[data-hero-photo] img');
	if (photoImg) {
		photoImg.style.transform = '';
	}

	void hero.offsetWidth;
}

function releaseHeroIntroReset(hero: HTMLElement) {
	hero.classList.remove('is-hero-intro-resetting');
}

export function prepareHeroIntroReplay() {
	const hero = document.getElementById('hero-section');
	if (!hero) return;

	heroIntroRunId++;
	resetHeroIntro(hero);
}

export function replayHeroIntro() {
	const hero = document.getElementById('hero-section');
	if (!hero || !heroIntroHasRun) return;

	startHeroIntro();
}

async function waitFrames(count = 2): Promise<void> {
	for (let i = 0; i < count; i++) {
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}
}

function isPillarItem(item: HTMLElement) {
	return item.classList.contains('hero-pillar');
}

async function runFollowSequence(hero: HTMLElement, isActive: () => boolean) {
	const followItems = getFollowItems(hero);

	for (let i = 0; i < followItems.length; i++) {
		if (!isActive()) return;
		followItems[i].classList.add('is-visible');
		if (i < followItems.length - 1) {
			const betweenPillars = isPillarItem(followItems[i]) && isPillarItem(followItems[i + 1]);
			await wait(betweenPillars ? HERO_PILLAR_STAGGER_MS : HERO_STAGGER_MS);
		}
	}

	if (!isActive()) return;
	hero.classList.add('is-hero-follow-complete');
}

async function runIntroSequence(hero: HTMLElement) {
	const runId = ++heroIntroRunId;
	const isActive = () => runId === heroIntroRunId;

	heroIntroHasRun = true;
	resetHeroIntro(hero);
	await waitFrames(2);
	releaseHeroIntroReset(hero);

	const steps = getIntroSteps(hero);
	const photo = getPhoto(hero);
	const followPromise = runFollowSequence(hero, isActive);

	for (let i = 0; i < steps.length; i++) {
		if (!isActive()) return;

		const step = steps[i];
		step.forEach((group) => {
			group.classList.add('is-visible');
		});

		document.dispatchEvent(new CustomEvent('hero-intro-progress'));

		if (stepIncludesName(step)) {
			photo?.classList.add('is-photo-visible');
		}

		if (i < steps.length - 1) {
			await wait(HERO_STAGGER_MS);
		}
	}

	if (!isActive()) return;

	hero.classList.add('is-hero-intro-complete');
	startHandWaveLoop(hero);
	await followPromise;
}

function startHeroIntro() {
	const hero = document.getElementById('hero-section');
	if (!hero) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reducedMotion) {
		heroIntroRunId++;
		setFinalState(hero);
		return;
	}

	void runIntroSequence(hero);
}

export function initHeroIntro() {
	const hero = document.getElementById('hero-section');
	if (!hero) return;

	if (hasCompletedIntro()) {
		startHeroIntro();
		return;
	}

	window.addEventListener('intro-complete', startHeroIntro, { once: true });
}
