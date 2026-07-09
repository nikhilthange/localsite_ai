const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

const connectDB = async (retries = MAX_RETRIES) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
    });
    return conn;
  } catch (err) {
    console.error(`MongoDB connection failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, err.message);
    if (retries > 0) {
      console.log(`Retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    throw err;
  }
};

module.exports = connectDB;
