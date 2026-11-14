const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_complaint_db';

async function connectDB() {
  try {
    // Mongoose 9+ does NOT need useNewUrlParser / useUnifiedTopology — they are removed
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,  // fail fast if MongoDB not running
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10
    });

    console.log(`[Database] ✅ Connected to MongoDB`);
    console.log(`[Database] Host : ${conn.connection.host}`);
    console.log(`[Database] DB   : ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('[Database] ❌ MongoDB connection failure:', error.message);
    console.error('[Database] URI used:', MONGODB_URI);
    console.error('[Database] Make sure MongoDB service is running.');
    return false;
  }
}

async function testConnection() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log(`[Database] MongoDB already connected: ${mongoose.connection.name}`);
      return true;
    }
    return await connectDB();
  } catch (error) {
    console.error('[Database] Connection test failed:', error.message);
    return false;
  }
}

// Log any unexpected disconnects
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] ⚠️  MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Mongoose error:', err.message);
});

module.exports = {
  connectDB,
  testConnection,
  mongoose
};
