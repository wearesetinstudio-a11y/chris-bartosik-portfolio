import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import ExcelJS from 'exceljs';

const xlsxPath = path.resolve('public/portfolio/photoaid-biometric-app/PhotoAiD Biometric App.xlsx');
const wb = new ExcelJS.Workbook();

async function run() {
  await wb.xlsx.readFile(xlsxPath);
  const ws = wb.worksheets.find(w => w.name.includes('Tłumaczenia') || w.name.includes('Translations')) || wb.worksheets[0];
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

  const rawTags = getEn('category') || 'ux/ui, motion, app, A/B tests';
  const tagList = rawTags
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const sectionsEn = [
    {
      label: getEn('sections.0.label', 'Scalability'),
      title: getEn('sections.0.title'),
      text: getEn('sections.0.text'),
      afterGroup: 1,
    },
    {
      label: getEn('sections.1.label', 'Camera UX'),
      title: getEn('sections.1.title'),
      text: getEn('sections.1.text'),
      afterGroup: 2,
    },
    {
      label: getEn('sections.2.label', 'Onboarding & Conversion'),
      title: getEn('sections.2.title'),
      text: getEn('sections.2.text'),
      afterGroup: 3,
    },
    {
      label: getEn('sections.3.label', 'Product Page Optimization'),
      title: getEn('sections.3.title'),
      text: getEn('sections.3.text'),
      afterGroup: 4,
    },
    {
      label: getEn('sections.4.label', 'Checkout Optimization and A/B Testing'),
      title: getEn('sections.4.title'),
      text: getEn('sections.4.text'),
      afterGroup: 5,
    },
    {
      label: getEn('sections.9.label', 'Summary'),
      title: getEn('sections.9.title'),
      text: getEn('sections.9.text'),
      afterGroup: 6,
    },
  ];

  const sectionsPl = [
    {
      label: getPl('sections.0.label', 'Skalowalność'),
      title: getPl('sections.0.title'),
      text: getPl('sections.0.text'),
    },
    {
      label: getPl('sections.1.label', 'UX aparatu'),
      title: getPl('sections.1.title'),
      text: getPl('sections.1.text'),
    },
    {
      label: getPl('sections.2.label', 'Onboarding i Konwersja'),
      title: getPl('sections.2.title'),
      text: getPl('sections.2.text'),
    },
    {
      label: getPl('sections.3.label', 'Product Page Optimalizacja'),
      title: getPl('sections.3.title'),
      text: getPl('sections.3.text'),
    },
    {
      label: getPl('sections.4.label', 'Optymalizacja i Testy A/B Checkoutu'),
      title: getPl('sections.4.title'),
      text: getPl('sections.4.text'),
    },
    {
      label: getPl('sections.9.label', 'Podsumowanie'),
      title: getPl('sections.9.title'),
      text: getPl('sections.9.text'),
    },
  ];

  const sectionsEs = [
    {
      label: getEs('sections.0.label', 'Escalabilidad'),
      title: getEs('sections.0.title'),
      text: getEs('sections.0.text'),
    },
    {
      label: getEs('sections.1.label', 'UX de Cámara'),
      title: getEs('sections.1.title'),
      text: getEs('sections.1.text'),
    },
    {
      label: getEs('sections.2.label', 'Onboarding y Conversión'),
      title: getEs('sections.2.title'),
      text: getEs('sections.2.text'),
    },
    {
      label: getEs('sections.3.label', 'Optimización de Página de Producto'),
      title: getEs('sections.3.title'),
      text: getEs('sections.3.text'),
    },
    {
      label: getEs('sections.4.label', 'Optimización y Pruebas A/B de Checkout'),
      title: getEs('sections.4.title'),
      text: getEs('sections.4.text'),
    },
    {
      label: getEs('sections.9.label', 'Resumen'),
      title: getEs('sections.9.title'),
      text: getEs('sections.9.text'),
    },
  ];

  const frontmatter = {
    title: getEn('title') || 'PhotoAiD Biometric App',
    client: 'PhotoAiD',
    tags: tagList,
    categories: ['ux-ui', 'ai-engineering', 'development'],
    thumbnail: '/portfolio/photoaid-biometric-app/cover.webp',
    folderName: 'photoaid-biometric-app',
    order: 2,
    comingSoon: false,
    heroImage: '/portfolio/photoaid-biometric-app/bg.webp',
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
        title: getPl('title') || 'Aplikacja Biometryczna PhotoAiD',
        clientLabel: getPl('clientLabel') || 'Klient',
        category: getPl('category') || tagList.join(', '),
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
        title: getEs('title') || 'Aplicación Biométrica PhotoAiD',
        clientLabel: getEs('clientLabel') || 'Cliente',
        category: getEs('category') || tagList.join(', '),
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

  const quote = getEn('quote');
  if (quote && quote !== 'null') {
    frontmatter.quote = quote;
    frontmatter.quoteAuthor = getEn('quoteAuthor');
    frontmatter.quoteRole = getEn('quoteRole');
    frontmatter.quoteLabel = getEn('quoteLabel');
    if (getPl('quote') && getPl('quote') !== 'null') {
      frontmatter.i18n.pl.quote = getPl('quote');
      frontmatter.i18n.pl.quoteAuthor = getPl('quoteAuthor');
      frontmatter.i18n.pl.quoteRole = getPl('quoteRole');
      frontmatter.i18n.pl.quoteLabel = getPl('quoteLabel');
    }
    if (getEs('quote') && getEs('quote') !== 'null') {
      frontmatter.i18n.pa.quote = getEs('quote');
      frontmatter.i18n.pa.quoteAuthor = getEs('quoteAuthor');
      frontmatter.i18n.pa.quoteRole = getEs('quoteRole');
      frontmatter.i18n.pa.quoteLabel = getEs('quoteLabel');
    }
  }

  const yamlStr = yaml.stringify(frontmatter);
  const mdContent = `---\n${yamlStr}---\n`;
  fs.writeFileSync('src/content/projects/photoaid.md', mdContent, 'utf-8');
  console.log('Successfully written src/content/projects/photoaid.md');
}

run();
