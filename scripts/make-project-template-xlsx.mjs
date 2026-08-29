import ExcelJS from 'exceljs';

const MAX_SECTIONS = 10;
const today = new Date();
const dateStr = today.toISOString().slice(0, 10); // '2026-08-29'
const dateFormatted = today.toLocaleDateString('pl-PL', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

/** Human-facing rows only — gallery/hero assets come from folder files automatically. */
const ROWS = [
	{
		section: 'Start',
		key: 'slug',
		en: '',
		pl: '',
		es: '',
		notes: 'Nazwa pliku projektu, np. epic-realty (→ epic-realty.md). Tylko EN.',
	},
	{
		section: 'Start',
		key: 'folderName',
		en: '',
		pl: '',
		es: '',
		notes: 'Folder grafik: public/portfolio/{folderName}/. Zdjęcia bierze strona sama. Tylko EN.',
	},
	{
		section: 'Start',
		key: 'order',
		en: '',
		pl: '',
		es: '',
		notes: 'Kolejność na liście (1, 2, 3…). Mniejsza = wyżej. Tylko EN.',
	},
	{
		section: 'Start',
		key: 'comingSoon',
		en: 'false',
		pl: '',
		es: '',
		notes: 'true = Coming soon (wyszarzone), false = aktywny. Tylko EN.',
	},
	{
		section: 'Start',
		key: 'categories',
		en: '',
		pl: '',
		es: '',
		notes: 'Filtry strony: ux-ui, motion, ai-engineering, development, branding (po przecinku). Tylko EN.',
	},
	{
		section: 'Karta',
		key: 'title',
		en: '',
		pl: '',
		es: '',
		notes: 'Tytuł na liście projektów i w przeglądarce.',
	},
	{
		section: 'Karta',
		key: 'category',
		en: '',
		pl: '',
		es: '',
		notes: 'Obszary działań projektu (np. Rebranding, UX/UI, No-Code). Rozdzielaj po przecinku, strona utworzy z nich osobne białe boxy.',
	},
	{
		section: 'Hero',
		key: 'client',
		en: '',
		pl: '',
		es: '',
		notes: 'Nazwa klienta. Zwykle bez tłumaczenia.',
	},
	{
		section: 'Hero',
		key: 'clientLabel',
		en: 'Client',
		pl: 'Klient',
		es: 'Cliente',
		notes: 'Etykieta nad klientem, bez [ ]. Puste = domyślne Client / Klient / Cliente.',
	},
	{
		section: 'Hero',
		key: 'heroSubtitle',
		en: '',
		pl: '',
		es: '',
		notes: 'Podtytuł pod klientem. Enter = nowa linia na stronie.',
	},
	{
		section: 'Info',
		key: 'service',
		en: '',
		pl: '',
		es: '',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'industry',
		en: '',
		pl: '',
		es: '',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'market',
		en: '',
		pl: '',
		es: '',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'tools',
		en: '',
		pl: '',
		es: '',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'year',
		en: '2026',
		pl: '',
		es: '',
		notes: 'Rok, np. 2026. Tylko EN.',
	},
	{
		section: 'Live',
		key: 'liveLabel',
		en: '',
		pl: '',
		es: '',
		notes: 'Tekst linku (jeśli jest live). Puste = bez linku.',
	},
	{
		section: 'Live',
		key: 'liveUrl',
		en: '',
		pl: '',
		es: '',
		notes: 'Adres URL. Tylko EN. Puste = bez linku.',
	},
	{
		section: 'Overview / Sekcja 01',
		key: 'overviewLabel',
		en: 'Intro',
		pl: 'Intro',
		es: 'Intro',
		notes: 'Etykieta 1. sekcji (Intro/Overview). Puste = domyślne [Intro] / [Kontekst] / [Descripción].',
	},
	{
		section: 'Overview / Sekcja 01',
		key: 'overviewTitle',
		en: '',
		pl: '',
		es: '',
		notes: 'Nagłówek bloku overview / intro.',
	},
	{
		section: 'Overview / Sekcja 01',
		key: 'overviewText',
		en: '',
		pl: '',
		es: '',
		notes: 'Treść intro. Pusta linia = nowy akapit.',
	},
];

for (let i = 0; i < MAX_SECTIONS; i += 1) {
	const n = String(i + 1).padStart(2, '0');
	const isLast = i === MAX_SECTIONS - 1;
	const section = `Sekcja ${n}${isLast ? ' (Summary)' : ''}`;

	ROWS.push(
		{
			section,
			key: `sections.${i}.label`,
			en: isLast ? 'Summary' : '',
			pl: isLast ? 'Podsumowanie' : '',
			es: isLast ? 'Resumen' : '',
			notes: isLast
				? 'Ostatnia sekcja: domyślnie Summary / Podsumowanie / Resumen. Zawsze białe tło.'
				: 'Etykieta bez [ ], np. Challenge / Strategy / Design. Puste = sekcja nieużywana.',
		},
		{
			section,
			key: `sections.${i}.title`,
			en: '',
			pl: '',
			es: '',
			notes: 'Nagłówek sekcji.',
		},
		{
			section,
			key: `sections.${i}.text`,
			en: '',
			pl: '',
			es: '',
			notes: 'Treść. Pusta linia = nowy akapit. Puste pole = sekcja nieużywana.',
		},
	);
}

ROWS.push(
	{
		section: 'Opinia klienta',
		key: 'quoteLabel',
		en: 'Client review',
		pl: 'Opinia klienta',
		es: 'Opinión del cliente',
		notes: 'Etykieta nad cytatem, bez [ ]. Puste = domyślne [Client review] / [Opinia klienta] / [Opinión del cliente].',
	},
	{
		section: 'Opinia klienta',
		key: 'quote',
		en: '',
		pl: '',
		es: '',
		notes: 'Treść cytatu / opinii klienta. Umieszczana pod sekcją Summary. Puste = sekcja ukryta.',
	},
	{
		section: 'Opinia klienta',
		key: 'quoteAuthor',
		en: '',
		pl: '',
		es: '',
		notes: 'Imię i nazwisko autora cytatu (np. Nedelka Velasco).',
	},
	{
		section: 'Opinia klienta',
		key: 'quoteRole',
		en: '',
		pl: '',
		es: '',
		notes: 'Stanowisko / firma autora cytatu (np. CEO of NRV).',
	},
);

const grey = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
const yellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
const white = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
const stripe = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131415' } };

function styleHeader(row) {
	row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	row.fill = headerFill;
	row.alignment = { vertical: 'middle', wrapText: true };
	row.height = 28;
}

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Chris Bartosik portfolio';
workbook.created = today;

const info = workbook.addWorksheet('Instrukcja', {
	views: [{ showGridLines: false }],
});
info.getColumn(1).width = 110;
info.addRow([`Chris Bartosik — Szablon projektu (Wersja: ${dateStr})`]);
info.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF111111' } };
info.addRow([`Data wygenerowania szablonu: ${dateFormatted}`]);
info.getRow(2).font = { italic: true, size: 10, color: { argb: 'FF666666' } };
info.addRow([]);
info.addRow(['Jak używać:']);
info.getRow(4).font = { bold: true, size: 12 };
info.addRow(['1. Skopiuj plik i nazwij np. [NazwaProjektu].xlsx (jeden Excel = jeden projekt).']);
info.addRow(['2. W karcie „Tłumaczenia (PL - EN - ES)” uzupełnij teksty dla 3 języków.']);
info.addRow(['3. Sekcja 1 (Intro) oraz ostatnia sekcja (Summary) mają już wstępnie wpisane etykiety.']);
info.addRow(['4. Na samym dole znajduje się opcjonalna sekcja „Opinia klienta” (cytat, autor, stanowisko).']);
info.addRow(['5. Wrzuć grafiki do folderu public/portfolio/{folderName}/ (cover, bg, X.1, X.2, X.3, X.4).']);
info.addRow([]);
info.addRow(['Zasady automatyczne (nie wpisujesz w Excelu):']);
info.getRow(11).font = { bold: true, size: 12 };
info.addRow([
	'Grafiki i wideo: strona pobiera je automatycznie z folderu projektu według schematu X.1, X.2, X.3, X.4.',
]);
info.addRow([
	'Kolorystyka sekcji: wszystkie sekcje mają spójne, białe tło (light mode).',
]);
info.addRow([
	'Wielkie litery (CAPS): formatowane są automatycznie przez styl strony — w Excelu pisz naturalnie.',
]);

for (const r of [5, 6, 7, 8, 9, 12, 13, 14]) {
	info.getRow(r).alignment = { wrapText: true, vertical: 'top' };
	info.getRow(r).height = 26;
}

const sheet = workbook.addWorksheet('Tłumaczenia (PL - EN - ES)', {
	views: [{ state: 'frozen', ySplit: 1 }],
});
sheet.columns = [
	{ header: 'Sekcja', key: 'section', width: 24 },
	{ header: 'Klucz pola', key: 'key', width: 22 },
	{ header: 'Polski (PL)', key: 'pl', width: 50 },
	{ header: 'Angielski (EN)', key: 'en', width: 50 },
	{ header: 'Hiszpański (ES)', key: 'es', width: 50 },
	{ header: 'Instrukcja / Uwagi', key: 'notes', width: 54 },
];
styleHeader(sheet.getRow(1));

const enOnly = new Set([
	'slug',
	'folderName',
	'order',
	'comingSoon',
	'categories',
	'year',
	'liveUrl',
]);

ROWS.forEach((field, index) => {
	const row = sheet.addRow({
		section: field.section,
		key: field.key,
		pl: field.pl,
		en: field.en,
		es: field.es,
		notes: field.notes,
	});
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = Math.min(80, Math.max(26, Math.ceil(field.notes.length / 54) * 16));
	row.getCell(1).fill = grey;
	row.getCell(2).fill = grey;
	const body = index % 2 === 0 ? white : stripe;
	
	if (enOnly.has(field.key)) {
		row.getCell(3).fill = grey; // PL blocked
		row.getCell(4).fill = yellow; // EN active
		row.getCell(5).fill = grey; // ES blocked
	} else {
		row.getCell(3).fill = body;
		row.getCell(4).fill = yellow;
		row.getCell(5).fill = body;
	}
	row.getCell(6).fill = grey;
});

sheet.autoFilter = {
	from: { row: 1, column: 1 },
	to: { row: ROWS.length + 1, column: 6 },
};

const checklist = workbook.addWorksheet('Grafiki i media', {
	views: [{ showGridLines: false }],
});
checklist.getColumn(1).width = 48;
checklist.getColumn(2).width = 44;
checklist.addRow(['Plik w folderze public/portfolio/{folderName}/', 'Rola pliku na stronie']);
styleHeader(checklist.getRow(1));
for (const [file, note] of [
	['cover.webp / cover.webm / cover.mp4', 'Okładka / wideo na liście projektów'],
	['bg.webp', 'Tło w sekcji Hero na stronie projektu'],
	['1.webp', 'Grafika / media w sekcji Intro (opcjonalnie)'],
	['X.1.webp / X.1.mp4', 'Sekcja X: 1 duże zdjęcie / wideo na pełną szerokość'],
	['X.2.webp + X.3.webp', 'Sekcja X: 2 mniejsze zdjęcia (w parze obok siebie 50%/50%)'],
	['X.4.webp / X.4.mp4', 'Sekcja X: 1 duże zdjęcie / wideo na pełną szerokość'],
]) {
	const row = checklist.addRow([file, note]);
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = 28;
}

const versionedFilename = `Chris-Bartosik-szablon-projektu-${dateStr}.xlsx`;
const defaultFilename = 'Chris-Bartosik-projekt-SZABLON.xlsx';

await workbook.xlsx.writeFile(new URL(`../templates/${versionedFilename}`, import.meta.url));
await workbook.xlsx.writeFile(new URL(`../templates/${defaultFilename}`, import.meta.url));
await workbook.xlsx.writeFile(new URL(`../${versionedFilename}`, import.meta.url));
await workbook.xlsx.writeFile(new URL(`../${defaultFilename}`, import.meta.url));

try {
	await workbook.xlsx.writeFile(new URL(`file:///C:/Users/PhotoAiD%20SA/Desktop/${versionedFilename}`));
	await workbook.xlsx.writeFile(new URL(`file:///C:/Users/PhotoAiD%20SA/Desktop/${defaultFilename}`));
} catch {
	// optional desktop mirror
}

console.log(`Successfully generated ${versionedFilename} and ${defaultFilename}`);
