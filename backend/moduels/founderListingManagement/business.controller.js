const Business = require('./Business.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const createListing = async (req, res, next) => {
  try {
    const listingData = {
      ...req.body,
      owner: req.user._id
    };

    const business = await Business.create(listingData);

    return sendSuccess(res, 201, 'Business listing created successfully', {
      business
    });
  } catch (error) {
    next(error);
  }
};

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

const getListingById = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      deletedAt: null
    }).populate('owner', 'name email role');

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Listing not found or has been removed');
    }

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

const updateListing = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Listing not found or has been removed');
    }

    if (business.owner.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Forbidden: You can only edit business listings that you own'
      );
    }

    Object.assign(business, req.body);
    await business.save();

    return sendSuccess(res, 200, 'Listing updated successfully', {
      business
    });
  } catch (error) {
    next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!business) {
      return sendError(res, 404, 'NOT_FOUND', 'Listing not found or already deleted');
    }

    if (business.owner.toString() !== req.user._id.toString()) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Forbidden: You can only delete business listings that you own'
      );
    }

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
