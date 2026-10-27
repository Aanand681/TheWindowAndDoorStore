import dbConnect from '../src/lib/mongodb';
import SavedQuote from '../src/models/SavedQuote';
import Notification from '../src/models/Notification';

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await dbConnect();
  console.log('Connected successfully. Syncing indexes...');

  console.log('Syncing SavedQuote indexes...');
  const quoteIndexes = await SavedQuote.syncIndexes();
  console.log('SavedQuote indexes synced:', quoteIndexes);

  console.log('Syncing Notification indexes...');
  const notifIndexes = await Notification.syncIndexes();
  console.log('Notification indexes synced:', notifIndexes);

  console.log('All indexes ensured successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to sync indexes:', err);
  process.exit(1);
});
