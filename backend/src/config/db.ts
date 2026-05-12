import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process if connection fails (fail-fast strategy).
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // This should theoretically not be hit if server.ts check passes, 
    // but kept as a simple safety check.
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ FATAL ERROR: MongoDB connection error:', error.message);
    console.error('👉 Check if your IP is whitelisted in MongoDB Atlas or if the credentials are correct.');
    process.exit(1);
  }
};
