const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Try again later.' },
});
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static files (local uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/lost', require('./src/routes/lostItem.routes'));
app.use('/api/found', require('./src/routes/foundItem.routes'));
app.use('/api/matches', require('./src/routes/match.routes'));
app.use('/api/requests', require('./src/routes/request.routes'));
app.use('/api/messages', require('./src/routes/message.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'LostLink API is running 🚀' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Error handler
app.use(errorHandler);

module.exports = app;
