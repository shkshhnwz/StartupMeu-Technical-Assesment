const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const { authRoutes } = require('./moduels/Authorization');
const { businessRoutes } = require('./moduels/founderListingManagement');
const { sendSuccess, sendError } = require('./utils/apiResponse');

const app = express();

// Security middlewares
app.use(helmet());

// CORS configuration for cookies & credentials
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'StartupMeu Connect API is healthy', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);

// 404 handler for undefined API routes
app.use('*', (req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Route ${req.originalUrl} not found`);
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
