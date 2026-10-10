const express = require('express');
const {
  getFounderDashboardSummary,
  getInvestorDashboardSummary
} = require('./dashboard.controller');
const {
  protect,
  authorizeRoles
} = require('../Authorization/auth.middleware');

const router = express.Router();

router.get(
  '/founder',
  protect,
  authorizeRoles('founder'),
  getFounderDashboardSummary
);

router.get(
  '/investor',
  protect,
  authorizeRoles('investor'),
  getInvestorDashboardSummary
);

module.exports = router;
