import mongoose from 'mongoose';
import "dotenv/config";
import dns from 'node:dns';

// Fix for Node.js 17+ DNS resolution issues
dns.setDefaultResultOrder('ipv4first');

// Set Google DNS servers as primary for better SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e: any) {
  console.warn('⚠️ Could not set custom DNS servers, using default:', e.message);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { 
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    maxIdleTimeMS: 10000
  })
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('ETIMEDOUT') || err.message.includes('server selection') || err.message.includes('ECONNREFUSED')) {
      console.error('👉 TIP: Connection refused or timed out. This is often caused by:');
      console.error('   1. A blocked IP (check MongoDB Atlas IP Access List)');
      console.error('   2. Network/DNS restrictions (SRV records might be blocked)');
      console.error('   3. Faulty credentials in .env file');
      console.error('   4. VPN or firewall blocking port 27017');
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

// Process handlers removed for serverless compatibility (Vercel doesn't use them predictably)

export default mongoose;
