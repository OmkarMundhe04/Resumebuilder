const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumebuilder');
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      try {
        const indexes = await mongoose.connection.db.collection(col.name).indexes();
        console.log(`Indexes for ${col.name}:`, indexes.map(i => i.name));
        for (const idx of indexes) {
          if (idx.name !== '_id_' && idx.name !== 'email_1' && idx.name !== 'username_1' && idx.name !== 'userId_1' && idx.name !== 'token_1') {
            console.log(`Dropping index ${idx.name} from ${col.name}`);
            await mongoose.connection.db.collection(col.name).dropIndex(idx.name);
          }
        }
      } catch (err) {
        console.log(`Could not process collection ${col.name}:`, err.message);
      }
    }
    console.log('Index cleanup completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning indexes:', err);
    process.exit(1);
  }
}

run();
