require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately
const server = app.listen(PORT, () => {
  console.log(`🚀 LostLink Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to Database
connectDB().catch((err) => {
  console.warn('⚠️  Database initial connection pending: ' + err.message);
  console.log('ℹ️  Ensure your IP is whitelisted in MongoDB Atlas (Network Access -> Allow 0.0.0.0/0).');
});


