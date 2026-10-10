const express = require('express');
const {
  submitInterest,
  getSentInterests,
  getReceivedInterests,
  updateInterestStatus
} = require('./interest.controller');
const {
  validateSubmitInterest,
  validateUpdateStatus
} = require('./interest.validator');
const {
  protect,
  authorizeRoles
} = require('../Authorization/auth.middleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('investor'),
  validateSubmitInterest,
  submitInterest
);

router.get(
  '/sent',
  protect,
  authorizeRoles('investor'),
  getSentInterests
);

router.get(
  '/received',
  protect,
  authorizeRoles('founder'),
  getReceivedInterests
);

router.patch(
  '/:id/status',
  protect,
  authorizeRoles('founder'),
  validateUpdateStatus,
  updateInterestStatus
);

module.exports = router;
