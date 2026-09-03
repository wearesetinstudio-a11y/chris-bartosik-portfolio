import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import ExcelJS from 'exceljs';

const xlsxPath = path.resolve('public/portfolio/photoaid-kiosk/PhotoAiD-Kiosk.xlsx');
const wb = new ExcelJS.Workbook();

async function run() {
	await wb.xlsx.readFile(xlsxPath);
	const ws =
		wb.worksheets.find((w) => w.name.includes('Tłumaczenia') || w.name.includes('Translations')) ||
		wb.worksheets[1] ||
		wb.worksheets[0];
	const data = {};

	const getVal = (cell) => {
		if (!cell || cell.value === null || cell.value === undefined) return '';
		if (typeof cell.value === 'object' && cell.value.text) return String(cell.value.text).trim();
		return String(cell.value).trim();
	};

	ws.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;
		const key = getVal(row.getCell(2));
		if (!key) return;
		const pl = getVal(row.getCell(3));
		const en = getVal(row.getCell(4));
		const es = getVal(row.getCell(5));
		data[key] = { pl, en, es };
	});

	const getEn = (k, fallback = '') => data[k]?.en || fallback;
	const getPl = (k, fallback = '') => data[k]?.pl || fallback;
	const getEs = (k, fallback = '') => data[k]?.es || fallback;

	const sectionIndexes = [0, 1, 2, 3, 9];
	const afterGroups = [1, 2, 3, 4, 5];

	const sectionsEn = sectionIndexes.map((index, i) => ({
		label: getEn(`sections.${index}.label`),
		title: getEn(`sections.${index}.title`),
		text: getEn(`sections.${index}.text`),
		afterGroup: afterGroups[i],
	}));

	const sectionsPl = sectionIndexes.map((index) => ({
		label: getPl(`sections.${index}.label`),
		title: getPl(`sections.${index}.title`),
		text: getPl(`sections.${index}.text`),
	}));

	const sectionsEs = sectionIndexes.map((index) => ({
		label: getEs(`sections.${index}.label`),
		title: getEs(`sections.${index}.title`),
		text: getEs(`sections.${index}.text`),
	}));

	const frontmatter = {
		title: getEn('title') || 'PhotoAiD Kiosk',
		client: 'PhotoAiD',
		tags: ['UX/UI', 'motion', 'development'],
		categories: ['ux-ui', 'motion', 'development'],
		thumbnail: '/portfolio/photoaid-kiosk/cover.webm',
		folderName: 'photoaid-kiosk',
		order: 2,
		comingSoon: false,
		video: '/portfolio/photoaid-kiosk/cover.webm',
		...(fs.existsSync(path.resolve('public/portfolio/photoaid-kiosk/bg.webp'))
			? { heroImage: '/portfolio/photoaid-kiosk/bg.webp' }
			: {}),
		logo: '/logos/photoaid.svg',
		clientLabel: getEn('clientLabel') || 'Client',
		heroSubtitle: getEn('heroSubtitle'),
		service: getEn('service'),
		industry: getEn('industry'),
		market: getEn('market'),
		tools: getEn('tools'),
		year: 2026,
		overviewLabel: getEn('overviewLabel') || 'Intro',
		overviewTitle: getEn('overviewTitle'),
		overviewText: getEn('overviewText'),
		sections: sectionsEn,
		i18n: {
			pl: {
				title: getPl('title') || 'PhotoAiD Kiosk',
				clientLabel: getPl('clientLabel') || 'Klient',
				category: getPl('category') || 'UX/UI, motion',
				heroSubtitle: getPl('heroSubtitle'),
				service: getPl('service'),
				industry: getPl('industry'),
				market: getPl('market'),
				tools: getPl('tools'),
				overviewLabel: getPl('overviewLabel') || 'Intro',
				overviewTitle: getPl('overviewTitle'),
				overviewText: getPl('overviewText'),
				sections: sectionsPl,
			},
			pa: {
				title: getEs('title') || 'PhotoAiD Kiosk',
				clientLabel: getEs('clientLabel') || 'Cliente',
				category: getEs('category') || 'UX/UI, motion',
				heroSubtitle: getEs('heroSubtitle'),
				service: getEs('service'),
				industry: getEs('industry'),
				market: getEs('market'),
				tools: getEs('tools'),
				overviewLabel: getEs('overviewLabel') || 'Intro',
				overviewTitle: getEs('overviewTitle'),
				overviewText: getEs('overviewText'),
				sections: sectionsEs,
			},
		},
	};

	const yamlStr = yaml.stringify(frontmatter);
	const mdContent = `---\n${yamlStr}---\n`;
	fs.writeFileSync('src/content/projects/photoaid-kiosk.md', mdContent, 'utf-8');
	console.log('Successfully written src/content/projects/photoaid-kiosk.md');
}

run();
