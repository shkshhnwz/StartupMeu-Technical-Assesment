const express = require('express');
const router = express.Router();

const {
  getPublicOpportunities,
  getPublicOpportunityById
} = require('./discovery.controller');

router.get('/', getPublicOpportunities);
router.get('/:id', getPublicOpportunityById);

module.exports = router;
