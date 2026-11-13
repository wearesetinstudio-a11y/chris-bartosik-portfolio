import { useEffect, useMemo, useState } from 'react';
import PixelArt from '../PixelArt';

export type SkillPixelItem = {
	id: string;
	src: string;
	label: string;
};

type SkillsPixelStageProps = {
	items: SkillPixelItem[];
	className?: string;
};

/**
 * Desktop sticky stage: skill icons dissolve into each other as exact squares
 * (shared grid hash), driven by scroll section handoff.
 */
export default function SkillsPixelStage({
	items,
	className = '',
}: SkillsPixelStageProps) {
	const [weights, setWeights] = useState<number[]>(() => items.map((_, i) => (i === 0 ? 1 : 0)));

	const activeIndex = useMemo(() => {
		let best = 0;
		let bestW = -1;
		for (let i = 0; i < weights.length; i += 1) {
			if (weights[i] > bestW) {
				bestW = weights[i];
				best = i;
			}
		}
		return best;
	}, [weights]);

	useEffect(() => {
		const blocks = items
			.map((item) => document.querySelector<HTMLElement>(`[data-skills-block="${item.id}"]`))
			.filter((el): el is HTMLElement => Boolean(el));

		if (blocks.length === 0) return;

		let raf = 0;

		function measure() {
			raf = 0;
			const vh = window.innerHeight || 1;
			// Longer handoff so squares have time to dissolve into the next icon.
			const activateY = vh * 0.4;
			const blendStart = vh * 0.72;

			let active = 0;
			for (let i = 0; i < blocks.length; i += 1) {
				if (blocks[i].getBoundingClientRect().top <= activateY) active = i;
			}

			const next = blocks.map(() => 0);
			next[active] = 1;

			if (active < blocks.length - 1) {
				const nextTop = blocks[active + 1].getBoundingClientRect().top;
				const t = Math.min(
					1,
					Math.max(0, (blendStart - nextTop) / Math.max(1, blendStart - activateY)),
				);
				if (t > 0.01) {
					const eased = t * t * (3 - 2 * t);
					next[active] = 1 - eased;
					next[active + 1] = eased;
				}
			}

			const sum = next.reduce((a, b) => a + b, 0) || 1;
			setWeights(next.map((w) => w / sum));
		}

		function onScroll() {
			if (raf) return;
			raf = requestAnimationFrame(measure);
		}

		measure();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		return () => {
			if (raf) cancelAnimationFrame(raf);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [items]);

	return (
		<div className={`skills-pixel-stage ${className}`.trim()}>
			{items.map((item, i) => {
				const w = weights[i] ?? 0;
				const visible = w > 0.01;
				return (
					<div
						key={item.id}
						className={`skills-pixel-stage__layer${i === activeIndex ? ' is-active' : ''}`}
						style={{ opacity: visible ? 1 : 0 }}
						aria-hidden={i !== activeIndex}
					>
						<PixelArt
							src={item.src}
							subjectFill={0.88}
							presence={w}
							active={i === activeIndex || w > 0.08}
							aria-label={item.label}
						/>
					</div>
				);
			})}
		</div>
	);
}
