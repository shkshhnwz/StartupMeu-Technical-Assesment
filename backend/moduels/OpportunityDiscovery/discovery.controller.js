const Business = require('../founderListingManagement/Business.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/**
 * Helper to escape regex special characters to prevent ReDoS / injection
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Get all published business opportunities with multi-filter, search & pagination
 * @route   GET /api/businesses OR GET /api/opportunities
 * @access  Public
 */
const getPublicOpportunities = async (req, res, next) => {
  try {
    const {
      search,
      industry,
      stage,
      location,
      minFunding,
      maxFunding,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Strict baseline: only published & non-deleted listings
    const query = {
      status: 'published',
      deletedAt: null
    };

    // Filter by industry
    if (industry && typeof industry === 'string' && industry !== 'All') {
      query.industry = industry;
    }

    // Filter by stage
    if (stage && typeof stage === 'string' && stage !== 'All') {
      query.stage = stage;
    }

    // Filter by location (safe substring match)
    if (location && typeof location === 'string' && location.trim()) {
      const escapedLocation = escapeRegex(location.trim());
      query.location = { $regex: escapedLocation, $options: 'i' };
    }

    // Filter by funding required range
    if (minFunding !== undefined || maxFunding !== undefined) {
      query.fundingRequired = {};
      if (minFunding !== undefined && !isNaN(Number(minFunding))) {
        query.fundingRequired.$gte = Math.max(0, Number(minFunding));
      }
      if (maxFunding !== undefined && !isNaN(Number(maxFunding))) {
        query.fundingRequired.$lte = Math.max(0, Number(maxFunding));
      }
      // Clean up if empty
      if (Object.keys(query.fundingRequired).length === 0) {
        delete query.fundingRequired;
      }
    }

    // Safe keyword search against businessName, tagline, and description
    if (search && typeof search === 'string' && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      query.$or = [
        { businessName: { $regex: safeSearch, $options: 'i' } },
        { tagline: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    // Bounded pagination parameters (PRD §7: max limit 50, default 12)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Sorting options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'fundingAsc') {
      sortOptions = { fundingRequired: 1 };
    } else if (sort === 'fundingDesc') {
      sortOptions = { fundingRequired: -1 };
    }

    // Execute queries in parallel for high performance
    const [businesses, total] = await Promise.all([
      Business.find(query)
        .populate('owner', 'name') // Privacy: only disclose founder public display name
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Business.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return sendSuccess(res, 200, 'Opportunities retrieved successfully', {
      businesses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public published opportunity details by ID
 * @route   GET /api/opportunities/:id
 * @access  Public
 */
const getPublicOpportunityById = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      status: 'published',
      deletedAt: null
    }).populate('owner', 'name'); // Safe public exposure only

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Opportunity not found or is no longer published');
    }

    return sendSuccess(res, 200, 'Opportunity retrieved successfully', {
      business
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicOpportunities,
  getPublicOpportunityById
};
