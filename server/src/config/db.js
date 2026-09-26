const mongoose = require('mongoose');
const dns = require('node:dns');

// Configure public DNS servers to resolve MongoDB Atlas SRV records smoothly on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`ℹ️  Note: Make sure your IP address (or 0.0.0.0/0) is whitelisted in MongoDB Atlas -> Network Access.`);
    throw error;
  }
};

module.exports = connectDB;
