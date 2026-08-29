import ExcelJS from 'exceljs';
import { parse as parseYaml } from 'yaml';
import { readdir, readFile } from 'node:fs/promises';

const PROJECTS_DIR = new URL('../src/content/projects/', import.meta.url);
const MAX_SECTIONS = 10;

const BASE_FIELDS = [
	{
		key: 'title',
		section: 'Karta / Card',
		note: 'Project name on the listing card and case-study page. Brand names usually stay as-is.',
	},
	{
		key: 'client',
		section: 'Hero',
		note: 'Client / brand name under the hero. Usually stays untranslated.',
	},
	{
		key: 'clientLabel',
		section: 'Hero',
		note:
			'Custom text inside [ … ] above the client name (e.g. Client / Partner). Empty = default from UI file (EN Client / PL Klient / ES Cliente). Set empty intentionally to hide the label.',
	},
	{
		key: 'heroSubtitle',
		section: 'Hero',
		note: 'Keep line breaks — each line is a separate visual line on the page. Optional.',
	},
	{
		key: 'service',
		section: 'Info row',
		note: 'Comma-separated services. Optional — empty = row hidden.',
	},
	{
		key: 'industry',
		section: 'Info row',
		note: 'Optional — empty = row hidden.',
	},
	{
		key: 'market',
		section: 'Info row',
		note: 'Country / market. Optional — empty = row hidden.',
	},
	{
		key: 'tools',
		section: 'Info row',
		note: 'e.g. Figma, Webflow, After Effects. Optional — empty = row hidden.',
	},
	{
		key: 'liveLabel',
		section: 'Live',
		note: 'Underlined clickable text, e.g. See More website. Optional. Translate this. Needs liveUrl to open.',
	},
	{
		key: 'liveUrl',
		section: 'Live',
		note: 'Actual URL, e.g. https://seemorelogistics.com — do not translate. Same for all languages. Put in EN.',
	},
	{
		key: 'overviewLabel',
		section: 'Overview / Kontekst',
		note:
			'Text inside [ … ] above the overview heading. Empty = UI default (Overview / Kontekst / Descripción).',
	},
	{
		key: 'overviewTitle',
		section: 'Overview / Kontekst',
		note: 'Optional — empty = heading hidden.',
	},
	{
		key: 'overviewText',
		section: 'Overview / Kontekst',
		note: 'Body copy. Keep paragraph breaks (blank lines). Optional.',
	},
];

const grey = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
const yellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3C4' } };
const white = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
const stripe = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131415' } };

function asText(value) {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	return '';
}

function parseFrontmatter(text) {
	const match = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};
	try {
		const data = parseYaml(match[1]);
		return data && typeof data === 'object' ? data : {};
	} catch {
		return {};
	}
}

function localeBucket(data, locale) {
	return data?.i18n?.[locale] && typeof data.i18n[locale] === 'object' ? data.i18n[locale] : {};
}

function getField(data, locale, key) {
	if (locale === 'en') return asText(data?.[key]);
	return asText(localeBucket(data, locale)?.[key]);
}

function getSections(data) {
	return Array.isArray(data?.sections) ? data.sections.slice(0, MAX_SECTIONS) : [];
}

function getSectionField(data, locale, index, field) {
	if (locale === 'en') {
		return asText(getSections(data)[index]?.[field]);
	}
	const localeSections = localeBucket(data, locale)?.sections;
	return asText(Array.isArray(localeSections) ? localeSections[index]?.[field] : '');
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

function addCopyRow(sheet, { section, key, en, pl, es, notes, index }) {
	const excelRow = sheet.addRow({ section, key, en, pl, es, notes });
	excelRow.alignment = { wrapText: true, vertical: 'top' };
	const estimated = Math.max(String(en).length, String(pl).length, String(es).length, notes.length);
	excelRow.height = Math.min(120, Math.max(22, Math.ceil(estimated / 46) * 16));
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

function buildRows(project) {
	const { data } = project;
	const rows = [];

	rows.push({
		section: 'Karta / Card',
		key: 'title',
		en: getField(data, 'en', 'title'),
		pl: getField(data, 'pl', 'title'),
		es: getField(data, 'pa', 'title'),
		notes: BASE_FIELDS[0].note,
	});

	const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
	tags.forEach((tag, tagIndex) => {
		rows.push({
			section: 'Karta / Card',
			key: `tags.${tagIndex}`,
			en: tag,
			pl: '',
			es: '',
			notes:
				tagIndex === 0
					? 'Category under the title on the listing card. Translate this one first.'
					: 'Extra tag — currently not shown on the card, but keep for later.',
		});
	});

	if (tags.length === 0) {
		rows.push({
			section: 'Karta / Card',
			key: 'tags.0',
			en: '',
			pl: '',
			es: '',
			notes: 'Category under the title on the listing card.',
		});
	}

	for (const field of BASE_FIELDS.slice(1)) {
		rows.push({
			section: field.section,
			key: field.key,
			en: getField(data, 'en', field.key),
			pl: getField(data, 'pl', field.key),
			es: getField(data, 'pa', field.key),
			notes: field.note,
		});
	}

	const sections = getSections(data);
	const sectionCount = Math.max(sections.length, 1);

	for (let index = 0; index < sectionCount; index += 1) {
		const section = sections[index] ?? {};
		const n = index + 1;
		const theme = asText(section.theme) || 'light';
		const after =
			typeof section.afterGroup === 'number'
				? `after gallery group ${section.afterGroup}`
				: 'trailing (end of page)';
		const meta = `Section ${String(n).padStart(2, '0')} · theme: ${theme} · ${after}. Empty label/title/text = that piece is hidden.`;

		rows.push({
			section: `Sekcja ${String(n).padStart(2, '0')} / Section ${String(n).padStart(2, '0')}`,
			key: `sections.${index}.label`,
			en: getSectionField(data, 'en', index, 'label'),
			pl: getSectionField(data, 'pl', index, 'label'),
			es: getSectionField(data, 'pa', index, 'label'),
			notes: `${meta} Label inside [ … ].`,
		});
		rows.push({
			section: `Sekcja ${String(n).padStart(2, '0')} / Section ${String(n).padStart(2, '0')}`,
			key: `sections.${index}.title`,
			en: getSectionField(data, 'en', index, 'title'),
			pl: getSectionField(data, 'pl', index, 'title'),
			es: getSectionField(data, 'pa', index, 'title'),
			notes: 'Section heading. Optional.',
		});
		rows.push({
			section: `Sekcja ${String(n).padStart(2, '0')} / Section ${String(n).padStart(2, '0')}`,
			key: `sections.${index}.text`,
			en: getSectionField(data, 'en', index, 'text'),
			pl: getSectionField(data, 'pl', index, 'text'),
			es: getSectionField(data, 'pa', index, 'text'),
			notes:
				'Body. Keep paragraph breaks. Lists: lines like "- **Title**: body". Max 8 sections total in the .md file.',
		});
	}

	// Reserve empty slots so translators know up to 8 sections are possible
	for (let index = sectionCount; index < MAX_SECTIONS; index += 1) {
		const n = index + 1;
		const meta = `Optional slot ${String(n).padStart(2, '0')} / 08 — add in EN .md (theme + afterGroup), then translate here.`;
		for (const field of ['label', 'title', 'text']) {
			rows.push({
				section: `Sekcja ${String(n).padStart(2, '0')} / Section ${String(n).padStart(2, '0')}`,
				key: `sections.${index}.${field}`,
				en: '',
				pl: '',
				es: '',
				notes: meta,
			});
		}
	}

	return rows;
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
		title: asText(data.title) || file,
		client: asText(data.client),
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
info.getColumn(1).width = 100;
info.addRow(['Chris Bartosik — project case-study copy']);
info.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF111111' } };
info.addRow([]);
info.addRow(['PL']);
info.getRow(3).font = { bold: true, size: 12 };
info.addRow([
	'Każda karta = jeden projekt. EN to tekst na stronie (możesz poprawić). PL i ES = tłumaczenia. Kolumn Sekcja i Klucz nie zmieniaj.',
]);
info.addRow([
	'Hero: client = nazwa, clientLabel = tekst w [ … ] (puste = domyślne z pliku UI albo ukryte). Overview + do 8 sekcji (label / title / text). Puste pole = element ukryty. theme i afterGroup ustawiasz w pliku .md (nie tutaj). Etykiety UI typu Service / Industry / Kontekst są w osobnym pliku UI (Chris-Bartosik-tlumaczenia.xlsx), nie tutaj. Live: liveLabel tłumaczysz, liveUrl nie.',
]);
info.addRow([]);
info.addRow(['EN']);
info.getRow(7).font = { bold: true, size: 12 };
info.addRow([
	'Each tab is one project. EN is live site copy — edit if needed. Fill PL and ES. Do not change Section or Key.',
]);
info.addRow([
	'Hero: client = name, clientLabel = [ … ] text (empty = UI default or hidden). Overview + up to 8 sections (label / title / text). Empty field = that piece is hidden. theme and afterGroup are set in the .md file (not here). UI labels like Service / Industry / Overview live in the UI workbook, not here. Live: translate liveLabel, do not translate liveUrl.',
]);
info.addRow([]);
info.addRow([
	'Source files: src/content/projects/*.md — EN at the top, translations under i18n.pl / i18n.pa. When done: send this file back.',
]);
info.getRow(11).font = { italic: true, color: { argb: 'FF666666' } };
for (const row of [info.getRow(4), info.getRow(5), info.getRow(8), info.getRow(9)]) {
	row.alignment = { wrapText: true, vertical: 'top' };
	row.height = 64;
}
info.getRow(1).height = 24;
info.getRow(11).height = 36;

const indexSheet = workbook.addWorksheet('Spis', {
	views: [{ state: 'frozen', ySplit: 1 }],
});
indexSheet.columns = [
	{ header: '#', key: 'order', width: 8 },
	{ header: 'Projekt / Project', key: 'title', width: 28 },
	{ header: 'Klucz pliku / Slug', key: 'slug', width: 22 },
	{ header: 'Status', key: 'status', width: 16 },
	{ header: 'Sekcje / Sections', key: 'sections', width: 14 },
	{ header: 'Kategoria na karcie / Card category', key: 'category', width: 28 },
	{ header: 'Uwagi / Notes', key: 'notes', width: 44 },
];
styleHeader(indexSheet.getRow(1));

const usedSheetNames = new Set(['instrukcja', 'spis']);
const projectSheets = [];

for (const project of projects) {
	const name = sheetNameFor(project, usedSheetNames);
	projectSheets.push({ project, name });
	const sectionCount = getSections(project.data).length;
	const excelRow = indexSheet.addRow({
		order: project.order,
		title: project.title,
		slug: project.slug,
		status: project.comingSoon ? 'Coming soon' : 'Live',
		sections: `${sectionCount} / ${MAX_SECTIONS}`,
		category: project.tags[0] ?? '',
		notes: project.comingSoon
			? 'No case-study copy yet — yellow rows are empty EN fields to fill.'
			: 'EN is live on the site. Add / fix PL and ES.',
	});
	excelRow.alignment = { vertical: 'middle', wrapText: true };
	excelRow.height = 32;
	excelRow.getCell(2).value = {
		text: project.title,
		hyperlink: `#'${name.replace(/'/g, "''")}'!A1`,
	};
	excelRow.getCell(2).font = { color: { argb: 'FF1155CC' }, underline: true };
	if (project.comingSoon) {
		for (let col = 1; col <= 7; col += 1) excelRow.getCell(col).fill = yellow;
	}
}

for (const { project, name } of projectSheets) {
	const sheet = workbook.addWorksheet(name, {
		views: [{ state: 'frozen', ySplit: 1 }],
	});
	sheet.columns = [
		{ header: 'Sekcja / Section', key: 'section', width: 28 },
		{ header: 'Klucz / Key (do not edit)', key: 'key', width: 26 },
		{ header: 'EN (edit if needed)', key: 'en', width: 56 },
		{ header: 'PL', key: 'pl', width: 56 },
		{ header: 'ES', key: 'es', width: 56 },
		{ header: 'Uwagi / Notes', key: 'notes', width: 48 },
	];
	styleHeader(sheet.getRow(1));

	const rows = buildRows(project);
	rows.forEach((row, index) => addCopyRow(sheet, { ...row, index }));
	sheet.autoFilter = {
		from: { row: 1, column: 1 },
		to: { row: rows.length + 1, column: 6 },
	};
}

const filename = 'Chris-Bartosik-projekty-tlumaczenia.xlsx';
await workbook.xlsx.writeFile(new URL(`../${filename}`, import.meta.url));
try {
	await workbook.xlsx.writeFile(new URL(`file:///C:/Users/PhotoAiD%20SA/Desktop/${filename}`));
} catch {
	// Desktop copy is optional
}
console.log(`wrote ${projects.length} project sheets → ${filename}`);
