const Interest = require('./Interest.model');
const Business = require('../founderListingManagement/Business.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const submitInterest = async (req, res, next) => {
  try {
    const { businessId, message } = req.body;

    const business = await Business.findOne({
      _id: businessId,
      status: 'published',
      deletedAt: null
    });

    if (!business) {
      return sendError(
        res,
        404,
        'NOT_FOUND',
        'Business opportunity not found or is no longer accepting interest'
      );
    }

    const existingInterest = await Interest.findOne({
      business: businessId,
      investor: req.user._id
    });

    if (existingInterest) {
      return sendError(
        res,
        409,
        'CONFLICT',
        'You have already expressed interest in this business opportunity',
        { businessId: 'Duplicate interest request' }
      );
    }

    const interest = await Interest.create({
      business: businessId,
      investor: req.user._id,
      message: message || '',
      status: 'pending'
    });

    return sendSuccess(res, 201, 'Interest expressed successfully', {
      interest
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        'CONFLICT',
        'You have already expressed interest in this business opportunity'
      );
    }
    next(error);
  }
};

const getSentInterests = async (req, res, next) => {
  try {
    const interests = await Interest.find({
      investor: req.user._id
    })
      .populate({
        path: 'business',
        select: 'businessName tagline industry stage location fundingRequired currency status deletedAt',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    const sanitizedInterests = interests.map((item) => {
      const obj = item.toObject();
      if (obj.business && obj.business.owner && obj.status !== 'accepted') {
        delete obj.business.owner.email;
      }
      return obj;
    });

    return sendSuccess(res, 200, 'Sent interests retrieved successfully', {
      interests: sanitizedInterests,
      count: sanitizedInterests.length
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedInterests = async (req, res, next) => {
  try {
    const myBusinesses = await Business.find({
      owner: req.user._id,
      deletedAt: null
    }).select('_id');

    const businessIds = myBusinesses.map((b) => b._id);

    const interests = await Interest.find({
      business: { $in: businessIds }
    })
      .populate('business', 'businessName industry stage fundingRequired currency')
      .populate('investor', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Received interest requests retrieved successfully', {
      interests,
      count: interests.length
    });
  } catch (error) {
    next(error);
  }
};

const updateInterestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const interest = await Interest.findById(req.params.id).populate('business');

    if (!interest) {
      return sendError(res, 404, 'NOT_FOUND', 'Interest request not found');
    }

    if (
      !interest.business ||
      interest.business.owner.toString() !== req.user._id.toString()
    ) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Forbidden: Only the owning founder can accept or decline this interest request'
      );
    }

    if (interest.status !== 'pending') {
      return sendError(
        res,
        400,
        'INVALID_TRANSITION',
        `Cannot update status: This request has already been ${interest.status} and cannot be altered`
      );
    }

    interest.status = status;
    interest.reviewedAt = new Date();
    await interest.save();

    return sendSuccess(res, 200, `Interest request ${status} successfully`, {
      interest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInterest,
  getSentInterests,
  getReceivedInterests,
  updateInterestStatus
};
