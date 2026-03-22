import mongoose from 'mongoose';
import "dotenv/config";
import dns from 'node:dns';

// Fix for Node.js 17+ DNS resolution issues
dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { 
    serverSelectionTimeoutMS: 10000, 
    socketTimeoutMS: 45000 
  })
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('ETIMEDOUT') || err.message.includes('server selection')) {
      console.error('👉 TIP: This is often caused by a blocked IP. Please check your MongoDB Atlas IP Access List.');
    }
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error event:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default mongoose;
