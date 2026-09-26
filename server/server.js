require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('⚠️  Continuing server launch. Database operations will reconnect once Atlas is accessible.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 LostLink Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

