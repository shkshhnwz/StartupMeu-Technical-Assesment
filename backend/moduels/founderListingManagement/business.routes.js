const express = require('express');
const router = express.Router();

const {
  createListing,
  getMine,
  getListingById,
  updateListing,
  deleteListing
} = require('./business.controller');

const { validateCreateBusiness, validateUpdateBusiness } = require('./business.validator');
const { protect, authorizeRoles, optionalAuth } = require('../Authorization');
const { getPublicOpportunities } = require('../OpportunityDiscovery');

// 1. Fixed & public collection routes (Registered first to avoid collisions with /:id)
router.get('/', getPublicOpportunities);
router.post('/', protect, authorizeRoles('founder'), validateCreateBusiness, createListing);
router.get('/mine', protect, authorizeRoles('founder'), getMine);

// 2. Dynamic ID routes
router.get('/:id', optionalAuth, getListingById);
router.patch('/:id', protect, authorizeRoles('founder'), validateUpdateBusiness, updateListing);
router.delete('/:id', protect, authorizeRoles('founder'), deleteListing);

module.exports = router;
