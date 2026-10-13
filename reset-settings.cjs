const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.collection('settings').deleteMany({});
  console.log('Settings reset successfully!');
  process.exit(0);
}

reset();
