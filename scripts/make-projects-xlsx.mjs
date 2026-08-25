import ExcelJS from 'exceljs';
import { readdir, readFile } from 'node:fs/promises';

const PROJECTS_DIR = new URL('../src/content/projects/', import.meta.url);
const COPY_FIELDS = [
	{
		key: 'title',
		section: 'Karta / Card',
		note: 'Project name on the listing card and case-study page. Brand names usually stay as-is.',
	},
	{
		key: 'client',
		section: 'Meta',
		note: 'Client name in the project info row. Usually the same as the brand.',
	},
	{
		key: 'heroSubtitle',
		section: 'Hero',
		note: 'Keep line breaks — each line is a separate visual line on the page.',
	},
	{
		key: 'service',
		section: 'Info row',
		note: 'Comma-separated services shown on the case-study page. Optional.',
	},
	{
		key: 'industry',
		section: 'Info row',
		note: '',
	},
	{
		key: 'market',
		section: 'Info row',
		note: 'Country / market. Optional — leave empty if this project should not show it.',
	},
	{
		key: 'tools',
		section: 'Info row',
		note: 'Separate row under Market, e.g. Figma, Webflow, After Effects. Optional — not every project needs it.',
	},
	{
		key: 'liveLabel',
		section: 'Live',
		note: 'Underlined clickable text, e.g. See More website. Optional. Translate this. Needs liveUrl to actually open a page.',
	},
	{
		key: 'liveUrl',
		section: 'Live',
		note: 'The actual link, e.g. https://seemorelogistics.com — do not translate. Same URL for all languages. Put it in EN.',
	},
	{
		key: 'overviewTitle',
		section: 'Overview',
		note: '',
	},
	{
		key: 'overviewText',
		section: 'Overview',
		note: 'Body copy. Keep paragraph breaks.',
	},
	{
		key: 'challengesText',
		section: 'Challenges',
		note: 'Optional block — some projects do not have this yet.',
	},
	{
		key: 'strategyTitle',
		section: 'Strategy',
		note: '',
	},
	{
		key: 'strategyText',
		section: 'Strategy',
		note: 'Body copy. Keep paragraph breaks.',
	},
	{
		key: 'summaryTitle',
		section: 'Summary',
		note: '',
	},
	{
		key: 'summaryText',
		section: 'Summary',
		note: 'Body copy. Keep paragraph breaks.',
	},
];

const grey = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
const yellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
const white = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
const stripe = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131415' } };

function parseScalar(raw) {
	const value = raw.trim();
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === '') return '';
	if (/^-?\d+$/.test(value)) return Number(value);
	if (
		(value.startsWith("'") && value.endsWith("'")) ||
		(value.startsWith('"') && value.endsWith('"'))
	) {
		return value.slice(1, -1);
	}
	return value;
}

function parseFrontmatter(text) {
	const match = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};
	const lines = match[1].replace(/\r\n/g, '\n').split('\n');
	const data = {};
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i += 1;
			continue;
		}

		const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
		if (!kv) {
			i += 1;
			continue;
		}

		const key = kv[1];
		const rest = kv[2];

		if (rest === '|-') {
			const block = [];
			i += 1;
			while (i < lines.length) {
				const next = lines[i];
				if (next === '') {
					block.push('');
					i += 1;
					continue;
				}
				if (/^[A-Za-z0-9_]+:\s*/.test(next) && !next.startsWith(' ')) break;
				block.push(next.startsWith('  ') ? next.slice(2) : next);
				i += 1;
			}
			while (block.length && block[block.length - 1] === '') block.pop();
			data[key] = block.join('\n');
			continue;
		}

		if (rest.startsWith('[') && rest.endsWith(']')) {
			data[key] = rest
				.slice(1, -1)
				.split(',')
				.map((item) => parseScalar(item))
				.filter((item) => item !== '');
			i += 1;
			continue;
		}

		data[key] = parseScalar(rest);
		i += 1;
	}

	return data;
}

function sheetNameFor(project, used) {
	const preferred = project.comingSoon
		? `${project.title} — soon`.replace(/[\\/*?:\[\]]/g, ' ')
		: project.title.replace(/[\\/*?:\[\]]/g, ' ');
	let name = preferred.slice(0, 31).trim();
	if (!used.has(name.toLowerCase())) {
		used.add(name.toLowerCase());
		return name;
	}
	name = project.slug.slice(0, 31);
	used.add(name.toLowerCase());
	return name;
}

function styleHeader(row) {
	row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	row.fill = headerFill;
	row.alignment = { vertical: 'middle', wrapText: true };
	row.height = 28;
}

function addCopyRow(sheet, { section, key, en, notes, index }) {
	const excelRow = sheet.addRow({ section, key, en, pl: '', es: '', notes });
	excelRow.alignment = { wrapText: true, vertical: 'top' };
	const estimated = Math.max(String(en).length, notes.length);
	excelRow.height = Math.min(110, Math.max(22, Math.ceil(estimated / 46) * 16));
	excelRow.getCell(1).fill = grey;
	excelRow.getCell(2).fill = grey;
	const emptyEn = !String(en).trim();
	const bodyFill = emptyEn ? yellow : index % 2 === 0 ? white : stripe;
	excelRow.getCell(3).fill = emptyEn ? yellow : white;
	excelRow.getCell(4).fill = bodyFill;
	excelRow.getCell(5).fill = bodyFill;
	excelRow.getCell(6).fill = emptyEn ? yellow : grey;
	return excelRow;
}

const files = (await readdir(PROJECTS_DIR))
	.filter((name) => name.endsWith('.md'))
	.sort();

const projects = [];
for (const file of files) {
	const raw = await readFile(new URL(file, PROJECTS_DIR), 'utf8');
	const data = parseFrontmatter(raw);
	projects.push({
		slug: file.replace(/\.md$/, ''),
		title: String(data.title ?? file),
		client: String(data.client ?? ''),
		tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
		comingSoon: Boolean(data.comingSoon),
		order: Number(data.order ?? 999),
		data,
	});
}

projects.sort((a, b) => a.order - b.order);

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Chris Bartosik portfolio';
workbook.created = new Date();

const info = workbook.addWorksheet('Instrukcja', {
	views: [{ showGridLines: false }],
});
info.getColumn(1).width = 96;
info.addRow(['Chris Bartosik — project case-study copy']);
info.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF111111' } };
info.addRow([]);
info.addRow(['PL']);
info.getRow(3).font = { bold: true, size: 12 };
info.addRow([
	'Każda karta to jeden projekt. Kolumna EN to obecny tekst na stronie — możesz go poprawić. Kolumny PL i ES uzupełnij tłumaczeniem. Kolumn Sekcja i Klucz nie zmieniaj — po nich wrzucę teksty na stronę.',
]);
info.addRow([
	'Żółte wiersze = puste EN (jeszcze nie ma copy, np. projekty coming soon). Zachowaj łamanie linii w heroSubtitle i podziały akapitów w dłuższych tekstach. Tytuły / nazwy marek zwykle zostają bez tłumaczenia. Etykiety Overview / Challenges / Strategy / Summary / Service / Industry / Market / Tools / Live są w osobnym pliku UI, nie tutaj. Wiersze Tools i Live są opcjonalne — jeśli EN jest puste, ten punkt nie pojawi się na stronie. Live: liveLabel to podkreślony napis (np. See More website), liveUrl to sam link (bez tłumaczenia, wpisz w EN).',
]);
info.addRow([]);
info.addRow(['EN']);
info.getRow(7).font = { bold: true, size: 12 };
info.addRow([
	'Each tab is one project. EN is the current site copy — edit it if you want. Fill in PL and ES. Do not change Section or Key — those are used to drop the texts back into the site.',
]);
info.addRow([
	'Yellow rows = empty EN (no copy yet, e.g. coming-soon projects). Keep line breaks in heroSubtitle and paragraph breaks in longer texts. Brand names usually stay untranslated. Overview / Challenges / Strategy / Summary / Service / Industry / Market / Tools / Live labels live in the UI file, not here. Tools and Live rows are optional — empty EN means that row will not show on the page. Live: liveLabel is the underlined text (e.g. See More website), liveUrl is the actual link (do not translate, put it in EN).',
]);
info.addRow([]);
info.addRow(['When done: send this file back. One sheet per project, same columns as the UI translation file.']);
info.getRow(11).font = { italic: true, color: { argb: 'FF666666' } };
for (const row of [info.getRow(4), info.getRow(5), info.getRow(8), info.getRow(9)]) {
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = 56;
}
info.getRow(1).height = 24;
info.getRow(11).height = 22;

const indexSheet = workbook.addWorksheet('Spis', {
	views: [{ state: 'frozen', ySplit: 1 }],
});
indexSheet.columns = [
	{ header: '#', key: 'order', width: 8 },
	{ header: 'Projekt / Project', key: 'title', width: 28 },
	{ header: 'Klucz pliku / Slug', key: 'slug', width: 22 },
	{ header: 'Status', key: 'status', width: 16 },
	{ header: 'Kategoria na karcie / Card category', key: 'category', width: 28 },
	{ header: 'Uwagi / Notes', key: 'notes', width: 44 },
];
styleHeader(indexSheet.getRow(1));

const usedSheetNames = new Set(['instrukcja', 'spis']);
const projectSheets = [];

for (const project of projects) {
	const name = sheetNameFor(project, usedSheetNames);
	projectSheets.push({ project, name });
	const excelRow = indexSheet.addRow({
		order: project.order,
		title: project.title,
		slug: project.slug,
		status: project.comingSoon ? 'Coming soon' : 'Live',
		category: project.tags[0] ?? '',
		notes: project.comingSoon
			? 'No case-study copy yet — yellow rows are empty EN fields to fill.'
			: 'EN is live on the site. Add PL and ES, or correct EN.',
	});
	excelRow.alignment = { vertical: 'middle', wrapText: true };
	excelRow.height = 32;
	excelRow.getCell(2).value = {
		text: project.title,
		hyperlink: `#'${name.replace(/'/g, "''")}'!A1`,
	};
	excelRow.getCell(2).font = { color: { argb: 'FF1155CC' }, underline: true };
	if (project.comingSoon) {
		for (let col = 1; col <= 6; col += 1) excelRow.getCell(col).fill = yellow;
	}
}

for (const { project, name } of projectSheets) {
	const sheet = workbook.addWorksheet(name, {
		views: [{ state: 'frozen', ySplit: 1 }],
	});
	sheet.columns = [
		{ header: 'Sekcja / Section', key: 'section', width: 22 },
		{ header: 'Klucz / Key (do not edit)', key: 'key', width: 22 },
		{ header: 'EN (edit if needed)', key: 'en', width: 56 },
		{ header: 'PL', key: 'pl', width: 56 },
		{ header: 'ES', key: 'es', width: 56 },
		{ header: 'Uwagi / Notes', key: 'notes', width: 44 },
	];
	styleHeader(sheet.getRow(1));

	const rows = [];
	rows.push({
		section: 'Karta / Card',
		key: 'title',
		en: String(project.data.title ?? ''),
		notes: COPY_FIELDS[0].note,
	});

	project.tags.forEach((tag, tagIndex) => {
		rows.push({
			section: 'Karta / Card',
			key: `tags.${tagIndex}`,
			en: tag,
			notes:
				tagIndex === 0
					? 'Category under the title on the listing card. Translate this one first.'
					: 'Extra tag — currently not shown on the card, but keep for later.',
		});
	});

	if (project.tags.length === 0) {
		rows.push({
			section: 'Karta / Card',
			key: 'tags.0',
			en: '',
			notes: 'Category under the title on the listing card.',
		});
	}

	for (const field of COPY_FIELDS.slice(1)) {
		rows.push({
			section: field.section,
			key: field.key,
			en: String(project.data[field.key] ?? ''),
			notes: field.note,
		});
	}

	rows.forEach((row, index) => addCopyRow(sheet, { ...row, index }));
	sheet.autoFilter = {
		from: { row: 1, column: 1 },
		to: { row: rows.length + 1, column: 6 },
	};
}

const filename = 'Chris-Bartosik-projekty-tlumaczenia.xlsx';
await workbook.xlsx.writeFile(new URL(`../${filename}`, import.meta.url));
await workbook.xlsx.writeFile(new URL(`file:///C:/Users/PhotoAiD%20SA/Desktop/${filename}`));
console.log(`wrote ${projects.length} project sheets`);
