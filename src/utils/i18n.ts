export const LOCALES = ['en', 'pl', 'pa'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'portfolio-locale';

export const localeMeta: Record<Locale, { label: string; htmlLang: string }> = {
	en: { label: 'EN', htmlLang: 'en' },
	pl: { label: 'PL', htmlLang: 'pl' },
	pa: { label: 'PA', htmlLang: 'es' },
};

export const dictionary = {
	en: {
		brand: {
			name: 'Chris Bartosik',
		},
		nav: {
			projects: 'Projects',
			about: 'About me',
			openMenu: 'Open menu',
			closeMenu: 'Close menu',
			homeAria: 'Chris Bartosik — home',
		},
		cta: {
			workWithMe: 'Work with me',
		},
		hero: {
			eyebrow: 'Chris Bartosik',
			line1: 'Forging',
			line2: 'high-performance',
			line3: 'digital experiences',
			description:
				'Independent digital creator, design engineer, and developer. I bridge the gap between complex code and high-end visual design to build fast, bespoke web experiences for global brands.',
		},
		work: {
			heading: 'My work',
			description:
				'Explore my latest work transforming complex visions into seamless digital experiences. Proven solutions, built to lead and engineered to endure.',
			seeAll: 'See all projects',
			pageTitle: 'My Work',
			pageDescription: 'Selected projects by Chris Bartosik.',
		},
		clients: {
			line1: 'Those who stand',
			line2: 'with me',
			description:
				'From local innovators to global visionaries, I have helped plenty of brands find their edge and own their space in the digital landscape.',
		},
		about: {
			eyebrow: 'My story',
			intro:
				'I am an independent digital creator who turned a craft obsession into a practice dedicated to quality. I combine design engineering and development to build digital products that last.',
			heading:
				'I believe that a great brand is built on two things – a clear vision and a solid foundation.',
			body1:
				'I create digital spaces that tell your story. With years of experience, I have worked with brands from Poland to LatAm, helping them stand out.',
			body2:
				'My work is a mix of two worlds. I look at the human side of your business to understand your goals, and then I use high-end technology to make them real. Your project stays consistent from the first sketch to the final line of code. I am here to help you grow and leave a mark on the digital world.',
			readMore: 'Read more about me',
			pageTitle: 'About me',
			pageDescription:
				'Chris Bartosik — independent digital creator, design engineer, and developer.',
		},
		aboutPage: {
			line1: 'Design engineer',
			line2: 'and developer',
			introHeading:
				'I build digital products at the intersection of complex code and high-end visual design.',
			introBody1:
				'I work independently, moving fast, eliminating friction, and staying completely consistent. I focus on transforming businesses through strategic branding, user-centric UI/UX design, and premium development.',
			introBody2:
				'I do not believe in one-size-fits-all services. Instead, I partner with you to craft custom digital tools, scalable platforms, and brand identities that mean something to your audience and bring measurable value to your business.',
		},
		contact: {
			heading: 'Start your legacy',
			description:
				"Every great brand begins with a single conversation. Whether you're building from the ground up or redefining your edge, let's create something that lasts.",
			sendEmail: 'Send me e-mail',
		},
		meta: {
			title: 'Chris Bartosik',
			description:
				'Independent digital creator, design engineer, and developer forging high-performance digital experiences.',
		},
	},
	pl: {
		brand: {
			name: 'Chris Bartosik',
		},
		nav: {
			projects: 'Projekty',
			about: 'O mnie',
			openMenu: 'Otwórz menu',
			closeMenu: 'Zamknij menu',
			homeAria: 'Chris Bartosik — strona główna',
		},
		cta: {
			workWithMe: 'Współpracuj ze mną',
		},
		hero: {
			eyebrow: 'Chris Bartosik',
			line1: 'Wykuwam',
			line2: 'wysokowydajne',
			line3: 'doświadczenia cyfrowe',
			description:
				'Niezależny twórca cyfrowy, design engineer i deweloper. Łączę złożony kod z projektowaniem najwyższej klasy, by budować szybkie, szyte na miarę doświadczenia webowe dla globalnych marek.',
		},
		work: {
			heading: 'Moje prace',
			description:
				'Zobacz moje najnowsze realizacje — złożone wizje zamienione w spójne doświadczenia cyfrowe. Sprawdzone rozwiązania, zaprojektowane by prowadzić i zbudowane by trwać.',
			seeAll: 'Zobacz wszystkie projekty',
			pageTitle: 'Moje prace',
			pageDescription: 'Wybrane projekty Chrisa Bartosika.',
		},
		clients: {
			line1: 'Ci, którzy stoją',
			line2: 'przy mnie',
			description:
				'Od lokalnych innowatorów po globalnych wizjonerów — pomagam markom znaleźć przewagę i zająć własne miejsce w cyfrowym krajobrazie.',
		},
		about: {
			eyebrow: 'Moja historia',
			intro:
				'Jestem niezależnym twórcą cyfrowym, który zamienił obsesję na punkcie rzemiosła w praktykę oddaną jakości. Łączę design engineering z developmentem, by budować produkty cyfrowe, które trwają.',
			heading:
				'Wierzę, że wielka marka opiera się na dwóch rzeczach – jasnej wizji i solidnym fundamencie.',
			body1:
				'Tworzę cyfrowe przestrzenie, które opowiadają Twoją historię. Przez lata pracowałem z markami od Polski po LatAm, pomagając im się wyróżnić.',
			body2:
				'Moja praca to połączenie dwóch światów. Patrzę na ludzką stronę Twojego biznesu, by zrozumieć cele, a potem używam technologii najwyższej klasy, by je zrealizować. Projekt pozostaje spójny od pierwszego szkicu po ostatnią linię kodu. Jestem tu, by pomóc Ci rosnąć i zostawić ślad w cyfrowym świecie.',
			readMore: 'Więcej o mnie',
			pageTitle: 'O mnie',
			pageDescription:
				'Chris Bartosik — niezależny twórca cyfrowy, design engineer i deweloper.',
		},
		aboutPage: {
			line1: 'Design engineer',
			line2: 'i deweloper',
			introHeading:
				'Buduję produkty cyfrowe na styku złożonego kodu i projektowania najwyższej klasy.',
			introBody1:
				'Pracuję niezależnie, szybko, bez tarcia i w pełnej spójności. Skupiam się na transformacji biznesów przez strategiczny branding, projektowanie UI/UX i premium development.',
			introBody2:
				'Nie wierzę w usługi „jeden rozmiar dla wszystkich”. Zamiast tego partneruję z Tobą, by tworzyć szyte na miarę narzędzia cyfrowe, skalowalne platformy i tożsamości marek, które coś znaczą dla odbiorców i wnoszą mierzalną wartość do biznesu.',
		},
		contact: {
			heading: 'Zacznij swoją spuściznę',
			description:
				'Każda wielka marka zaczyna się od jednej rozmowy. Niezależnie czy budujesz od zera, czy redefiniujesz swoją przewagę — stwórzmy coś, co przetrwa.',
			sendEmail: 'Napisz do mnie',
		},
		meta: {
			title: 'Chris Bartosik',
			description:
				'Niezależny twórca cyfrowy, design engineer i deweloper wykuwający wysokowydajne doświadczenia cyfrowe.',
		},
	},
	pa: {
		brand: {
			name: 'Chris Bartosik',
		},
		nav: {
			projects: 'Proyectos',
			about: 'Sobre mí',
			openMenu: 'Abrir menú',
			closeMenu: 'Cerrar menú',
			homeAria: 'Chris Bartosik — inicio',
		},
		cta: {
			workWithMe: 'Trabaja conmigo',
		},
		hero: {
			eyebrow: 'Chris Bartosik',
			line1: 'Forjando',
			line2: 'alto rendimiento',
			line3: 'digital',
			description:
				'Creador digital independiente, design engineer y desarrollador. Uno el código complejo con el diseño de alto nivel para construir experiencias web rápidas y a medida para marcas globales.',
		},
		work: {
			heading: 'Mi trabajo',
			description:
				'Explora mi trabajo más reciente: visiones complejas convertidas en experiencias digitales fluidas. Soluciones probadas, hechas para liderar y diseñadas para perdurar.',
			seeAll: 'Ver todos los proyectos',
			pageTitle: 'Mi trabajo',
			pageDescription: 'Proyectos seleccionados de Chris Bartosik.',
		},
		clients: {
			line1: 'Quienes están',
			line2: 'conmigo',
			description:
				'Desde innovadores locales hasta visionarios globales, he ayudado a muchas marcas a encontrar su ventaja y ocupar su espacio en el paisaje digital.',
		},
		about: {
			eyebrow: 'Mi historia',
			intro:
				'Soy un creador digital independiente que convirtió una obsesión por el oficio en una práctica dedicada a la calidad. Combino design engineering y desarrollo para construir productos digitales que duran.',
			heading:
				'Creo que una gran marca se construye sobre dos cosas: una visión clara y una base sólida.',
			body1:
				'Creo espacios digitales que cuentan tu historia. Con años de experiencia, he trabajado con marcas desde Polonia hasta LatAm, ayudándolas a destacar.',
			body2:
				'Mi trabajo es una mezcla de dos mundos. Miro el lado humano de tu negocio para entender tus metas y luego uso tecnología de alto nivel para hacerlas reales. Tu proyecto se mantiene consistente desde el primer boceto hasta la última línea de código. Estoy aquí para ayudarte a crecer y dejar huella en el mundo digital.',
			readMore: 'Más sobre mí',
			pageTitle: 'Sobre mí',
			pageDescription:
				'Chris Bartosik — creador digital independiente, design engineer y desarrollador.',
		},
		aboutPage: {
			line1: 'Design engineer',
			line2: 'y desarrollador',
			introHeading:
				'Construyo productos digitales en la intersección del código complejo y el diseño de alto nivel.',
			introBody1:
				'Trabajo de forma independiente, rápido, sin fricción y con total consistencia. Me enfoco en transformar negocios a través de branding estratégico, diseño UI/UX y desarrollo premium.',
			introBody2:
				'No creo en servicios de talla única. En su lugar, trabajo contigo para crear herramientas digitales a medida, plataformas escalables e identidades de marca que significan algo para tu audiencia y aportan valor medible a tu negocio.',
		},
		contact: {
			heading: 'Empieza tu legado',
			description:
				'Toda gran marca comienza con una sola conversación. Ya sea que estés construyendo desde cero o redefiniendo tu ventaja, creemos algo que dure.',
			sendEmail: 'Envíame un e-mail',
		},
		meta: {
			title: 'Chris Bartosik',
			description:
				'Creador digital independiente, design engineer y desarrollador forjando experiencias digitales de alto rendimiento.',
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

export function formatLabel(key: string, count?: number, locale: Locale = getLocale()): string {
	const label = t(key, locale);
	return count === undefined ? label : `${label} [${count}]`;
}
