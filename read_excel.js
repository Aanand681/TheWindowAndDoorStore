import xlsx from 'xlsx';

const file = 'public/Aanand Tax Calc - Updated - Jan 16, 2026 - Copy.xls';
try {
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets['Sheet1'];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(JSON.stringify(json.slice(0, 50), null, 2)); // print first 50 rows
} catch (e) {
  console.error(e);
}
