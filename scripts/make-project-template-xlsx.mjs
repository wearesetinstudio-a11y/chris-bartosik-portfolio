import ExcelJS from 'exceljs';

const MAX_SECTIONS = 8;

const ROWS = [
	{
		section: 'Meta / pliki',
		key: 'slug',
		notes: 'Nazwa pliku, np. epic-realty → src/content/projects/epic-realty.md',
	},
	{
		section: 'Meta / pliki',
		key: 'folderName',
		notes: 'Folder grafik: public/portfolio/{folderName}/',
	},
	{
		section: 'Meta / pliki',
		key: 'order',
		notes: 'Kolejność na liście (liczba). Mniejsza = wyżej.',
	},
	{
		section: 'Meta / pliki',
		key: 'comingSoon',
		notes: 'true / false',
	},
	{
		section: 'Meta / pliki',
		key: 'thumbnail',
		notes: 'np. /portfolio/folder/cover.webp lub cover.webm / cover.mp4',
	},
	{
		section: 'Meta / pliki',
		key: 'video',
		notes: 'Opcjonalne wideo na karcie',
	},
	{
		section: 'Meta / pliki',
		key: 'heroImage',
		notes: 'Tło hero, np. /portfolio/folder/bg.webp',
	},
	{
		section: 'Meta / pliki',
		key: 'logo',
		notes: 'Opcjonalnie /logos/….svg',
	},
	{
		section: 'Meta / pliki',
		key: 'overviewGraphic',
		notes: 'Opcjonalnie — bez tego bierze 1.webp z folderu',
	},
	{
		section: 'Karta / Card',
		key: 'title',
		notes: 'Nazwa na liście i stronie. Marki zwykle bez tłumaczenia.',
	},
	{
		section: 'Karta / Card',
		key: 'tags.0',
		notes: 'Kategoria pod tytułem na karcie (tłumacz).',
	},
	{
		section: 'Karta / Card',
		key: 'categories',
		notes: 'Filtry: ux-ui, motion, ai-engineering, development, branding (po przecinku). Nie tłumacz.',
	},
	{
		section: 'Hero',
		key: 'client',
		notes: 'Nazwa klienta. Zwykle bez tłumaczenia. Na stronie i tak CAPS.',
	},
	{
		section: 'Hero',
		key: 'clientLabel',
		notes: 'Tekst w [ … ] — wpisz bez nawiasów, np. Client. Puste = domyślne UI.',
	},
	{
		section: 'Hero',
		key: 'heroSubtitle',
		notes: 'Zachowaj łamanie linii (Enter = nowa linia na stronie).',
	},
	{
		section: 'Info row',
		key: 'service',
		notes: 'Puste = ukryte. Na stronie CAPS.',
	},
	{
		section: 'Info row',
		key: 'industry',
		notes: 'Puste = ukryte. Na stronie CAPS.',
	},
	{
		section: 'Info row',
		key: 'market',
		notes: 'Puste = ukryte. Na stronie CAPS.',
	},
	{
		section: 'Info row',
		key: 'tools',
		notes: 'Puste = ukryte. Na stronie CAPS.',
	},
	{
		section: 'Info row',
		key: 'year',
		notes: 'Rok, np. 2025. Nie tłumacz.',
	},
	{
		section: 'Live',
		key: 'liveLabel',
		notes: 'Podkreślony napis linku. Tłumacz.',
	},
	{
		section: 'Live',
		key: 'liveUrl',
		notes: 'URL — tylko EN, bez tłumaczenia.',
	},
	{
		section: 'Overview / Kontekst',
		key: 'overviewLabel',
		notes: 'Tekst w [ … ] bez nawiasów. Puste = Overview/Kontekst/Descripción. Overview zawsze light.',
	},
	{
		section: 'Overview / Kontekst',
		key: 'overviewTitle',
		notes: 'Nagłówek. Na stronie CAPS.',
	},
	{
		section: 'Overview / Kontekst',
		key: 'overviewText',
		notes: 'Treść. Puste linie = nowe akapity. Bez CAPS.',
	},
];

for (let i = 0; i < MAX_SECTIONS; i += 1) {
	const n = String(i + 1).padStart(2, '0');
	const section = `Sekcja ${n}`;
	const themeHint = ['dark', 'light', 'muted'][i % 3];
	ROWS.push(
		{
			section,
			key: `sections.${i}.label`,
			notes: `Bez [ ]. Na stronie CAPS. Theme auto: ${themeHint}. Summary = zawsze ostatnia (bez afterGroup).`,
		},
		{
			section,
			key: `sections.${i}.title`,
			notes: 'Nagłówek. Na stronie CAPS.',
		},
		{
			section,
			key: `sections.${i}.text`,
			notes: 'Treść. Listy: - **Tytuł**: opis. Bez CAPS.',
		},
		{
			section,
			key: `sections.${i}.afterGroup`,
			notes:
				'Tylko EN. Po której grupie galerii wstawić (np. 2 = po 2.webp). Puste = na końcu. Summary zostaw puste.',
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
info.addRow(['1. Skopiuj ten plik i nazwij go np. Epic Realty.xlsx (jeden plik = jeden projekt).']);
info.addRow(['2. W karcie „Projekt” uzupełnij kolumny EN, PL i ES (jedna tabela).']);
info.addRow(['3. Wyślij mi plik albo wrzuć do public/portfolio/{folderName}/.']);
info.addRow([]);
info.addRow(['Zasady']);
info.getRow(8).font = { bold: true, size: 12 };
info.addRow([
	'Theme sekcji jest automatyczne (1=dark, 2=light, 3=muted, potem znowu dark…). Overview zawsze light. Nie wpisujesz theme.',
]);
info.addRow([
	'Summary / Podsumowanie / Resultado zawsze na końcu — zostaw afterGroup puste. CAPS na stronie robi CSS (label, tytuły, info) — możesz pisać normalnie.',
]);
info.addRow([
	'Labeli clientLabel / overviewLabel / sections.*.label nie otaczaj nawiasami [ ] — strona dodaje je sama. liveUrl, year, categories, afterGroup tylko w EN.',
]);
for (const r of [4, 5, 6, 9, 10, 11]) {
	info.getRow(r).alignment = { wrapText: true, vertical: 'top' };
	info.getRow(r).height = 36;
}

const sheet = workbook.addWorksheet('Projekt', {
	views: [{ state: 'frozen', ySplit: 1 }],
});
sheet.columns = [
	{ header: 'Sekcja', key: 'section', width: 22 },
	{ header: 'Klucz (nie zmieniaj)', key: 'key', width: 26 },
	{ header: 'EN', key: 'en', width: 56 },
	{ header: 'PL', key: 'pl', width: 56 },
	{ header: 'ES', key: 'es', width: 56 },
	{ header: 'Uwagi', key: 'notes', width: 44 },
];
styleHeader(sheet.getRow(1));

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
	row.height = Math.min(64, Math.max(24, Math.ceil(field.notes.length / 48) * 16));
	row.getCell(1).fill = grey;
	row.getCell(2).fill = grey;
	const body = index % 2 === 0 ? white : stripe;
	row.getCell(3).fill = yellow;
	row.getCell(4).fill = body;
	row.getCell(5).fill = body;
	row.getCell(6).fill = grey;
});

sheet.autoFilter = {
	from: { row: 1, column: 1 },
	to: { row: ROWS.length + 1, column: 6 },
};

const checklist = workbook.addWorksheet('Grafiki', {
	views: [{ showGridLines: false }],
});
checklist.getColumn(1).width = 40;
checklist.getColumn(2).width = 40;
checklist.addRow(['Plik w public/portfolio/{folderName}/', 'Notatka']);
styleHeader(checklist.getRow(1));
for (const file of [
	'cover.webp / cover.webm / cover.mp4',
	'bg.webp (hero)',
	'1.webp (overview)',
	'2.webp, 3.webp… (full)',
	'2.1 + 2.2, 3.1 + 3.2… (pary)',
	'ten Excel w folderze (opcjonalnie)',
]) {
	const row = checklist.addRow([file, '']);
	row.getCell(2).fill = yellow;
}

const outName = 'Chris-Bartosik-projekt-SZABLON.xlsx';
await workbook.xlsx.writeFile(new URL(`../templates/${outName}`, import.meta.url));
await workbook.xlsx.writeFile(new URL(`../${outName}`, import.meta.url));
try {
	await workbook.xlsx.writeFile(new URL(`file:///C:/Users/PhotoAiD%20SA/Desktop/${outName}`));
} catch {
	// optional
}
console.log(`wrote ${outName} (${ROWS.length} rows, single Projekt sheet)`);
