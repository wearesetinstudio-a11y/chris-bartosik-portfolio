import ExcelJS from 'exceljs';
import { dictionary } from '../src/utils/i18n.ts';

const sectionNames = {
	brand: 'Marka / Brand',
	footer: 'Stopka / Footer',
	nav: 'Nawigacja / Nav',
	cta: 'CTA',
	project: 'Projekty UI / Project UI',
	skills: 'Skills',
	hero: 'Hero',
	work: 'Work',
	clients: 'Klienci / Clients',
	tools: 'Narzędzia / Tools',
	testimonials: 'Opinie / Testimonials',
	about: 'About (home)',
	aboutPage: 'Strona About / About page',
	contact: 'Kontakt / Contact',
	meta: 'SEO / meta',
};

const notes = {
	'brand.name': 'Wordmark on site stays Chris. PL copy uses Krzysztof.',
	'brand.firstName': 'Same as brand.name',
	'hero.line1': 'Headline line 1 — keep as a separate line, do not merge',
	'hero.line2Lead': 'Headline line 2 — keep separate',
	'hero.line2Before': 'Text before the glitch word (can be empty)',
	'hero.line2Glitch': 'Glitch word only',
	'hero.line2After': 'Text after the glitch word (can be empty)',
	'hero.portraitCaption': 'Keep the [ ] brackets',
	'about.kickerBefore': 'Keep the opening [',
	'about.kickerAfter': 'Keep the closing ]',
	'aboutPage.timelineHeading': 'Keep [ ]',
	'aboutPage.job1Date': 'Keep [ ]',
	'aboutPage.job2Date': 'Keep [ ]',
	'aboutPage.job3Date': 'Keep [ ]',
	'testimonials.quote1': 'Quote — PL and ES are still English, please translate',
	'testimonials.quote2': 'Quote — PL and ES are still English, please translate',
	'testimonials.quote3': 'Quote — PL and ES are still English, please translate',
	'testimonials.quote4': 'Quote — PL and ES are still English, please translate',
	'testimonials.quote5': 'Quote — PL and ES are still English, please translate',
	'project.tools': 'Info-row label next to Service / Industry / Market — do not merge with skills.tools',
	'skills.s2F1Title': 'Duplicate of s2F2Title — can be differentiated',
	'skills.s2F2Title': 'Duplicate of s2F1Title — can be differentiated',
};

function flatten(obj, prefix = '') {
	const rows = [];
	for (const [k, v] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${k}` : k;
		if (v && typeof v === 'object' && !Array.isArray(v)) rows.push(...flatten(v, path));
		else rows.push([path, String(v).replace(/\u00a0/g, ' ')]);
	}
	return rows;
}

const enMap = Object.fromEntries(flatten(dictionary.en));
const plMap = Object.fromEntries(flatten(dictionary.pl));
const esMap = Object.fromEntries(flatten(dictionary.pa));
const keys = Object.keys(enMap);

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Chris Bartosik portfolio';
workbook.created = new Date();

const info = workbook.addWorksheet('Instrukcja', {
	views: [{ showGridLines: false }],
});
info.getColumn(1).width = 92;
info.addRow(['Chris Bartosik — website copy for translation']);
info.mergeCells('A1:A1');
info.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF111111' } };
info.addRow([]);
info.addRow(['PL']);
info.getRow(3).font = { bold: true, size: 12 };
info.addRow([
	'To jest pełna kopia UI strony (nawigacja, hero, skills, about, kontakt, opinie). Proszę uzupełnić / poprawić kolumny PL i ES. Kolumny Sekcja, Klucz i EN zostaw bez zmian — EN jest tekstem źródłowym.',
]);
info.addRow([
	'Żółte wiersze = cytaty, które w PL i ES są jeszcze po angielsku. Szare kolumny = nie edytować. Hero: line1 / line2Lead / glitch trzymaj jako osobne linie. Nawiasy [ ] zostaw tam, gdzie są.',
]);
info.addRow([]);
info.addRow(['EN']);
info.getRow(7).font = { bold: true, size: 12 };
info.addRow([
	'This is all UI copy for the site. Please review and fill in the PL and ES columns. Do not change Section, Key, or EN — EN is the source text.',
]);
info.addRow([
	'Yellow rows = testimonials still in English in PL/ES. Grey columns = do not edit. Keep hero line1 / line2Lead / glitch as separate lines. Keep [ ] brackets where present.',
]);
info.addRow([]);
info.addRow(['When done: send this file back. The Key column is used to drop texts into the site.']);
info.getRow(11).font = { italic: true, color: { argb: 'FF666666' } };

for (const row of info.getRows(4, 8) ?? []) {
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = 48;
}
info.getRow(1).height = 24;
info.getRow(3).height = 18;
info.getRow(7).height = 18;
info.getRow(11).height = 22;

const sheet = workbook.addWorksheet('Tłumaczenia', {
	views: [{ state: 'frozen', ySplit: 1, xSplit: 0 }],
});

sheet.columns = [
	{ header: 'Sekcja / Section', key: 'section', width: 24 },
	{ header: 'Klucz / Key (do not edit)', key: 'key', width: 32 },
	{ header: 'EN (source — do not edit)', key: 'en', width: 48 },
	{ header: 'PL', key: 'pl', width: 48 },
	{ header: 'ES', key: 'es', width: 48 },
	{ header: 'Uwagi / Notes', key: 'notes', width: 42 },
];

const header = sheet.getRow(1);
header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131415' } };
header.alignment = { vertical: 'middle', wrapText: true };
header.height = 28;

const grey = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
const yellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
const white = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
const stripe = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };

keys.forEach((key, index) => {
	const en = enMap[key] ?? '';
	const pl = plMap[key] ?? '';
	const es = esMap[key] ?? '';
	const quoteStillEn = key.startsWith('testimonials.quote') && (pl === en || es === en);
	const excelRow = sheet.addRow({
		section: sectionNames[key.split('.')[0]] || key.split('.')[0],
		key,
		en,
		pl,
		es,
		notes: notes[key] ?? '',
	});
	excelRow.alignment = { wrapText: true, vertical: 'top' };
	const estimated = Math.max(en.length, pl.length, es.length);
	excelRow.height = Math.min(90, Math.max(22, Math.ceil(estimated / 42) * 16));
	excelRow.getCell(1).fill = grey;
	excelRow.getCell(2).fill = grey;
	excelRow.getCell(3).fill = grey;
	const bodyFill = quoteStillEn ? yellow : index % 2 === 0 ? white : stripe;
	excelRow.getCell(4).fill = bodyFill;
	excelRow.getCell(5).fill = bodyFill;
	excelRow.getCell(6).fill = quoteStillEn ? yellow : grey;
});

sheet.autoFilter = {
	from: { row: 1, column: 1 },
	to: { row: keys.length + 1, column: 6 },
};

const outDir = new URL('../', import.meta.url);
const desktop = new URL('file:///C:/Users/PhotoAiD%20SA/Desktop/');
const filename = 'Chris-Bartosik-tlumaczenia.xlsx';

await workbook.xlsx.writeFile(new URL(filename, outDir));
await workbook.xlsx.writeFile(new URL(filename, desktop));
console.log(`wrote ${keys.length} rows`);
