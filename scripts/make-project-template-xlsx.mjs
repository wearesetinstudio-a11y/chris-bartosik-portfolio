import ExcelJS from 'exceljs';

const MAX_SECTIONS = 10;

/** Human-facing rows only — gallery/hero assets come from folder files automatically. */
const ROWS = [
	{
		section: 'Start',
		key: 'slug',
		notes: 'Nazwa pliku projektu, np. epic-realty (→ epic-realty.md). Tylko EN.',
	},
	{
		section: 'Start',
		key: 'folderName',
		notes: 'Folder grafik: public/portfolio/{folderName}/. Zdjęcia bierze strona sama. Tylko EN.',
	},
	{
		section: 'Start',
		key: 'order',
		notes: 'Kolejność na liście (1, 2, 3…). Mniejsza = wyżej. Tylko EN.',
	},
	{
		section: 'Start',
		key: 'comingSoon',
		notes: 'true = Coming soon (wyszarzone), false = aktywny. Tylko EN.',
	},
	{
		section: 'Start',
		key: 'categories',
		notes: 'Filtry strony: ux-ui, motion, ai-engineering, development, branding (po przecinku). Tylko EN.',
	},
	{
		section: 'Karta',
		key: 'title',
		notes: 'Tytuł na liście projektów i w przeglądarce.',
	},
	{
		section: 'Karta',
		key: 'category',
		notes: 'Krótka kategoria pod tytułem (np. Rebranding). Tłumacz w PL/ES jeśli trzeba.',
	},
	{
		section: 'Hero',
		key: 'client',
		notes: 'Nazwa klienta. Zwykle bez tłumaczenia.',
	},
	{
		section: 'Hero',
		key: 'clientLabel',
		notes: 'Etykieta nad klientem, bez [ ]. Puste = domyślne Client / Klient / Cliente.',
	},
	{
		section: 'Hero',
		key: 'heroSubtitle',
		notes: 'Podtytuł pod klientem. Enter = nowa linia na stronie.',
	},
	{
		section: 'Info',
		key: 'service',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'industry',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'market',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'tools',
		notes: 'Puste = ukryte na stronie.',
	},
	{
		section: 'Info',
		key: 'year',
		notes: 'Rok, np. 2025. Tylko EN.',
	},
	{
		section: 'Live',
		key: 'liveLabel',
		notes: 'Tekst linku (jeśli jest live). Puste = bez linku.',
	},
	{
		section: 'Live',
		key: 'liveUrl',
		notes: 'Adres URL. Tylko EN. Puste = bez linku.',
	},
	{
		section: 'Overview',
		key: 'overviewLabel',
		notes: 'Etykieta bez [ ]. Puste = Overview / Kontekst / Descripción.',
	},
	{
		section: 'Overview',
		key: 'overviewTitle',
		notes: 'Nagłówek bloku overview.',
	},
	{
		section: 'Overview',
		key: 'overviewText',
		notes: 'Treść. Pusta linia = nowy akapit.',
	},
];

for (let i = 0; i < MAX_SECTIONS; i += 1) {
	const n = String(i + 1).padStart(2, '0');
	const section = `Sekcja ${n}`;
	ROWS.push(
		{
			section,
			key: `sections.${i}.label`,
			notes: 'Etykieta bez [ ], np. Challenge / Wyzwanie. Puste = sekcja nieużywana.',
		},
		{
			section,
			key: `sections.${i}.title`,
			notes: 'Nagłówek sekcji.',
		},
		{
			section,
			key: `sections.${i}.text`,
			notes: 'Treść. Pusta linia = nowy akapit. Puste pole = sekcja nieużywana.',
		},
	);
}

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
workbook.created = new Date();

const info = workbook.addWorksheet('Instrukcja', {
	views: [{ showGridLines: false }],
});
info.getColumn(1).width = 100;
info.addRow(['Chris Bartosik — szablon jednego projektu']);
info.getRow(1).font = { bold: true, size: 16 };
info.addRow([]);
info.addRow(['Jak używać']);
info.getRow(3).font = { bold: true, size: 12 };
info.addRow(['1. Skopiuj plik i nazwij np. Epic Realty.xlsx (jeden Excel = jeden projekt).']);
info.addRow(['2. W karcie „Projekt” uzupełnij EN, PL i ES — tylko teksty.']);
info.addRow(['3. Wrzuć grafiki do public/portfolio/{folderName}/ (cover, bg, 1.webp, 2.webp…).']);
info.addRow(['4. Wyślij mi Excel albo wrzuć go do tego folderu — ja wciągam treści.']);
info.addRow([]);
info.addRow(['Co jest automatyczne (nie wpisujesz w Excelu)']);
info.getRow(9).font = { bold: true, size: 12 };
info.addRow([
	'Zdjęcia i wideo: cover.webp/mp4, bg.webp, 1.webp (overview), 2.webp / 2.1+2.2… — strona czyta je z folderu. Nie ma pól afterGroup / ścieżek grafik.',
]);
info.addRow([
	'Układ i kolory sekcji: theme idzie automatycznie (dark → light → muted). Overview zawsze jasny. Sekcja Summary / Podsumowanie / Resultado zawsze na końcu.',
]);
info.addRow([
	'CAPS (etykiety, tytuły, info) robi CSS na stronie — w Excelu pisz normalnie. Nawiasów [ ] przy labelach nie dopisuj.',
]);
info.addRow([]);
info.addRow(['Pola tylko EN (żółte i tak wypełnij w kolumnie EN)']);
info.getRow(14).font = { bold: true, size: 12 };
info.addRow(['slug, folderName, order, comingSoon, categories, year, liveUrl.']);
for (const r of [4, 5, 6, 7, 10, 11, 12, 15]) {
	info.getRow(r).alignment = { wrapText: true, vertical: 'top' };
	info.getRow(r).height = 40;
}

const sheet = workbook.addWorksheet('Projekt', {
	views: [{ state: 'frozen', ySplit: 1 }],
});
sheet.columns = [
	{ header: 'Sekcja', key: 'section', width: 14 },
	{ header: 'Pole', key: 'key', width: 22 },
	{ header: 'EN', key: 'en', width: 56 },
	{ header: 'PL', key: 'pl', width: 56 },
	{ header: 'ES', key: 'es', width: 56 },
	{ header: 'Uwagi', key: 'notes', width: 52 },
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
		en: '',
		pl: '',
		es: '',
		notes: field.notes,
	});
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = Math.min(72, Math.max(24, Math.ceil(field.notes.length / 52) * 16));
	row.getCell(1).fill = grey;
	row.getCell(2).fill = grey;
	const body = index % 2 === 0 ? white : stripe;
	row.getCell(3).fill = yellow;
	if (enOnly.has(field.key)) {
		row.getCell(4).fill = grey;
		row.getCell(5).fill = grey;
	} else {
		row.getCell(4).fill = body;
		row.getCell(5).fill = body;
	}
	row.getCell(6).fill = grey;
});

sheet.autoFilter = {
	from: { row: 1, column: 1 },
	to: { row: ROWS.length + 1, column: 6 },
};

const checklist = workbook.addWorksheet('Grafiki', {
	views: [{ showGridLines: false }],
});
checklist.getColumn(1).width = 48;
checklist.getColumn(2).width = 44;
checklist.addRow(['Wrzucasz do folderu projektu', 'Co robi']);
styleHeader(checklist.getRow(1));
for (const [file, note] of [
	['cover.webp / cover.webm / cover.mp4', 'Okładka na liście projektów'],
	['bg.webp', 'Tło hero na stronie projektu'],
	['1.webp', 'Grafika przy Overview / Intro (opcjonalnie)'],
	['X.1.webp / X.1.mp4', 'Sekcja X: 1 duże zdjęcie / wideo'],
	['X.2.webp + X.3.webp', 'Sekcja X: 2 mniejsze zdjęcia (w parze obok siebie)'],
	['X.4.webp / X.4.mp4', 'Sekcja X: 1 duże zdjęcie / wideo'],
	['ten Excel (opcjonalnie)', 'Żebym mógł wciągnąć teksty z folderu'],
]) {
	const row = checklist.addRow([file, note]);
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = 28;
}

const outName = 'Chris-Bartosik-projekt-SZABLON.xlsx';
await workbook.xlsx.writeFile(new URL(`../templates/${outName}`, import.meta.url));
await workbook.xlsx.writeFile(new URL(`../${outName}`, import.meta.url));
try {
	await workbook.xlsx.writeFile(new URL(`file:///C:/Users/PhotoAiD%20SA/Desktop/${outName}`));
} catch {
	// optional
}
console.log(`wrote ${outName} (${ROWS.length} rows — texts + start meta only)`);
