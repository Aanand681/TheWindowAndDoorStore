import xlsx from 'xlsx';
const workbook = xlsx.readFile('public/Aanand Tax Calc - Updated - Jan 16, 2026 - Copy.xls');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
for (let key in sheet) {
  if (key[0] === '!') continue;
  if (sheet[key].w && sheet[key].w.trim() !== '') {
    console.log(key + ' = ' + sheet[key].w);
  } else if (sheet[key].v) {
    console.log(key + ' = ' + sheet[key].v);
  }
}
