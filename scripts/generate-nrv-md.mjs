import ExcelJS from 'exceljs';
import { stringify } from 'yaml';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const workbookPath = path.resolve('public/portfolio/nrv/NRV.xlsx');
const outputPath = path.resolve('src/content/projects/nrv.md');

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);

const sheet = workbook.worksheets[1];
if (!sheet) throw new Error('NRV translation sheet not found.');

function cellText(value) {
	if (value == null) return '';
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	if (typeof value === 'object' && 'text' in value) return String(value.text);
	return '';
}

const rows = new Map();
for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
	const values = sheet.getRow(rowIndex).values;
	const key = cellText(values[2]);
	if (!key) continue;
	rows.set(key, {
		pl: cellText(values[3]),
		en: cellText(values[4]),
		pa: cellText(values[5]),
	});
}

function field(key, locale = 'en') {
	return rows.get(key)?.[locale] ?? '';
}

function list(value) {
	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

function normalizeCategory(category) {
	return category
		.replace(/^ux\/ui$/i, 'ux-ui')
		.replace(/^no-code development$/i, 'development');
}

const categories = list(field('categories')).map(normalizeCategory);
const tags = list(field('category'));
const sections = [];

for (let index = 0; index < 10; index += 1) {
	const prefix = `sections.${index}`;
	const label = field(`${prefix}.label`);
	const title = field(`${prefix}.title`);
	const text = field(`${prefix}.text`);
	if (!label && !title && !text) continue;

	const section = { sourceIndex: index, label, title, text };
	if (/summary|podsum|resumen/i.test(label)) {
		sections.push(section);
	} else {
		section.afterGroup = index + 1;
		sections.push(section);
	}
}

const base = {
	title: field('title'),
	client: field('client'),
	tags,
	categories,
	thumbnail: '/portfolio/nrv/cover.riv',
	folderName: 'nrv',
	order: 12,
	comingSoon: false,
	video: '/portfolio/nrv/cover.riv',
	heroImage: '/portfolio/nrv/bg.webp',
	clientLabel: field('clientLabel'),
	heroSubtitle: field('heroSubtitle'),
	service: field('service'),
	industry: field('industry'),
	market: field('market'),
	tools: field('tools'),
	year: field('year'),
	liveLabel: field('liveLabel'),
	liveUrl: field('liveUrl'),
	overviewLabel: field('overviewLabel'),
	overviewTitle: field('overviewTitle'),
	overviewText: field('overviewText'),
	sections,
};

const translations = {};
for (const locale of ['pl', 'pa']) {
	translations[locale] = {
		title: field('title', locale),
		clientLabel: field('clientLabel', locale),
		category: field('category', locale),
		heroSubtitle: field('heroSubtitle', locale),
		service: field('service', locale),
		industry: field('industry', locale),
		market: field('market', locale),
		tools: field('tools', locale),
		year: field('year', locale),
		liveLabel: field('liveLabel', locale),
		overviewLabel: field('overviewLabel', locale),
		overviewTitle: field('overviewTitle', locale),
		overviewText: field('overviewText', locale),
		sections: sections.map((section) => ({
			label: field(`sections.${section.sourceIndex}.label`, locale),
			title: field(`sections.${section.sourceIndex}.title`, locale),
			text: field(`sections.${section.sourceIndex}.text`, locale),
		})),
	};
}

const frontmatter = {
	...base,
	sections: base.sections.map(({ sourceIndex, ...section }) => section),
	i18n: translations,
};

const markdown = `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n`;
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, markdown, 'utf8');
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);