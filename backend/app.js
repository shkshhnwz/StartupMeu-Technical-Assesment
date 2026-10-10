require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const { authRoutes } = require('./moduels/Authorization');
const { businessRoutes } = require('./moduels/founderListingManagement');
const { discoveryRoutes } = require('./moduels/OpportunityDiscovery');
const { interestRoutes } = require('./moduels/investorInterestWorkflow');
const { dashboardRoutes } = require('./moduels/dashboardSummary');
const { sendSuccess, sendError } = require('./utils/apiResponse');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim().replace(/\/+$/, ''))
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'StartupMeu Connect API is healthy', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/opportunities', discoveryRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('*', (req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

module.exports = app;
