export const LOCALES = ['en', 'pl', 'pa'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'portfolio-locale';

export const localeMeta: Record<Locale, { label: string; htmlLang: string }> = {
	en: { label: 'EN', htmlLang: 'en' },
	pl: { label: 'PL', htmlLang: 'pl' },
	pa: { label: 'ES', htmlLang: 'es' },
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
			service: 'Service',
			industry: 'Industry',
			market: 'Market',
			tools: 'Tools',
			year: 'Year',
			live: 'Live',
			view: 'view',
			comingSoon: 'coming soon',
		},
		skills: {
			pageTitle: 'Skills',
			pageDescription:
				'Where design, technology, and strategy overlap — product UX/UI, motion, generative AI, and AI-assisted development.',
			headingLine1: 'Where design, technology,',
			headingLine2: 'and strategy overlap.',
			headingLine3: '',
			tools: 'Tools',
			s1Title: 'Product & UX/UI Design',
			s1Intro:
				'I design scalable products that align user needs with business goals. From discovery through execution and testing, I ensure consistency, sustainability, and smooth performance across all platforms.',
			s1F1Title: 'Design System Architecture',
			s1F1Body:
				'Building, scaling, and maintaining cohesive design systems in Figma using tokens, variables, and flexible component libraries.',
			s1F2Title: 'Data-Driven UX',
			s1F2Body:
				'Analyzing real user behavior with Clarity and Google Analytics, combined with A/B testing to optimize conversions.',
			s1F3Title: 'Cross-Platform Interfaces',
			s1F3Body:
				'Designing responsive web solutions (mobile-first), native mobile apps, and custom interfaces like interactive kiosks.',
			s2Title: 'Motion Design',
			s2Intro:
				"Motion isn't decoration, it's clear feedback and UX continuity. I design lightweight, interactive animations that give products a polished, modern feel without sacrificing performance.",
			s2F1Title: 'Rive & State Machines',
			s2F1Body:
				'Creating interactive animations and state-driven UI logic that react in real time to user actions.',
			s2F2Title: 'UI Polish & Micro-interactions',
			s2F2Body:
				'Elevating interface quality through functional micro-interactions, state transitions, and instant visual feedback.',
			s2F3Title: 'Handoff & Dev Specs',
			s2F3Body:
				'Preparing production-ready reference assets and Rive files for seamless front-end integration.',
			s2F4Title: 'Handoff & Dev Specs',
			s2F4Body:
				'Preparing production-ready reference assets and Rive files for seamless front-end integration.',
			s3Title: 'AI Agents & Automation',
			s3Intro:
				'I integrate AI agents directly into the design workflow. I explore visual concepts, generate custom assets, and build high-end compositions in hours instead of weeks.',
			s3F1Title: 'Asset & Concept Generation',
			s3F1Body:
				'Using generative AI to rapidly explore ideas and create custom visual assets within daily workflows.',
			s3F2Title: 'High-End Visual Compositions',
			s3F2Body:
				'Creating unique graphics, video loops, and dynamic layouts for digital campaigns and brand touchpoints.',
			s3F3Title: 'Prompt Engineering & Upscaling',
			s3F3Body:
				'Precise prompt definition and output scaling to deliver polished, production-ready visual assets.',
			s4Title: 'No-code & AI Development',
			s4Intro:
				'I combine design and code using AI assistants and modern web tools. I efficiently transform complex designs into responsive, production-ready products.',
			s4F1Title: 'AI-Assisted Web Development',
			s4F1Body:
				'Building, prototyping, and deploying custom web platforms using tools like Cursor AI and Claude Code.',
			s4F2Title: 'Webflow & No-Code Platforms',
			s4F2Body:
				'Building scalable Webflow sites with custom CMS structures, animations, and clean, responsive code.',
			s4F3Title: 'Developer-Ready Handoff',
			s4F3Body:
				'Designing with code realities in mind. Structured Figma variables, design tokens, and clear technical specifications.',
		},
		hero: {
			badgeLocation: 'Panama',
			badgeAvailability: 'Global remotely',
			roleTitle: '[ Product designer & Creative Engineer ]',
			roleTitleStart: '[ Product designer ',
			roleTitleEnd: '& Creative Engineer ]',
			line1: 'Crafting efficient products',
			line2Lead: '',
			line2Before: '& ',
			line2Glitch: 'digital',
			line2After: ' solutions.',
			mLine1: 'Crafting',
			mLine2Before: 'efficient products',
			mLine2Glitch: '',
			mLine2After: '',
			mLine3Before: '& ',
			mLine3Glitch: 'digital',
			mLine3After: ' solutions.',
			description:
				'I’m Chris Bartosik. I design data-driven products powered by AI agents for ultimate efficiency.',
			descriptionLine1: 'I’m Chris Bartosik.',
			descriptionLine2: 'I design data-driven products powered',
			descriptionLine3: 'by AI agents for ultimate efficiency.',
			portraitCaption: '[ Hi! My name is Chris\u00a0Bartosik ]',
			pillar1: 'Product & UX/UI Design',
			pillar2: 'Motion Design',
			pillar3: 'No-code & AI Development',
			pillar4: 'AI Agents & Automation',
			viewWork: 'Selected projects',
			aboutMe: 'About me',
		},
		work: {
			heading: 'Featured projects & collaborations',
			line1: 'Featured projects',
			line2: '& collaborations',
			description:
				'I build digital products designed to drive business growth. End-to-end execution, powered by AI workflows.',
			seeAll: 'See all projects',
			pageTitle: 'Featured projects & collaborations',
			pageDescription: 'Selected projects by Chris Bartosik.',
			filterAll: 'All projects',
			filterUxUi: 'UX/UI',
			filterMotion: 'Motion',
			filterAi: 'AI Design',
			filterDev: 'Development',
			filterBranding: 'Branding',
			filterPhotoaid: 'PhotoAiD',
		},
		clients: {
			line1: 'Brands & products',
			line2: "I've worked with",
			description:
				'For over 5 years, I’ve been designing scalable interfaces and digital products for businesses at every stage - from early-stage startups to established enterprises.',
		},
		tools: {
			heading: 'Tech stack & tools',
			line1: 'Tech stack',
			line2: '& tools',
		},
		testimonials: {
			line1: 'Clients feedbacks',
			line2: '& impressions',
			description:
				'Clean handoffs and stress-free collaboration outlast any launch date. Here is how founders and product leads describe what it’s actually like to team up with me.',
			quote1:
				'I am more than pleased with the result. Our website has gone from being merely informative to becoming a true representation of who we are as a company.',
			quote2:
				"The way Chris built our new Webflow site moved See More to finally show our clients a professional side we're actually proud of.",
			quote3:
				'Thank you again, I really like how elegant it looks but also showing a youth image as I asked you!',
			quote4:
				'The fresh look and energy Chris provided allowed us to show the world what MexiMunchies is all about.',
			quote5:
				'A total transformation. Chris provided the strategic branding we needed to stand out on market and connect with our audience.',
			role1: 'CEO of NRV',
			role2: 'CEO of See More Logistics',
			role3: 'Owner of TRG',
			role4: 'Founder of Mexi Munchies',
			role5: 'Founder of Snacks Lovers PTY',
		},
		about: {
			eyebrow: 'My story',
			intro:
				'I am an independent digital creator who turned a craft obsession into a practice dedicated to quality. I combine design engineering and development to build digital products that last.',
			kickerBefore: '[Beyond',
			kickerAfter: 'the pixels]',
			heading: 'I build products that balance technical precision with creative experiences.',
			body1:
				'Over the past 5+ years, I’ve built products at the crossroads of product design, motion, and dev execution. I help companies turn complex operational problems into scalable design systems, sharp interfaces, and memorable brand identities.',
			body2:
				'I integrate custom AI agent pipelines directly into my day-to-day workflow. This lets me streamline production and deliver assets in record time, without sacrificing a single detail.',
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
				'Every successful project starts with a simple conversation. Reach out and let’s create great success together.',
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
	},
	pl: {
		brand: {
			name: 'Krzysztof Bartosik',
			firstName: 'Krzysztof',
		},
		footer: {
			credit: 'Stworzone z pasją przez Krzysztofa Bartosika',
			rights: '© 2026 All rights reserved',
			sitemap: 'Mapa strony',
			viewAll: 'Wszystkie',
		},
		nav: {
			home: 'Start',
			skills: 'Skille',
			projects: 'Projekty',
			about: 'O mnie',
			openMenu: 'Otwórz menu',
			closeMenu: 'Zamknij menu',
			homeAria: 'Krzysztof Bartosik — strona główna',
			language: 'Język',
			main: 'Główne',
			mobile: 'Mobilne',
		},
		cta: {
			workWithMe: 'Napisz do mnie',
		},
		project: {
			client: 'Klient',
			overview: 'Kontekst',
			challenges: 'Wyzwania',
			strategy: 'Strategia',
			summary: 'Podsumowanie',
			service: 'Usługa',
			industry: 'Branża',
			market: 'Rynek',
			tools: 'Narzędzia',
			year: 'Rok',
			live: 'Live',
			view: 'zobacz',
			comingSoon: 'już wkrótce',
		},
		skills: {
			pageTitle: 'Umiejętności',
			pageDescription:
				'Na styku designu, technologii i strategii — product UX/UI, motion, generative AI i development wspierany AI.',
			headingLine1: 'Na styku designu,',
			headingLine2: 'technologii i strategii.',
			headingLine3: '',
			tools: 'Narzędzia',
			s1Title: 'Product & UX/UI Design',
			s1Intro:
				'Projektuję skalowalne produkty, łącząc potrzeby użytkowników z celami biznesowymi. Od fazy discovery po wdrożenie i testy — dbam o spójność, trwałość i płynne działanie na każdej platformie.',
			s1F1Title: 'Architektura design systemu',
			s1F1Body:
				'Budowa, skalowanie i utrzymanie spójnych systemów w Figmie — tokeny, zmienne i elastyczne biblioteki komponentów.',
			s1F2Title: 'UX oparty na danych',
			s1F2Body:
				'Analiza zachowań użytkowników (Clarity, Google Analytics) oraz testy A/B ukierunkowane na optymalizację konwersji.',
			s1F3Title: 'Interfejsy multiplatformowe',
			s1F3Body:
				'Projektowanie rozwiązań webowych (mobile-first), natywnych aplikacji mobilnych oraz niestandardowych interfejsów, np. kiosków interaktywnych.',
			s2Title: 'Motion Design',
			s2Intro:
				'Motion to nie dekoracja, to czytelny feedback i płynność UX. Projektuję lekkie, interaktywne animacje, które nadają produktom dopracowany, nowoczesny charakter bez utraty wydajności.',
			s2F1Title: 'Rive & State Machines',
			s2F1Body:
				'Tworzenie interaktywnych animacji i logiki UI opartej na stanach, które reagują w czasie rzeczywistym na akcje użytkownika.',
			s2F2Title: 'Projektowanie UI i mikrointerakcji',
			s2F2Body:
				'Podnoszenie jakości interfejsu poprzez funkcjonalne mikrointerakcje, przejścia między stanami i natychmiastowy feedback wizualny.',
			s2F3Title: 'Handoff i specyfikacja dla devów',
			s2F3Body:
				'Przygotowanie gotowych assetów referencyjnych oraz plików Rive do bezproblemowej integracji z front-endem.',
			s2F4Title: 'Handoff i specyfikacja dla devów',
			s2F4Body:
				'Przygotowanie gotowych assetów referencyjnych oraz plików Rive do bezproblemowej integracji z front-endem.',
			s3Title: 'Automatyzacje z agentami AI',
			s3Intro:
				'Wprowadzam agentów AI bezpośrednio w proces projektowy. Tworzę koncepcje wizualne, generuję dedykowane assety i składam zaawansowane kompozycje w godziny, a nie tygodnie.',
			s3F1Title: 'Produkcja assetów i konceptów',
			s3F1Body:
				'Wykorzystanie generative AI do szybkiego eksplorowania pomysłów i tworzenia dedykowanych materiałów wizualnych w codziennym workflow.',
			s3F2Title: 'Zaawansowane kompozycje wizualne',
			s3F2Body:
				'Tworzenie unikalnych grafik, pętli wideo i dynamicznych layoutów na potrzeby kampanii cyfrowych oraz punktów styku z marką.',
			s3F3Title: 'Prompt engineering i upscaling',
			s3F3Body:
				'Precyzyjne definiowanie promptów i skalowanie ich możliwości, by dostarczać gotowe do publikacji, dopracowane assety wizualne.',
			s4Title: 'Wdrożenia AI i no-code',
			s4Intro:
				'Łączę design z kodem wykorzystując asystentów AI oraz nowoczesne narzędzia. Sprawnie zamieniam złożone projekty w responsywne, gotowe do wdrożenia produkty.',
			s4F1Title: 'Budowa stron ze wsparciem AI',
			s4F1Body:
				'Tworzenie, prototypowanie i wdrażanie szytych na miarę platform webowych z wykorzystaniem narzędzi takich jak Cursor AI i Claude Code.',
			s4F2Title: 'Webflow i platformy no-code',
			s4F2Body:
				'Budowa skalowalnych stron na Webflow z dedykowaną strukturą CMS, animacjami i czystym, responsywnym kodem.',
			s4F3Title: 'Handoff gotowy dla deweloperów',
			s4F3Body:
				'Projektowanie z uwzględnieniem realiów kodu. Uporządkowane zmienne w Figmie, design tokens i czytelne specyfikacje techniczne.',
		},
		hero: {
			badgeLocation: 'Panama',
			badgeAvailability: 'Globalnie zdalnie',
			roleTitle: '[ Product designer & Creative Engineer ]',
			roleTitleStart: '[ Product designer ',
			roleTitleEnd: '& Creative Engineer ]',
			line1: 'Projektuję skalowalne produkty',
			line2Lead: '',
			line2Before: 'i nowoczesne systemy ',
			line2Glitch: 'cyfrowe',
			line2After: '',
			mLine1: 'Projektuję skalowalne',
			mLine2Before: 'produkty i nowoczesne',
			mLine2Glitch: '',
			mLine2After: '',
			mLine3Before: 'systemy ',
			mLine3Glitch: 'cyfrowe',
			mLine3After: '',
			description:
				'Nazywam się Krzysztof Bartosik. Łączę dane i agentów AI, tworząc niezawodne produkty cyfrowe.',
			descriptionLine1: 'Nazywam się Krzysztof Bartosik.',
			descriptionLine2: 'Łączę dane i agentów AI, tworząc',
			descriptionLine3: 'niezawodne produkty cyfrowe.',
			portraitCaption: '[ Cześć! Nazywam się Krzysztof\u00a0Bartosik ]',
			pillar1: 'Product & UX/UI Design',
			pillar2: 'Motion Design',
			pillar3: 'Wdrożenia AI i no-code',
			pillar4: 'Automatyzacje z agentami AI',
			viewWork: 'Wybrane projekty',
			aboutMe: 'O mnie',
		},
		work: {
			heading: 'Wybrane projekty i realizacje',
			line1: 'Wybrane projekty',
			line2: 'i realizacje',
			description:
				'Tworzę produkty, które rozwiązują realne problemy biznesowe. Od koncepcji po wdrożenia wspierane przez agentów AI.',
			seeAll: 'Zobacz wszystkie projekty',
			pageTitle: 'Wybrane projekty i realizacje',
			pageDescription: 'Wybrane projekty Krzysztofa Bartosika.',
			filterAll: 'Wszystkie projekty',
			filterUxUi: 'UX/UI',
			filterMotion: 'Motion',
			filterAi: 'AI Design',
			filterDev: 'Development',
			filterBranding: 'Branding',
			filterPhotoaid: 'PhotoAiD',
		},
		clients: {
			line1: 'Marki i produkty,',
			line2: 'z którymi współpracowałem',
			description:
				'Od ponad 5 lat tworzę skalowalne interfejsy i produkty cyfrowe dla podmiotów na różnym etapie rozwoju - od startupów po dojrzałe organizacje.',
		},
		tools: {
			heading: 'Stack technologiczny i narzędzia',
			line1: 'Stack technologiczny',
			line2: 'i narzędzia',
		},
		testimonials: {
			line1: 'Co mówią',
			line2: 'o mnie klienci',
			description:
				'Dobre relacje i sprawny proces zostają na długo po wdrożeniu. Zobacz, jak partnerstwo ze mną oceniają osoby po drugiej stronie ekranu.',
			quote1:
				'I am more than pleased with the result. Our website has gone from being merely informative to becoming a true representation of who we are as a company.',
			quote2:
				"The way Krzysztof built our new Webflow site moved See More to finally show our clients a professional side we're actually proud of.",
			quote3:
				'Thank you again, I really like how elegant it looks but also showing a youth image as I asked you!',
			quote4:
				'The fresh look and energy Krzysztof provided allowed us to show the world what MexiMunchies is all about.',
			quote5:
				'A total transformation. Krzysztof provided the strategic branding we needed to stand out on market and connect with our audience.',
			role1: 'CEO NRV',
			role2: 'CEO See More Logistics',
			role3: 'Właścicielka TRG',
			role4: 'Założycielka Mexi Munchies',
			role5: 'Założyciel Snacks Lovers PTY',
		},
		about: {
			eyebrow: 'Moja historia',
			intro:
				'Jestem niezależnym twórcą cyfrowym, który zamienił obsesję na punkcie rzemiosła w praktykę oddaną jakości. Łączę design engineering z developmentem, by budować produkty cyfrowe, które trwają.',
			kickerBefore: '[Poza',
			kickerAfter: 'pikselami]',
			heading: 'Tworzę produkty cyfrowe, w których precyzja łączy się z kreatywnością.',
			body1:
				'Od ponad pięciu lat projektuję na styku UX/UI, motion designu i kodu. Tworzę kompleksowe design systemy, interfejsy oraz nowoczesne marki, przekształcając skomplikowane potrzeby biznesowe w proste i intuicyjne rozwiązania.',
			body2:
				'W codziennej pracy wykorzystuję automatyzacje z udziałem agentów AI. Pozwala mi to dowozić dojrzałe, dopracowane interfejsy znacznie szybciej i bez jakichkolwiek kompromisów jakościowych.',
			readMore: 'Przeczytaj całą historię',
			pageTitle: 'O mnie',
			pageDescription:
				'Krzysztof Bartosik — niezależny twórca cyfrowy, design engineer i deweloper.',
		},
		aboutPage: {
			role: '[Product designer & AI design specialist]',
			heading:
				'Łączę UX/UI, motion design i agentów AI, tworząc produkty cyfrowe gotowe do wdrożenia.',
			intro:
				'Przez 5 lat w PhotoAiD projektowałem doświadczenia produktowe od A do Z — od aplikacji webowych i mobilnych po fizyczne kioski. Tworzyłem Design Systemy, analizowałem zachowania użytkowników (Clarity, GA) i optymalizowałem konwersję poprzez testy A/B.',
			timelineHeading: '[Moja oś czasu]',
			job1Date: '[2021]',
			job1Title: 'Junior UX/UI designer',
			job1Body:
				'NeuroN to europejski startup społeczno-edukacyjny kierowany do młodych odbiorców. Odpowiadałem tam za pełny cykl projektowy, obejmujący wstępne badania i warsztaty discovery, makiety, testy z użytkownikami oraz przekazanie prac deweloperom. Projekt wymagał budowania przejrzystych i dostępnych (WCAG) interfejsów, co dało mi solidne podstawy w układaniu powtarzalnych procesów projektowych i nawyków pracy w zespole.',
			job2Date: '[2022-2026]',
			job2Title: 'Product designer / Motion i AI',
			job2Body:
				'Przez 5 lat w PhotoAiD rozwijałem globalny ekosystem produktów cyfrowych i fizycznych. Zakres moich prac obejmował projektowanie aplikacji webowych oraz mobilnych, interfejsów dla fizycznych kiosków fotograficznych, a także wdrażanie zaawansowanych systemów projektowych.',
			job2Item1: 'Budowa i rozwijanie skalowalnego, wieloplatformowego Design Systemu w Figmie.',
			job2Item2: 'Projektowanie responsywnych interfejsów webowych mobile first, aplikacji mobilnych oraz ekranów dla urządzeń hardware.',
			job2Item3: 'Analiza zachowań użytkowników w Clarity i Google Analytics oraz walidacja projektów poprzez testy A/B.',
			job2Item4: 'Wdrażanie interaktywnych mikroanimacji Rive poprawiających płynność i odbiór interfejsu.',
			job2Item5: 'Tworzenie spójnej architektury tokenów oraz specyfikacji technicznych dla zespołu deweloperskiego.',
			seeMore: 'Zobacz więcej',
			job3Date: '[2021 — obecnie]',
			job3Title: 'Freelancer',
			job3Body:
				'Równolegle projektuję marki i platformy cyfrowe dla klientów z zewnątrz. Tworzę spójne tożsamości wizualne oraz nowoczesne strony webowe dla sektora publicznego, branży logistycznej, nieruchomości oraz startupów technologicznych.',
			exploreWork: 'Zobacz realizacje',
			close1:
				'Narzędzia designu zmieniają się szybko, a bycie przed krzywą to mój podstawowy mindset. Łączę mikroanimacje Rive z workflowami AI (Midjourney, Kling, Magnific) i nowoczesnymi narzędziami jak Cursor AI i Webflow, by budować i wdrażać gotowe do produkcji platformy webowe w ciągu dni.',
			close2:
				'Projektuję z myślą o ograniczeniach inżynierskich. Deweloperzy cenią moje handoffy za uporządkowane zmienne Figma, czyste tokeny i jasne specyfikacje motion. Teraz Panama (EST) — pełne dopasowanie do godzin US East Coast i nachodzenie na popołudnia w Europie. Biegły angielski, polski native, hiszpański B2.',
			meeting: 'Umówmy spotkanie',
		},
		contact: {
			heading: 'Zbudujmy razem coś wyjątkowego',
			line1: 'Zbudujmy razem',
			line2: 'coś wyjątkowego',
			description:
				'Każdy udany projekt zaczyna się od zwykłej rozmowy. Napisz do mnie i zobaczmy, co możemy razem stworzyć.',
			sendEmail: 'Napisz do mnie',
		},
		meta: {
			title: 'Krzysztof Bartosik',
			description:
				'Niezależny twórca cyfrowy, design engineer i deweloper wykuwający wysokowydajne doświadczenia cyfrowe.',
		},
		errorPage: {
			title: 'Nie znaleziono strony',
			description: 'Ta strona nie istnieje. Wróć na ekran startowy.',
			heading: 'Upssss... Looks like we got lost.',
			cta: "Let's go to start screen",
		},
	},
	pa: {
		brand: {
			name: 'Chris Bartosik',
			firstName: 'Chris',
		},
		footer: {
			credit: 'Hecho con pasión por Chris Bartosik',
			rights: '© 2026 All rights reserved',
			sitemap: 'Mapa del sitio',
			viewAll: 'Todos',
		},
		nav: {
			home: 'Inicio',
			skills: 'Habilidades',
			projects: 'Proyectos',
			about: 'Sobre mí',
			openMenu: 'Abrir menú',
			closeMenu: 'Cerrar menú',
			homeAria: 'Chris Bartosik — inicio',
			language: 'Idioma',
			main: 'Principal',
			mobile: 'Móvil',
		},
		cta: {
			workWithMe: 'Hablemos',
		},
		project: {
			client: 'Cliente',
			overview: 'Descripción',
			challenges: 'Retos',
			strategy: 'Estrategia',
			summary: 'Resumen',
			service: 'Servicio',
			industry: 'Industria',
			market: 'Mercado',
			tools: 'Herramientas',
			year: 'Año',
			live: 'Live',
			view: 'ver',
			comingSoon: 'muy pronto',
		},
		skills: {
			pageTitle: 'Habilidades',
			pageDescription:
				'Donde la creatividad y la tecnología se conectan — product UX/UI, motion, IA generativa y desarrollo asistido por IA.',
			headingLine1: 'Donde la creatividad',
			headingLine2: 'y la tecnología se conectan.',
			headingLine3: '',
			tools: 'Herramientas',
			s1Title: 'Diseño de producto y UX/UI',
			s1Intro:
				'Diseño productos escalables alineando las necesidades del usuario con los objetivos de negocio. Desde el discovery hasta la implementación y las pruebas, garantizo consistencia, durabilidad y un rendimiento fluido en cada plataforma.',
			s1F1Title: 'Arquitectura de Design Systems',
			s1F1Body:
				'Creación, escalado y mantenimiento de sistemas de diseño en Figma: tokens, variables y bibliotecas de componentes flexibles.',
			s1F2Title: 'UX basado en datos',
			s1F2Body:
				'Análisis del comportamiento de los usuarios con Clarity y Google Analytics, combinado con tests A/B enfocados en optimizar la conversión.',
			s1F3Title: 'Interfaces multiplataforma',
			s1F3Body:
				'Diseño de soluciones web (mobile-first), aplicaciones móviles nativas e interfaces a medida, como kioscos interactivos.',
			s2Title: 'Motion Design',
			s2Intro:
				'El motion no es decoración, es feedback claro y fluidez en la UX. Diseño animaciones ligeras e interactivas que aportan un acabado moderno y pulido sin comprometer el rendimiento.',
			s2F1Title: 'Rive y State Machines',
			s2F1Body:
				'Creación de animaciones interactivas y lógica de UI basada en estados que responde en tiempo real a las acciones del usuario.',
			s2F2Title: 'Detalles de UI y microinteracciones',
			s2F2Body:
				'Mejora de la interfaz mediante microinteracciones funcionales, transiciones entre estados y feedback visual inmediato.',
			s2F3Title: 'Handoff y especificación para dev',
			s2F3Body:
				'Preparación de assets de referencia listos para producción y archivos Rive para una integración fluida en el front-end.',
			s2F4Title: 'Handoff y especificación para dev',
			s2F4Body:
				'Preparación de assets de referencia listos para producción y archivos Rive para una integración fluida en el front-end.',
			s3Title: 'Automatización con IA',
			s3Intro:
				'Integro agentes de IA directamente en el proceso de diseño. Exploro conceptos visuales, genero assets a medida y creo composiciones avanzadas en horas, no semanas.',
			s3F1Title: 'Producción de assets y conceptos',
			s3F1Body:
				'Uso de IA generativa para explorar ideas rápidamente y crear recursos visuales personalizados en el día a día.',
			s3F2Title: 'Composiciones visuales avanzadas',
			s3F2Body:
				'Creación de gráficas únicas, loops de vídeo y layouts dinámicos para campañas digitales y puntos de contacto de la marca.',
			s3F3Title: 'Ingeniería de prompts y upscaling',
			s3F3Body:
				'Definición precisa de prompts y escalado de capacidades para entregar assets visuales pulidos y listos para publicación.',
			s4Title: 'Desarrollo no-code y IA',
			s4Intro:
				'Conecto el diseño con el código utilizando asistentes de IA y herramientas modernas. Transformo de forma eficiente diseños complejos en productos responsivos y listos para producción.',
			s4F1Title: 'Desarrollo web asistido por IA',
			s4F1Body:
				'Creación, prototipado y despliegue de plataformas web a medida utilizando herramientas como Cursor AI y Claude Code.',
			s4F2Title: 'Webflow y plataformas No-Code',
			s4F2Body:
				'Creación de sitios escalables en Webflow con estructuras de CMS personalizadas, animaciones y código limpio y responsivo.',
			s4F3Title: 'Handoff listo para desarrolladores',
			s4F3Body:
				'Diseño teniendo en cuenta las realidades del código. Variables de Figma estructuradas, design tokens y especificaciones técnicas claras.',
		},
		hero: {
			badgeLocation: 'Panamá',
			badgeAvailability: 'Remoto global',
			roleTitle: '[ Product designer & Creative Engineer ]',
			roleTitleStart: '[ Product designer ',
			roleTitleEnd: '& Creative Engineer ]',
			line1: '',
			line2Lead: 'y experiencias de alto impacto',
			line2Before: 'Diseño productos ',
			line2Glitch: 'digitales',
			line2After: '',
			mLine1: 'Diseño productos',
			mLine2Before: '',
			mLine2Glitch: 'digitales',
			mLine2After: ' y experiencias',
			mLine3Before: 'de alto impacto',
			mLine3Glitch: '',
			mLine3After: '',
			description:
				'Soy Chris Bartosik. Creo productos digitales integrando IA y datos para acelerar eficiencia y resultados.',
			descriptionLine1: 'Soy Chris Bartosik.',
			descriptionLine2: 'Creo productos digitales integrando IA',
			descriptionLine3: 'y datos para acelerar eficiencia y resultados.',
			portraitCaption: '[ ¡Hola! Me llamo Chris\u00a0Bartosik ]',
			pillar1: 'Diseño de producto y UX/UI',
			pillar2: 'Motion Design',
			pillar3: 'Desarrollo no-code y IA',
			pillar4: 'Automatización con IA',
			viewWork: 'Proyectos seleccionados',
			aboutMe: 'Sobre mí',
		},
		work: {
			heading: 'Proyectos y soluciones destacadas',
			line1: 'Proyectos y soluciones',
			line2: 'destacadas',
			description:
				'Creo soluciones digitales que responden a desafíos reales de negocio, llevando ideas desde sus conceptos hasta integraciones complejas con agentes de IA.',
			seeAll: 'Ver todos los proyectos',
			pageTitle: 'Proyectos y soluciones destacadas',
			pageDescription: 'Proyectos seleccionados de Chris Bartosik.',
			filterAll: 'Todos los proyectos',
			filterUxUi: 'UX/UI',
			filterMotion: 'Motion',
			filterAi: 'AI Design',
			filterDev: 'Development',
			filterBranding: 'Branding',
			filterPhotoaid: 'PhotoAiD',
		},
		clients: {
			line1: 'Marcas con los',
			line2: 'que he colaborado',
			description:
				'Durante más de 5 años he diseñado interfaces escalables y productos digitales para empresas en cualquier etapa, desde startups hasta corporaciones.',
		},
		tools: {
			heading: 'Stack tecnológico y herramientas',
			line1: 'Stack tecnológico',
			line2: 'y herramientas',
		},
		testimonials: {
			line1: 'Voces de quienes',
			line2: 'confiaron en mí',
			description:
				'Un desarrollo fluido y una buena comunicación se notan incluso después del despliegue. Lee las impresiones reales de los equipos con los que he compartido proyecto.',
			quote1:
				'I am more than pleased with the result. Our website has gone from being merely informative to becoming a true representation of who we are as a company.',
			quote2:
				"The way Chris built our new Webflow site moved See More to finally show our clients a professional side we're actually proud of.",
			quote3:
				'Thank you again, I really like how elegant it looks but also showing a youth image as I asked you!',
			quote4:
				'The fresh look and energy Chris provided allowed us to show the world what MexiMunchies is all about.',
			quote5:
				'A total transformation. Chris provided the strategic branding we needed to stand out on market and connect with our audience.',
			role1: 'CEO de NRV',
			role2: 'CEO de See More Logistics',
			role3: 'Propietaria de TRG',
			role4: 'Fundadora de Mexi Munchies',
			role5: 'Fundador de Snacks Lovers PTY',
		},
		about: {
			eyebrow: 'Mi historia',
			intro:
				'Soy un creador digital independiente que convirtió una obsesión por el oficio en una práctica dedicada a la calidad. Combino design engineering y desarrollo para construir productos digitales que duran.',
			kickerBefore: '[Más allá',
			kickerAfter: 'del píxel]',
			heading: 'Creo productos digitales donde la precisión técnica se une a la creatividad.',
			body1:
				'Llevo más de cinco años impulsando productos en el punto donde se cruzan el diseño UX/UI, la animación y el código. Me especializo en transformar necesidades complejas de negocio en sistemas de diseño escalables, interfaces intuitivas y marcas con identidad propia.',
			body2:
				'En mi día a día optimizo el trabajo apoyándome en automatizaciones con agentes de IA. Esto me permite desplegar productos digitales de alta madurez visual y técnica, garantizando un acabado impecable en cada entrega.',
			readMore: 'Descubre mi historia',
			pageTitle: 'Sobre mí',
			pageDescription:
				'Chris Bartosik — creador digital independiente, design engineer y desarrollador.',
		},
		aboutPage: {
			role: '[Product designer y AI design specialist]',
			heading:
				'Combino UX/UI, motion design y agentes de IA para crear productos digitales listos para producción.',
			intro:
				'Durante los últimos 5 años en PhotoAiD diseñé experiencias de producto de principio a fin: desde aplicaciones web y móviles hasta kioscos físicos. Creé Design Systems, analicé el comportamiento de los usuarios y optimicé la conversión mediante pruebas A/B.',
			timelineHeading: '[Mi trayectoria]',
			job1Date: '[2021]',
			job1Title: 'Diseñador UX/UI junior',
			job1Body:
				'NeuroN es una startup edtech europea orientada al público joven. Estuve a cargo del ciclo completo de diseño, abarcando investigación inicial, creación de wireframes, pruebas de usuario y el handoff final al equipo de desarrollo. Diseñar interfaces accesibles y claras me ayudó a consolidar procesos de trabajo estructurados y buenas prácticas en equipo.',
			job2Date: '[2022-2026]',
			job2Title: 'Diseñador de producto / Motion e IA',
			job2Body:
				'Durante 5 años en PhotoAiD escalé un ecosistema global de productos digitales y físicos. Mi trabajo abarcó desde aplicaciones web y móviles nativas hasta interfaces para kioscos y sistemas de diseño.',
			job2Item1: 'Creación y gestión de un Design System multiplataforma y escalable en Figma.',
			job2Item2: 'Diseño de aplicaciones web mobile first, pantallas móviles nativas e interfaces para kioscos físicos.',
			job2Item3: 'Análisis del comportamiento de usuarios con Clarity y Google Analytics para validar iteraciones mediante pruebas A/B.',
			job2Item4: 'Integración de animaciones ligeras en Rive para mejorar la interacción y la fluidez de la interfaz.',
			job2Item5: 'Definición de arquitecturas de tokens y especificaciones técnicas claras para el equipo de desarrollo.',
			seeMore: 'Ver más',
			job3Date: '[2021 — presente]',
			job3Title: 'Diseñador de marca y web independiente',
			job3Body:
				'En paralelo a mis roles principales, diseño marcas y plataformas digitales para clientes externos. Creo identidades visuales coherentes y sitios web modernos para el sector público, logística, bienes raíces y startups tecnológicas.',
			exploreWork: 'Ver los proyectos',
			close1:
				'Las herramientas de diseño evolucionan rápido, y adelantarme a la curva es mi mindset. Combino microanimaciones Rive con flujos de IA (Midjourney, Kling, Magnific) y herramientas modernas como Cursor AI y Webflow para construir y desplegar plataformas web listas para producción en cuestión de días.',
			close2:
				'Diseño con las restricciones de ingeniería en mente. Los developers valoran mis handoffs por variables de Figma estructuradas, tokens limpios y specs de motion claros. Actualmente en Panamá (EST), alineado con el horario US East Coast y con overlap en las tardes europeas. Inglés fluido, polaco nativo y español B2.',
			meeting: 'Agendemos una reunión',
		},
		contact: {
			heading: 'Impulsemos tu próximo paso digital',
			line1: 'Impulsemos tu',
			line2: 'próximo paso digital',
			description:
				'Toda gran alianza comienza con un primer contacto. Cuéntame sobre tus necesidades, tu equipo o tus objetivos actuales y valoremos formas de colaborar.',
			sendEmail: 'Enviar un mensaje',
		},
		meta: {
			title: 'Chris Bartosik',
			description:
				'Creador digital independiente, design engineer y desarrollador forjando experiencias digitales de alto rendimiento.',
		},
		errorPage: {
			title: 'Página no encontrada',
			description: 'Esta página no existe. Vuelve a la pantalla de inicio.',
			heading: 'Upssss... Looks like we got lost.',
			cta: "Let's go to start screen",
		},
	},
} as const;

type Dictionary = (typeof dictionary)[Locale];

export function isLocale(value: unknown): value is Locale {
	return value === 'en' || value === 'pl' || value === 'pa';
}

export function getLocale(): Locale {
	if (typeof window === 'undefined') return DEFAULT_LOCALE;

	try {
		const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
		if (isLocale(stored)) return stored;
	} catch {
		return DEFAULT_LOCALE;
	}

	return DEFAULT_LOCALE;
}

export function setLocale(locale: Locale) {
	window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
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
