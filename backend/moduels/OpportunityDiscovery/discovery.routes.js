const express = require('express');
const router = express.Router();

const {
  getPublicOpportunities,
  getPublicOpportunityById
} = require('./discovery.controller');

// Public opportunity discovery routes
router.get('/', getPublicOpportunities);
router.get('/:id', getPublicOpportunityById);

module.exports = router;
