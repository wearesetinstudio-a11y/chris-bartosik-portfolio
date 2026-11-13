export const LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; htmlLang: string }> = {
	en: { label: 'EN', htmlLang: 'en' },
};

export const dictionary = {
	en: {
		brand: {
			name: 'Chris Bartosik',
			firstName: 'Chris',
		},
		footer: {
			credit: 'Made with passion by Chris Bartosik',
			rights: '© 2026 All rights reserved',
			sitemap: 'Sitemap',
			viewAll: 'All',
		},
		nav: {
			home: 'Home',
			skills: 'Skills',
			projects: 'Projects',
			about: 'About me',
			openMenu: 'Open menu',
			closeMenu: 'Close menu',
			homeAria: 'Chris Bartosik — home',
			language: 'Language',
			main: 'Main',
			mobile: 'Mobile',
		},
		cta: {
			workWithMe: 'Get in touch',
		},
		project: {
			client: 'Client',
			overview: 'Overview',
			challenges: 'Challenges',
			strategy: 'Strategy',
			summary: 'Summary',
			testimonial: 'Client review',
			service: 'Service',
			industry: 'Industry',
			market: 'Market',
			tools: 'Tools',
			year: 'Year',
			live: 'Live',
			seeResult: 'SEE LIVE',
			view: 'view',
			comingSoon: 'coming soon',
		},
		skills: {
			pageTitle: 'Skills',
			pageDescription:
				'Where design, technology, and strategy overlap — product design, brand design, and design engineering.',
			headingLine1: 'I build digital experiences rooted',
			headingLine2: 'in strategy, design, and code.',
			headingLine3: '',
			headingLine1Mobile: 'I build digital experiences',
			headingLine2Mobile: 'rooted in strategy, design, and code.',
			headingLine3Mobile: '',
			tools: 'Tools',
			s1Title: 'Product Design',
			s1Intro:
				'I design digital products built around real business goals. Over the last five years I have worked on mobile apps, websites, design systems, and custom IoT interfaces. My work focuses on solving actual user problems while driving measurable business growth.',
			s1F1Title: 'Research and User Testing',
			s1F1Body:
				'Before jumping into layouts, I need to understand how people actually interact with a product. I run AB tests, user interviews, and behavioral observations using tools like Hotjar and Clarity. Every design choice is backed by real user data rather than guesswork.',
			s1F2Title: 'Flows and Structure',
			s1F2Body:
				'A good product starts with logic, not decoration. I map out user journeys and build early wireframes to make sure the core structure works smoothly. Once the foundation is solid, I scale it up into clean, accessible interfaces and reusable design systems.',
			s1F3Title: 'Motion and Micro-interactions',
			s1F3Body:
				'Details shape how a product feels in daily use. I create subtle UI feedback and interactive components in Rive and Lottie to guide users naturally through the interface. Good motion is never just eye candy, it makes the entire experience feel responsive and intuitive.',
			s2Title: 'Brand Design',
			s2Intro:
				'My approach to brand design comes straight from my background in UX and product. Instead of treating branding as a purely visual exercise, I build identities as practical business tools designed to increase company value and revenue.',
			s2F1Title: 'Business and Customer Research',
			s2F1Body:
				'Every brand project starts with deep research into business goals and customer behavior. I analyze how a brand communicates across different touchpoints, from websites to Instagram and social channels, to spot friction and define what the audience truly needs.',
			s2F2Title: 'Identity and Experience',
			s2F2Body:
				'Once the strategy is clear, I translate those insights into cohesive visual systems. I design brands across all touchpoints so that every element works together consistently. The goal is simple, to create a memorable customer experience that performs in the real market.',
			s3Title: 'Design Engineering',
			s3Intro:
				'I bridge the gap between design and development by taking products from an initial concept all the way to live code. Understanding how things are built allows me to ship faster and push visual polish much further.',
			s3F1Title: 'AI-Assisted Code and No-Code',
			s3F1Body:
				'Today I rely heavily on AI-assisted workflows using Cursor and Claude, alongside Figma layers, to build everything from functional prototypes to production websites. I also have extensive hands-on experience with Webflow and Framer, which gives me a deep understanding of web limitations, layouts, and performance.',
			s3F2Title: 'Analytics and Iteration',
			s3F2Body:
				'Shipping a website is only half the job. I connect analytics tools like Google Analytics to track how visitors behave after launch. When I spot anomalies or drop-offs, I adjust the interface and refine the experience based on real traffic data.',
			s3F3Title: 'Developer Collaboration',
			s3F3Body:
				'Because I understand code and have worked closely with engineers across different tech stacks for years, handoffs are smooth and practical. When I deliver a working front-end foundation, developers can focus on heavy logic while I fine-tune micro-interactions and every visual detail.',
		},
		hero: {
			badgeLocation: 'Panama',
			badgeAvailability: 'REMOTE',
			greeting: 'Hi',
			introBefore: "I'm",
			introAfter: 'Chris',
			roleWord1: 'Digital',
			roleWord2: 'product',
			roleWord3: 'designer',
			roleTitle: '[ Digital product designer ]',
			roleTitleStart: '[ Digital product designer ',
			roleTitleEnd: ']',
			line1: 'Designing high-impact',
			line2Lead: '',
			line2Before: '',
			line2Glitch: 'digital',
			line2After: ' solutions',
			mLine1: 'Designing high-impact',
			mLine2Before: '',
			mLine2Glitch: 'digital',
			mLine2After: ' solutions',
			mLine3Before: '',
			mLine3Glitch: '',
			mLine3After: '',
			description:
				'I’m Chris Bartosik. I design data-driven products powered by AI agents for ultimate efficiency.',
			descriptionLine1: 'I’m Chris Bartosik.',
			descriptionLine2: 'I design data-driven products powered',
			descriptionLine3: 'by AI agents for ultimate efficiency.',
			portraitCaption: '[ Hi! My name is Chris\u00a0Bartosik ]',
			pillar1: 'Product Design',
			pillar2: 'Brand Design',
			pillar3: 'Design Engineering',
			viewWork: 'Selected projects',
			aboutMe: 'About me',
			specialization:
				'I design business-focused brands and products that actually work and scale.',
			specializationLine1: 'I design business-focused brands and products that',
			specializationLine2: 'actually work and scale.',
		},
		work: {
			heading: 'Selected projects & collaborations',
			line1: 'Selected projects',
			line2: '& collaborations',
			description:
				'Designing and building digital products that drive results. From initial concept to clean and smooth execution.',
			seeAll: 'See all projects',
			pageTitle: 'Selected projects & collaborations',
			pageDescription: 'Selected projects by Chris Bartosik.',
			filterAll: 'All projects',
			filterAiDirection: 'AI Direction',
			filterMotion: 'Motion',
			filterWebsites: 'Websites',
			filterEngineering: 'Engineering',
			filterBrandDesign: 'Brand Design',
			filterProductDesign: 'Product Design',
			filterApplications: 'Applications',
		},
		clients: {
			line1: 'Brands & products',
			line2: "I've worked with",
			description:
				'Crafting digital products and brands worldwide, helping businesses of every scale, from ambitious startups to established enterprises.',
		},
		tools: {
			heading: 'Tech stack',
			line1: 'Tech stack',
			line2: '',
		},
		testimonials: {
			line1: 'They say',
			line2: 'about me',
			description:
				'Smooth deliveries and easy, relaxing teamwork go much farther than any fixed deadline. See below how founders and product managers explain in their own words what a collaboration with me usually looks like.',
			quote1:
				'I am more than pleased with the result. Our website has gone from being merely informative to becoming a true representation of who we are as a company.',
			quote2:
				"The way Chris built our new Webflow site moved See More to finally show our clients a professional side we're actually proud of.",
			quote3:
				'Thank you again, I really like how elegant it looks but also showing a youth image as I asked you!',
			quote4:
				'I had the pleasure of working with Chris across multiple projects, and he consistently stands out for his work ethic, professionalism, and user-first mindset. He has exceptional attention to detail and a real talent for crafting slick micro-animations that elevate the user experience. Beyond his strong UX/UI skills, Chris is deeply proactive, always experimenting with new tools and techniques. The fact that he can also build fully functional web applications makes him a uniquely versatile team member. Any team would be lucky to have him.',
			quote5:
				'Krzysiek is not only a great UI Designer with a fantastic eye for motion design, but also someone with an incredible drive for self-improvement. Everything he’s capable of is the result of his own hard work and constant hunger for knowledge.',
			quote6:
				'Krzysiek is a true Figma ninja, his mastery of the tool and meticulous attention to keeping design files organized significantly sped up the work of the entire team. His skill with animations brought a level of polish and lightness to projects that made a huge difference in how the final product was received.',
			quote7:
				'Krzysztof is the kind of designer whose layers aren’t called “Rectangle 12.” Sounds like an urban legend, I know. On top of that, he genuinely thinks about the user and ships UI that doesn’t need fixing during implementation. I’d recommend him to anyone.',
			quote8:
				'I worked with Krzysztof on the same design team for over two years, and during that time I got to know him as a very talented and dedicated designer. He is a true Figma virtuoso with a great eye for design and a genuine passion for what he does.',
			quote9:
				'I had the opportunity to work with Krzysztof on several mobile apps, and it was a very positive experience. Communication was always smooth, and we had no trouble finding solutions that worked well from both the design and implementation perspectives.',
			quote10:
				"I can't recommend Krzysztof Bartosik highly enough - he is easily one of the most versatile, high-impact designers I've worked with. We teamed up on everything from mobile and web apps to complex IoT interfaces and slick motion design. What sets Krzysztof apart is his rare mix of top-tier product sense, attention to micro-interactions, and a deep understanding of technical constraints, which makes cross-functional collaboration effortless. He takes full ownership, brings great energy to the team, and consistently raises the bar on design quality. Any high-growth team or product org would be lucky to have him!",
			role1: 'CEO of NRV',
			role2: 'CEO of See More Logistics',
			role3: 'Owner of TRG',
			role4: 'Developer',
			role5: 'UX/UI Designer at PhotoAiD',
			role6: 'Product Designer at PhotoAiD',
			role7: 'Frontend Team Lead at PhotoAiD',
			role8: 'Designer at PhotoAiD',
			role9: 'Mobile Developer at PhotoAiD',
			role10: 'Product Manager at PhotoAiD',
		},
		about: {
			eyebrow: 'My story',
			intro:
				'I am an independent digital creator who turned a craft obsession into a practice dedicated to quality. I combine design engineering and development to build digital products that last.',
			kickerBefore: '[Beyond',
			kickerAfter: 'the pixels]',
			heading: 'I create digital products where precision meets creativity.',
			body1:
				'For over five years, I have been designing at the intersection of UX/UI, motion design, and code. I build end to end design systems, interfaces, and modern brand identities, turning complex business needs into clear, intuitive experiences.',
			body2:
				'In my daily work, I use AI driven automations. This allows me to deliver polished, production ready design much faster without compromising on quality.',
			body3: '',
			readMore: 'Explore my journey',
			pageTitle: 'About me',
			pageDescription:
				'Chris Bartosik — independent digital creator, design engineer, and developer.',
		},
		aboutPage: {
			role: '[Product designer & AI design specialist]',
			heading:
				'I combine UX/UI, motion design, and AI agents to build production-ready digital products.',
			intro:
				'Over the last 5 years at PhotoAiD, I designed end-to-end product experiences—from web and mobile apps to interactive physical kiosks. I built Design Systems, analyzed user behavior, and optimized conversions through structured A/B testing.',
			timelineHeading: '[My timeline]',
			job1Date: '[2021]',
			job1Title: 'Junior UX/UI designer',
			job1Body:
				'NeuroN is a European edtech startup aimed at younger audiences. I handled the complete design cycle, covering early discovery research and wireframing, user testing, and full developer handoff. Designing accessible, high-engagement interfaces laid the groundwork for my core design habits and structured team workflows.',
			job2Date: '[2022-2026]',
			job2Title: 'Product designer / Motion & AI',
			job2Body:
				'Over 5 years at PhotoAiD, I scaled a global product ecosystem spanning digital platforms and physical hardware. My work covered everything from web and native mobile apps to kiosk hardware interfaces and design systems.',
			job2Item1: 'Building and managing a scalable multi platform Design System in Figma.',
			job2Item2: 'Designing mobile first web applications, native mobile screens, and hardware kiosk interfaces.',
			job2Item3: 'Analyzing user behavior with Clarity and Google Analytics to drive A/B test iterations.',
			job2Item4: 'Integrating lightweight Rive animations for interactive feedback and polished UX.',
			job2Item5: 'Defining clean token structures and clear technical specifications for seamless engineering handoffs.',
			seeMore: 'See more',
			job3Date: '[2021 — present]',
			job3Title: 'Freelance brand & web designer',
			job3Body:
				'Parallel to my core roles, I design brands and digital products for external clients. I deliver cohesive visual identities and modern web platforms across logistics, real estate, public sector, and tech startups.',
			exploreWork: 'View projects',
			close1:
				'Design tools evolve fast, and staying ahead of the curve is my core mindset. I combine Rive micro-animations with AI workflows (Midjourney, Kling, Magnific) and modern tools like Cursor AI and Webflow to build and deploy production-ready web platforms in a matter of days.',
			close2:
				'I design with engineering constraints in mind. Developers value my handoffs for structured Figma variables, clean tokens, and clear motion specs. Currently based in Panama (EST), fully aligned with US East Coast hours and overlapping with European afternoons. Fluent in English, native in Polish, and B2 Spanish.',
			meeting: "Let's set a meeting",
		},
		contact: {
			heading: "Let's build something great together",
			line1: "Let's build something",
			line2: 'great together',
			description:
				'There is no better start to a successful business partnership than a friendly chat. Get in touch today and we will craft together your perfect solution.',
			sendEmail: 'Get in touch',
		},
		meta: {
			title: 'Chris Bartosik',
			description:
				'Independent digital creator, design engineer, and developer forging high-performance digital experiences.',
		},
		errorPage: {
			title: 'Page not found',
			description: 'This page does not exist. Head back to the start screen.',
			heading: 'Upssss... Looks like we got lost.',
			cta: "Let's go to start screen",
		},
	}
} as const;

type Dictionary = (typeof dictionary)[Locale];

export function isLocale(value: unknown): value is Locale {
	return value === 'en';
}

export function getLocale(): Locale {
	return DEFAULT_LOCALE;
}

export function setLocale(_locale: Locale) {
	/* English-only site — locale switching removed */
}

function lookup(source: Dictionary, key: string): string | undefined {
	const parts = key.split('.');
	let node: unknown = source;

	for (const part of parts) {
		if (typeof node !== 'object' || node === null || !(part in node)) return undefined;
		node = (node as Record<string, unknown>)[part];
	}

	return typeof node === 'string' ? node : undefined;
}

export function t(key: string, locale: Locale = getLocale()): string {
	return lookup(dictionary[locale], key) ?? lookup(dictionary.en, key) ?? key;
}

export function formatLabel(
	key: string,
	count?: number,
	locale: Locale = getLocale(),
	countStyle: 'brackets' | 'plus' = 'brackets',
): string {
	const label = t(key, locale);
	if (count === undefined) return label;
	return countStyle === 'plus' ? `${label} +${count}` : `${label} [${count}]`;
}
