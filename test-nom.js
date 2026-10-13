const email = 'cheeku681@gmail.com';
const text = '123 Main St, Kenora';
const nomParams = new URLSearchParams({
  q: text + ', Ontario',
  format: 'json',
  addressdetails: '1',
  limit: '1',
  email: email
});
fetch(`https://nominatim.openstreetmap.org/search?${nomParams.toString()}`)
  .then(r => Promise.all([r.status, r.text()]))
  .then(console.log);
