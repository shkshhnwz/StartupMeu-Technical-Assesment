const Business = require('./Business.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/**
 * @desc    Create a new business listing (draft or published)
 * @route   POST /api/businesses
 * @access  Founder only
 */
const createListing = async (req, res, next) => {
  try {
    const listingData = {
      ...req.body,
      owner: req.user._id // Server-assigned authenticated founder ID
    };

    const business = await Business.create(listingData);

    return sendSuccess(res, 201, 'Business listing created successfully', {
      business
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all listings owned by the logged-in founder (including drafts)
 * @route   GET /api/businesses/mine
 * @access  Founder only
 */
const getMine = async (req, res, next) => {
  try {
    const businesses = await Business.find({
      owner: req.user._id,
      deletedAt: null
    }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Founder listings retrieved', {
      businesses,
      count: businesses.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get listing details by ID
 * @route   GET /api/businesses/:id
 * @access  Public for published listings / Owner only for drafts
 */
const getListingById = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      deletedAt: null
    }).populate('owner', 'name email role');

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Listing not found or has been removed');
    }

    // If listing is a draft, only the owning founder can view it
    if (business.status === 'draft') {
      const isOwner = req.user && business.owner._id.toString() === req.user._id.toString();
      if (!isOwner) {
        return sendError(res, 404, 'NOT_FOUND', 'Listing not found or has been removed');
      }
    }

    return sendSuccess(res, 200, 'Listing retrieved', {
      business
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing listing owned by founder
 * @route   PATCH /api/businesses/:id
 * @access  Owner Founder only
 */
const updateListing = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Listing not found or has been removed');
    }

    // Ownership check
    if (business.owner.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Forbidden: You can only edit business listings that you own'
      );
    }

    // Apply validated updates
    Object.assign(business, req.body);
    await business.save();

    return sendSuccess(res, 200, 'Listing updated successfully', {
      business
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete a listing owned by founder
 * @route   DELETE /api/businesses/:id
 * @access  Owner Founder only
 */
const deleteListing = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Listing not found or already deleted');
    }

    // Ownership check
    if (business.owner.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Forbidden: You can only delete business listings that you own'
      );
    }

    // Soft delete
    business.deletedAt = new Date();
    await business.save();

    return sendSuccess(res, 200, 'Listing deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getMine,
  getListingById,
  updateListing,
  deleteListing
};
