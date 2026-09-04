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
			testimonial: 'Client review',
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
				'I design functional interfaces and complete digital experiences. I connect business requirements with aesthetic precision, delivering solutions crafted thoughtfully from strategy through execution.',
			s1F1Title: 'Research & Strategy',
			s1F1Body:
				'In the beginning was the... insight. As a digital product designer, I always start with a deep understanding of the problem space. Gathering business requirements, analyzing user behavior, and setting clear objectives are foundational steps I have refined over five years in the industry.',
			s1F2Title: 'ARCHITECTURE & WIREFRAMING',
			s1F2Body:
				'A pretty interface by itself does not drive product adoption. Functionality and delivered value do. That is why before reaching Pixel Perfect UI, I begin with quick sketches, user journey mapping, and Low-Fi wireframes to address the core challenges users face.',
			s1F3Title: 'HIGH-FIDELITY INTERFACES',
			s1F3Body:
				'My UI designs combine a distinct sense of style with brand alignment, while maintaining absolute structural logic. While I focus on detail and striking visual presentation, I consistently integrate standards like accessibility (WCAG) and cohesive visual strategy.',
			s1F4Title: 'DESIGN SYSTEMS & DEV-CENTERED HANDOFF',
			s1F4Body:
				'Creating an attractive mockup in Figma is only half the battle. The real skill lies in delivering a solution engineered for fast and straightforward implementation. Having worked with various Design System architectures, I build systems that are transparent, consistent, and development-oriented.',
			s1F5Title: 'EVALUATION & OPTIMIZATION',
			s1F5Body:
				'Every solution can be refined further, and every flow can be higher-converting. A/B testing, user behavior observation, and heatmap analysis allow me to validate hypotheses and uncover new growth opportunities. I measure the success of a design by its direct impact on the product.',
			s2Title: 'Motion Design',
			s2Intro: 
				'Over the years I have learned that every detail matters in design. I create motion and interactions that make digital products feel alive, responsive, and engaging.',
			s2F1Title: 'Micro-interactions & UX Polish',
			s2F1Body: 
				'I design every UI element with user interaction in mind. From subtle button states defined directly for code implementation to complex interactive components built in Rive. My time at PhotoAid gave me the space to explore creative solutions. I map out the strategy, design the assets, and handle handoff and testing myself. I view microinteractions as building a journey step by step. A solid flow is the baseline, but refined microinteractions deliver instant visual feedback that makes an interface feel truly tactile.',
			s2F2Title: 'Advanced Animations & Macro Motion',
			s2F2Body: 
				'Beyond microinteractions, I design motion graphics that cover the whole screen and become an integral part of the visual experience. My work ranges from stepped sliders for big or custom displays to interactive mobile onboarding flows. These complex animations are not decorative because they act as essential components of the user flow that help products stand out.',
			s2F3Title: 'Generative AI & Video Edition',
			s2F3Body: 
				'I integrate generative AI video workflows directly into my creative process to accelerate production and elevate output quality. I produce concise tutorial videos featuring realistic AI avatars that instruct users on actions like proper photo setup, giving them the feeling of interacting with a real expert. I also create hobby historical short films using models like Midjourney, Kling, Seedance, and Magnific AI, bringing static artwork to life through motion.',			s2F4Title: 'Handoff & Dev Specs',
			s3Title: 'Development, No-Code & AI',
			s3Intro: 
				'Evolving technologies and market shifts create new opportunities for professionals who previously only understood code. Today those same professionals can build and deploy working products independently.',
			s3F1Title: 'AI Assisted Development',
			s3F1Body: 
				'Using tools like Claude, Cursor, and VS Code, I build digital products directly within production environments. I create functional solutions ranging from early test prototypes to complete production deployments, bridging the gap between design and real code.',
			s3F2Title: 'No-Code & Web Platforms',
			s3F2Body: 
				'Working on diverse projects required me to bring UX and UI designs to life independently without relying on developers. I learned to build web applications using No-Code platforms such as Webflow and Framer. I deliver scalable, well animated websites with strong SEO optimization that perform exceptionally in the browser.',			s4Title: 'No-code & AI Development',
		},
		hero: {
			badgeLocation: 'Panama',
			badgeAvailability: 'Global remotely',
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
			pillar1: 'Product & UX/UI Design',
			pillar2: 'Motion Design',
			pillar3: 'No-code & AI Development',
			pillar4: 'AI Agents & Automation',
			viewWork: 'Selected projects',
			aboutMe: 'About me',
			specialization:
				'I design UX/UI, brands, and animations, while delivering functional products through no-code and AI.',
		},
		work: {
			heading: 'Selected projects & collaborations',
			line1: 'Selected projects',
			line2: '& collaborations',
			description:
				'I build digital products designed to drive business growth. End-to-end execution, powered by AI workflows.',
			seeAll: 'See all projects',
			pageTitle: 'Selected projects & collaborations',
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
			line1: "Clients' feedbacks",
			line2: 'and impressions',
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
			role1: 'CEO of NRV',
			role2: 'CEO of See More Logistics',
			role3: 'Owner of TRG',
			role4: 'Developer',
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
	},
	pl: {
		brand: {
			name: 'Chris Bartosik',
			firstName: 'Chris',
		},
		footer: {
			credit: 'Stworzone z pasją przez Chrisa Bartosika',
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
			homeAria: 'Chris Bartosik — strona główna',
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
			testimonial: 'Opinia klienta',
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
				'Projektuję funkcjonalne interfejsy i kompleksowe doświadczenia cyfrowe. Łączę potrzeby biznesowe z wyczuciem estetyki, dostarczając rozwiązania przemyślane od strategii po wdrożenie.',
			s1F1Title: 'RESEARCH & STRATEGIA',
			s1F1Body:
				'Na początku była... informacja. Jako projektant produktów cyfrowych zawsze zaczynam od dokładnego zrozumienia przypadku. Zbieranie wymagań biznesowych, analiza zachowań użytkowników i wyznaczanie jasnych celów to fundamenty, które szlifuję od ponad 5 lat pracy w zawodzie.',
			s1F2Title: 'ARCHITEKTURA & WIREFRAMING',
			s1F2Body:
				'To nie kolory i ładne kroje pism sprawiają, że użytkownicy korzystają z produktów. Decyduje funkcjonalność i wnoszona wartość. Dlatego zanim powstanie Pixel Perfect UI, zaczynam od szkiców, mapowania ścieżek użytkownika i makiet Low-Fi, aby jak najlepiej odpowiedzieć na podstawowe problemy i wyzwania stojące przed użytkownikami.',
			s1F3Title: 'HIGH-FIDELITY INTERFACES',
			s1F3Body:
				'Moje projekty UI wyróżniają się silnym wyczuciem stylu i spójnością z wytycznymi marki, zachowując przy tym pełną logikę wykonania. Mimo że dbam o dbałość o detale i atrakcyjny odbiór produktów, zawsze uwzględniam standardy, takie jak dostępność (WCAG) oraz spójną strategię wizualną.',
			s1F4Title: 'DESIGN SYSTEMS & DEV-CENTERED HANDOFF',
			s1F4Body:
				'Zrobienie ładnego widoku w Figmie to nie sztuka. Sztuką dla doświadczonego projektanta jest dostarczenie rozwiązania gotowego do szybkiego i prostego wdrożenia. Pracowałem z wieloma typami Design Systemów i wiem, że muszą być przejrzyste, spójne oraz budowane z myślą o wdrożeniach.',
			s1F5Title: 'EWALUACJA & OPTYMALIZACJA',
			s1F5Body:
				'Każde rozwiązanie może być jeszcze lepsze. Testy A/B, obserwacja zachowań użytkowników i analiza heatmap pozwalają nie tylko weryfikować hipotezy, ale też odkrywać nowe kierunki rozwoju. Wartość projektu mierzę jego realnym wpływem na produkt.',
			s2Title: 'Motion Design',
			s2Intro: 
				'Na przestrzeni lat nauczyłem się, że w projektowaniu każdy detal ma znaczenie. Tworzę ruch i interakcje, które sprawiają, że produkt staje się żywy, przewidywalny i angażujący dla użytkownika.',
			s2F1Title: 'Mikrointerakcje & UX Polish',
			s2F1Body: 
				'Myślę o każdym elemencie w kontekście jego interakcji z użytkownikiem. Od prostych reakcji przycisków kodowanych bezpośrednio w UI, po złożone stany i animacje projektowane w Rive. Praca w PhotoAid dała mi przestrzeń do wdrażania kreatywnych rozwiązań. Samodzielnie projektuję strategię, plan i wykonanie mikroanimacji, a potem odpowiadam za ich wdrożenie i testy. Traktuję te detale jak budowanie ścieżki kamyczek po kamyczku. Dobre flow to podstawa, ale to właśnie dopracowane mikrointerakcje dają użytkownikowi natychmiastowy feedback i poczucie, że interfejs reaguje na każdy jego gest.',
			s2F2Title: 'Zaawansowane Animacje & Macro Motion',
			s2F2Body: 
				'Tworzę też złożone animacje na pełny ekran, które stają się nieodłączną częścią całego procesu wizualnego. Projektowałem zarówno skokowe slidery na duże i niestandardowe ekrany, jak i interaktywne onboardingi na urządzenia mobilne. Tego typu rozwiązania to nie dekoracja, ale pełnoprawny element flow, który buduje doświadczenie i pozwala produktowi wyróżnić się na rynku.',
			s2F3Title: 'Generative AI & Video Edition',
			s2F3Body: 
				'Wraz z rozwojem technologii zacząłem wdrażać w moich procesach kreatywnych narzędzia AI, co znacznie przyspieszyło projektowanie. Tworzę krótkie wideo instruktażowe z realistycznymi postaciami wygenerowanymi przez AI, które pokazują użytkownikowi na przykład jak poprawnie zrobić zdjęcie. Dzięki temu użytkownik ma poczucie kontaktu z żywym ekspertem po drugiej stronie ekranu. Tworzę też hobbistyczne krótkometrażowe filmy historyczne przy użyciu modeli takich jak Midjourney, Kling, Seedance czy Magnific AI, wprawiając statyczne grafiki w ruch i nadając im zupełnie nowy wymiar.',
			s3Title: 'Development, No-Code & AI',
			s3Intro: 
				'Dynamicznie zmieniające się technologie i rynek otwierają nowe ścieżki dla osób, które dotychczas głównie rozumiały kod. Dziś te same osoby mogą samodzielnie budować i wdrażać działające produkty.',
			s3F1Title: 'AI-Assisted Development',
			s3F1Body: 
				'Dzięki wykorzystaniu nowoczesnych narzędzi takich jak Claude, Cursor czy VS Code tworzę rozwiązania bezpośrednio w realnym środowisku programistycznym. Buduję kompletne projekty od etapu testowych prototypów po pełne wdrożenia produkcyjne, płynnie łącząc projektowanie interfejsów z ich fizyczną realizacją w kodzie.',
			s3F2Title: 'No-Code & Web Platforms',
			s3F2Body: 
				'Praca przy wielu zróżnicowanych projektach wymagała ode mnie niezależności i umiejętności powoływania projektów UX/UI do życia bez stałego wsparcia deweloperów. Opanowałem tworzenie serwisów w narzędziach No-Code, głównie Webflow oraz Framer. Dostarczam dojrzałe, w pełni dopracowane strony, które są dobrze skalowalne, płynnie animowane, zoptymalizowane pod kątem SEO i skutecznie wyróżniają się w sieci.',			s4Title: 'Wdrożenia AI i no-code',
		},
		hero: {
			badgeLocation: 'Panama',
			badgeAvailability: 'Globalnie zdalnie',
			greeting: 'Hej',
			introBefore: 'Jestem',
			introAfter: 'Chris',
			roleWord1: 'Digital',
			roleWord2: 'product',
			roleWord3: 'designer',
			roleTitle: '[ Digital product designer ]',
			roleTitleStart: '[ Digital product designer ',
			roleTitleEnd: ']',
			line1: 'Tworzę skuteczne',
			line2Lead: '',
			line2Before: 'rozwiązania ',
			line2Glitch: 'cyfrowe',
			line2After: '',
			mLine1: 'Tworzę skuteczne',
			mLine2Before: 'rozwiązania ',
			mLine2Glitch: 'cyfrowe',
			mLine2After: '',
			mLine3Before: '',
			mLine3Glitch: '',
			mLine3After: '',
			description:
				'Nazywam się Chris Bartosik. Łączę dane i agentów AI, tworząc niezawodne produkty cyfrowe.',
			descriptionLine1: 'Nazywam się Chris Bartosik.',
			descriptionLine2: 'Łączę dane i agentów AI, tworząc',
			descriptionLine3: 'niezawodne produkty cyfrowe.',
			portraitCaption: '[ Cześć! Nazywam się Chris\u00a0Bartosik ]',
			pillar1: 'Product & UX/UI Design',
			pillar2: 'Motion Design',
			pillar3: 'Wdrożenia AI i no-code',
			pillar4: 'Automatyzacje z agentami AI',
			viewWork: 'Wybrane projekty',
			aboutMe: 'O mnie',
			specialization:
				'Projektuję UX/UI, marki i animacje, oraz wdrażam gotowe produkty za pomocą no-code i AI.',
		},
		work: {
			heading: 'Wybrane projekty i realizacje',
			line1: 'Wybrane projekty',
			line2: 'i realizacje',
			description:
				'Tworzę produkty, które rozwiązują realne problemy biznesowe. Od koncepcji po wdrożenia wspierane przez agentów AI.',
			seeAll: 'Zobacz wszystkie projekty',
			pageTitle: 'Wybrane projekty i realizacje',
			pageDescription: 'Wybrane projekty Chrisa Bartosika.',
			filterAll: 'Wszystkie projekty',
			filterUxUi: 'UX/UI',
			filterMotion: 'Motion',
			filterAi: 'AI Design',
			filterDev: 'Development',
			filterBranding: 'Branding',
			filterPhotoaid: 'PhotoAiD',
		},
		clients: {
			line1: 'Marki i produkty, z którymi',
			line2: 'współpracowałem',
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
				"The way Chris built our new Webflow site moved See More to finally show our clients a professional side we're actually proud of.",
			quote3:
				'Thank you again, I really like how elegant it looks but also showing a youth image as I asked you!',
			quote4:
				'I had the pleasure of working with Chris across multiple projects, and he consistently stands out for his work ethic, professionalism, and user-first mindset. He has exceptional attention to detail and a real talent for crafting slick micro-animations that elevate the user experience. Beyond his strong UX/UI skills, Chris is deeply proactive, always experimenting with new tools and techniques. The fact that he can also build fully functional web applications makes him a uniquely versatile team member. Any team would be lucky to have him.',
			role1: 'CEO NRV',
			role2: 'CEO See More Logistics',
			role3: 'CEO TRG',
			role4: 'Developer',
		},
		about: {
			eyebrow: 'Moja historia',
			intro:
				'Jestem niezależnym twórcą cyfrowym, który zamienił obsesję na punkcie rzemiosła w praktykę oddaną jakości. Łączę design engineering z developmentem, by budować produkty cyfrowe, które trwają.',
			kickerBefore: '[Poza',
			kickerAfter: 'pikselami]',
			heading: 'Tworzę produkty cyfrowe, w których precyzja łączy się z kreatywnością.',
			body1: 'Od ponad pięciu lat projektuję na styku UX/UI, motion designu i kodu.',
			body2:
				'Tworzę kompleksowe design systemy, interfejsy oraz nowoczesne marki, przekształcając skomplikowane potrzeby biznesowe w proste i intuicyjne rozwiązania.',
			body3:
				'W codziennej pracy wykorzystuję automatyzacje z udziałem agentów AI. Pozwala mi to dowozić dojrzałe, dopracowane interfejsy znacznie szybciej i bez jakichkolwiek kompromisów jakościowych.',
			readMore: 'Przeczytaj całą historię',
			pageTitle: 'O mnie',
			pageDescription:
				'Chris Bartosik — niezależny twórca cyfrowy, design engineer i deweloper.',
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
			title: 'Chris Bartosik',
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
			testimonial: 'Opinión del cliente',
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
				'Diseño interfaces funcionales y experiencias digitales completas. Conecto las necesidades del negocio con una cuidada precisión estética, entregando soluciones meditadas desde la estrategia hasta su implementación.',
			s1F1Title: 'Research y Estrategia',
			s1F1Body: 
				'En el principio fue la información. Como diseñador de productos digitales, siempre empiezo comprendiendo a fondo cada caso. La recopilación de requerimientos de negocio, el análisis del comportamiento de los usuarios y la definición de objetivos claros son pilares que he perfeccionado a lo largo de más de cinco años de trayectoria.',
			s1F2Title: 'Arquitectura y Wireframing',
			s1F2Body: 
				'Los colores y las tipografías atractivas no son lo que hace que la gente use un producto. Lo que decide su éxito es la funcionalidad y el valor que aporta. Por eso, antes de llegar al UI Pixel Perfect, comienzo con bocetos, mapas de recorrido de usuario y esquemas Low-Fi para responder a los retos principales a los que se enfrentan los usuarios.',
			s1F3Title: 'Interfaces High-Fidelity',
			s1F3Body: 
				'Mis diseños de UI destacan por un marcado sentido del estilo y coherencia con la identidad de marca, manteniendo una lógica de ejecución impecable. Aunque cuido al máximo el detalle y la estética, garantizo siempre estándares clave como la accesibilidad (WCAG) y una estrategia visual sólida.',
			s1F4Title: 'Design Systems y Dev-Centered Handoff',
			s1F4Body: 
				'Crear una pantalla vistosa en Figma no es un logro completo. La verdadera capacidad de un diseñador radica en entregar una solución lista para una implementación rápida y sencilla. He trabajado con diversos tipos de Design Systems y sé que deben ser claros, coherentes y construidos pensando en los desarrolladores.',
			s1F5Title: 'Evaluación y Optimización',
			s1F5Body: 
				'Cualquier solución puede mejorar. Los test A/B, la observación del usuario y el análisis de mapas de calor me permiten no solo validar hipótesis, sino también descubrir nuevas oportunidades de desarrollo. Mido el valor de un proyecto por su impacto real en el producto.',
			s2Title: 'Motion Design',
			s2Intro: 
				'A lo largo de los años he aprendido que cada detalle importa en el diseño. Creo movimiento e interacciones que hacen que los productos digitales cobren vida y sean intuitivos.',
			s2F1Title: 'Microinteracciones',
			s2F1Body: 
				'Diseño cada elemento pensando en su interacción con el usuario. Desde estados simples en botones definidos para código hasta animaciones complejas desarrolladas en Rive. Mi etapa en PhotoAid me permitió implementar soluciones altamente creativas. Diseño la estrategia, ejecuto las animaciones y superviso las pruebas tras el despliegue. Considero estas microinteracciones como construir un proceso piedra a piedra. Un flujo básico debe ser funcional, pero las microinteracciones cuidadas aportan un feedback inmediato que hace sentir la interfaz real.',
			s2F2Title: 'Animaciones Avanzadas y Macro Motion',
			s2F2Body: 
				'Diseño animaciones complejas a gran escala que forman parte activa del flujo visual principal. He desarrollado desde sliders a pantalla completa para monitores grandes y formatos no estándar, hasta procesos de bienvenida móviles e interactivos. Este tipo de movimiento no es simple decoración, sino una parte fundamental del producto que aporta una clara diferenciación en el mercado.',
			s2F3Title: 'Generative AI y Edición de Video',
			s2F3Body: 
				'Incorporo herramientas de inteligencia artificial en mis procesos creativos para acelerar la producción y mejorar la experiencia final. Genero videos tutoriales breves con avatares fotorrealistas creados con IA que explican procesos complejos, como la toma correcta de fotos, ofreciendo una sensación de acompañamiento profesional. Además, creo cortometrajes históricos personales utilizando modelos como Midjourney, Kling, Seedance y Magnific AI, dando movimiento a imágenes estáticas.',
			s3Title: 'Desarrollo, No-Code y IA',
			s3Intro: 
				'La rápida evolución de la tecnología abre nuevos caminos para quienes antes solo entendían el código. Hoy en día es posible crear y desplegar productos funcionales de manera directa e independiente.',
			s3F1Title: 'Desarrollo asistido por IA',
			s3F1Body: 
				'Mediante el uso de herramientas como Claude, Cursor y VS Code, creo soluciones directamente en entornos de desarrollo reales. Desarrollo proyectos completos, desde prototipos de prueba hasta despliegues finales en producción, conectando el diseño con la ejecución técnica.',
			s3F2Title: 'No-Code y Plataformas Web',
			s3F2Body: 
				'Mi trabajo en diversos proyectos me exigió la capacidad de dar vida a los diseños de UX y UI sin depender de un desarrollador. Aprendí a construir sitios web utilizando herramientas No-Code como Webflow y Framer. Entrego páginas escalables, con animaciones fluidas, optimización SEO sólida y una gran presencia en el navegador.',				'Definición precisa de prompts y escalado de capacidades para entregar assets visuales pulidos y listos para publicación.',
		},
		hero: {
			badgeLocation: 'Panamá',
			badgeAvailability: 'Remoto global',
			greeting: 'Hola',
			introBefore: 'Soy',
			introAfter: 'Chris',
			roleWord1: 'Digital',
			roleWord2: 'product',
			roleWord3: 'designer',
			roleTitle: '[ Digital product designer ]',
			roleTitleStart: '[ Digital product designer ',
			roleTitleEnd: ']',
			line1: 'Diseño soluciones',
			line2Lead: '',
			line2Before: '',
			line2Glitch: 'digitales',
			line2After: ' efectivas',
			mLine1: 'Diseño soluciones',
			mLine2Before: '',
			mLine2Glitch: 'digitales',
			mLine2After: ' efectivas',
			mLine3Before: '',
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
			specialization:
				'Diseño UX/UI, marcas y animaciones, implementando productos funcionales con herramientas de no-code e IA.',
		},
		work: {
			heading: 'Proyectos seleccionados y colaboraciones',
			line1: 'Proyectos seleccionados',
			line2: 'y colaboraciones',
			description:
				'Creo soluciones digitales que responden a desafíos reales de negocio, llevando ideas desde sus conceptos hasta integraciones complejas con agentes de IA.',
			seeAll: 'Ver todos los proyectos',
			pageTitle: 'Proyectos seleccionados y colaboraciones',
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
				'I had the pleasure of working with Chris across multiple projects, and he consistently stands out for his work ethic, professionalism, and user-first mindset. He has exceptional attention to detail and a real talent for crafting slick micro-animations that elevate the user experience. Beyond his strong UX/UI skills, Chris is deeply proactive, always experimenting with new tools and techniques. The fact that he can also build fully functional web applications makes him a uniquely versatile team member. Any team would be lucky to have him.',
			role1: 'CEO de NRV',
			role2: 'CEO de See More Logistics',
			role3: 'Propietaria de TRG',
			role4: 'Developer',
		},
		about: {
			eyebrow: 'Mi historia',
			intro:
				'Soy un creador digital independiente que convirtió una obsesión por el oficio en una práctica dedicada a la calidad. Combino design engineering y desarrollo para construir productos digitales que duran.',
			kickerBefore: '[Más allá',
			kickerAfter: 'del píxel]',
			heading: 'Creo productos digitales donde la precisión se une a la creatividad.',
			body1: 'Durante más de cinco años he diseñado en la intersección entre UX/UI, motion design y código.',
			body2:
				'Desarrollo sistemas de diseño integrales, interfaces y marcas modernas, transformando necesidades de negocio complejas en soluciones simples e intuitivas.',
			body3:
				'En mi día a día me apoyo en automatizaciones con agentes de IA. Esto me permite entregar proyectos maduros y de alta calidad en tiempos reducidos, manteniendo siempre el mejor nivel.',
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
