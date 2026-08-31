import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const xlsxPath = path.resolve('public/portfolio/see-more/See More Logistics.xlsx');
const wb = new ExcelJS.Workbook();

async function run() {
  await wb.xlsx.readFile(xlsxPath);
  const ws = wb.worksheets.find(w => w.name.includes('Tłumaczenia') || w.name.includes('Translations')) || wb.worksheets[0];
  const data = {};

  const getVal = (cell) => {
    if (!cell || cell.value === null || cell.value === undefined) return '';
    if (typeof cell.value === 'object' && cell.value.text) return cell.value.text;
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

  fs.writeFileSync('scripts/see-more-full.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Saved properly mapped data to scripts/see-more-full.json');
}

run();
