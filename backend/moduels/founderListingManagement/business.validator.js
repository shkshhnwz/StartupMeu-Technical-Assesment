const { sendError } = require('../../utils/apiResponse');

const ALLOWED_INDUSTRIES = [
  'SaaS',
  'Fintech',
  'Healthtech',
  'E-commerce',
  'AI',
  'Edtech',
  'Cleantech',
  'Enterprise',
  'Consumer',
  'Other'
];

const ALLOWED_STAGES = ['Idea', 'Early Revenue', 'Growth', 'Established'];
const ALLOWED_CURRENCIES = ['INR', 'USD'];
const ALLOWED_STATUSES = ['draft', 'published'];

const isValidUrl = (string) => {
  if (!string) return true;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const validateCreateBusiness = (req, res, next) => {
  const {
    businessName,
    tagline,
    description,
    industry,
    stage,
    location,
    fundingRequired,
    currency,
    website,
    logoUrl,
    status
  } = req.body;

  const fields = {};

  if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
    fields.businessName = 'Business name must be at least 2 characters';
  } else if (businessName.trim().length > 100) {
    fields.businessName = 'Business name cannot exceed 100 characters';
  }

  if (!tagline || typeof tagline !== 'string' || !tagline.trim()) {
    fields.tagline = 'Tagline is required';
  } else if (tagline.trim().length > 160) {
    fields.tagline = 'Tagline cannot exceed 160 characters';
  }

  if (!description || typeof description !== 'string' || description.trim().length < 50) {
    fields.description = 'Description must be at least 50 characters';
  } else if (description.trim().length > 3000) {
    fields.description = 'Description cannot exceed 3000 characters';
  }

  if (!industry || !ALLOWED_INDUSTRIES.includes(industry)) {
    fields.industry = `Industry must be one of: ${ALLOWED_INDUSTRIES.join(', ')}`;
  }

  if (!stage || !ALLOWED_STAGES.includes(stage)) {
    fields.stage = `Stage must be one of: ${ALLOWED_STAGES.join(', ')}`;
  }

  if (!location || typeof location !== 'string' || !location.trim()) {
    fields.location = 'Location is required (e.g. San Francisco, US or Bengaluru, IN)';
  }

  const funding = Number(fundingRequired);
  if (isNaN(funding) || funding <= 0) {
    fields.fundingRequired = 'Funding required must be a positive number';
  }

  if (currency && !ALLOWED_CURRENCIES.includes(currency)) {
    fields.currency = 'Currency must be INR or USD';
  }

  if (website && !isValidUrl(website)) {
    fields.website = 'Website must be a valid URL (e.g. https://example.com)';
  }

  if (logoUrl && !isValidUrl(logoUrl)) {
    fields.logoUrl = 'Logo URL must be a valid URL';
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    fields.status = 'Status must be draft or published';
  }

  if (Object.keys(fields).length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please check your listing details', fields);
  }

  req.body.businessName = businessName.trim();
  req.body.tagline = tagline.trim();
  req.body.description = description.trim();
  req.body.location = location.trim();
  req.body.fundingRequired = funding;
  req.body.currency = currency || 'USD';
  req.body.status = status || 'draft';
  req.body.website = website ? website.trim() : null;
  req.body.logoUrl = logoUrl ? logoUrl.trim() : null;

  next();
};

const validateUpdateBusiness = (req, res, next) => {
  const {
    businessName,
    tagline,
    description,
    industry,
    stage,
    location,
    fundingRequired,
    currency,
    website,
    logoUrl,
    status
  } = req.body;

  const fields = {};

  if (businessName !== undefined) {
    if (typeof businessName !== 'string' || businessName.trim().length < 2) {
      fields.businessName = 'Business name must be at least 2 characters';
    } else if (businessName.trim().length > 100) {
      fields.businessName = 'Business name cannot exceed 100 characters';
    } else {
      req.body.businessName = businessName.trim();
    }
  }

  if (tagline !== undefined) {
    if (typeof tagline !== 'string' || !tagline.trim()) {
      fields.tagline = 'Tagline is required';
    } else if (tagline.trim().length > 160) {
      fields.tagline = 'Tagline cannot exceed 160 characters';
    } else {
      req.body.tagline = tagline.trim();
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 50) {
      fields.description = 'Description must be at least 50 characters';
    } else if (description.trim().length > 3000) {
      fields.description = 'Description cannot exceed 3000 characters';
    } else {
      req.body.description = description.trim();
    }
  }

  if (industry !== undefined && !ALLOWED_INDUSTRIES.includes(industry)) {
    fields.industry = `Industry must be one of: ${ALLOWED_INDUSTRIES.join(', ')}`;
  }

  if (stage !== undefined && !ALLOWED_STAGES.includes(stage)) {
    fields.stage = `Stage must be one of: ${ALLOWED_STAGES.join(', ')}`;
  }

  if (location !== undefined) {
    if (typeof location !== 'string' || !location.trim()) {
      fields.location = 'Location is required';
    } else {
      req.body.location = location.trim();
    }
  }

  if (fundingRequired !== undefined) {
    const funding = Number(fundingRequired);
    if (isNaN(funding) || funding <= 0) {
      fields.fundingRequired = 'Funding required must be a positive number';
    } else {
      req.body.fundingRequired = funding;
    }
  }

  if (currency !== undefined && !ALLOWED_CURRENCIES.includes(currency)) {
    fields.currency = 'Currency must be INR or USD';
  }

  if (website !== undefined && website !== null && website !== '') {
    if (!isValidUrl(website)) {
      fields.website = 'Website must be a valid URL';
    } else {
      req.body.website = website.trim();
    }
  } else if (website === '') {
    req.body.website = null;
  }

  if (logoUrl !== undefined && logoUrl !== null && logoUrl !== '') {
    if (!isValidUrl(logoUrl)) {
      fields.logoUrl = 'Logo URL must be a valid URL';
    } else {
      req.body.logoUrl = logoUrl.trim();
    }
  } else if (logoUrl === '') {
    req.body.logoUrl = null;
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    fields.status = 'Status must be draft or published';
  }

  delete req.body.owner;
  delete req.body.deletedAt;
  delete req.body._id;

  if (Object.keys(fields).length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please check your listing details', fields);
  }

  next();
};

module.exports = {
  validateCreateBusiness,
  validateUpdateBusiness,
  ALLOWED_INDUSTRIES,
  ALLOWED_STAGES,
  ALLOWED_CURRENCIES
};
