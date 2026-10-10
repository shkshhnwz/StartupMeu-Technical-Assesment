const Business = require('../founderListingManagement/Business.model');
const Interest = require('../investorInterestWorkflow/Interest.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/**
 * @desc    Get founder dashboard summary metrics and recent activity
 * @route   GET /api/dashboard/founder
 * @access  Founder only
 */
const getFounderDashboardSummary = async (req, res, next) => {
  try {
    const founderId = req.user._id;

    // 1. Fetch businesses owned by this founder (excluding soft-deleted)
    const businesses = await Business.find({
      owner: founderId,
      deletedAt: null
    }).select('_id status');

    const totalListings = businesses.length;
    const publishedListings = businesses.filter((b) => b.status === 'published').length;
    const draftListings = businesses.filter((b) => b.status === 'draft').length;

    const businessIds = businesses.map((b) => b._id);

    // 2. Fetch interest stats across founder's businesses
    const interests = await Interest.find({
      business: { $in: businessIds }
    }).select('status createdAt');

    const totalInterests = interests.length;
    const pendingInterests = interests.filter((i) => i.status === 'pending').length;
    const acceptedInterests = interests.filter((i) => i.status === 'accepted').length;
    const declinedInterests = interests.filter((i) => i.status === 'declined').length;

    // 3. Fetch up to 5 most recent inbound interest requests
    const recentInterests = await Interest.find({
      business: { $in: businessIds }
    })
      .populate('business', 'businessName industry stage fundingRequired currency')
      .populate('investor', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, 200, 'Founder dashboard summary retrieved successfully', {
      metrics: {
        totalListings,
        publishedListings,
        draftListings,
        totalInterests,
        pendingInterests,
        acceptedInterests,
        declinedInterests
      },
      recentInterests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get investor dashboard summary metrics and recent pipeline activity
 * @route   GET /api/dashboard/investor
 * @access  Investor only
 */
const getInvestorDashboardSummary = async (req, res, next) => {
  try {
    const investorId = req.user._id;

    // 1. Fetch all interests sent by this investor
    const interests = await Interest.find({
      investor: investorId
    }).select('status createdAt');

    const totalSent = interests.length;
    const pendingCount = interests.filter((i) => i.status === 'pending').length;
    const acceptedCount = interests.filter((i) => i.status === 'accepted').length;
    const declinedCount = interests.filter((i) => i.status === 'declined').length;

    // 2. Fetch up to 5 most recent sent interests
    const recentInterests = await Interest.find({
      investor: investorId
    })
      .populate({
        path: 'business',
        select: 'businessName tagline industry stage location fundingRequired currency status',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Privacy rule: Only reveal founder contact email if status is accepted
    const sanitizedRecent = recentInterests.map((item) => {
      const obj = item.toObject();
      if (obj.business && obj.business.owner && obj.status !== 'accepted') {
        delete obj.business.owner.email;
      }
      return obj;
    });

    return sendSuccess(res, 200, 'Investor dashboard summary retrieved successfully', {
      metrics: {
        totalSent,
        pendingCount,
        acceptedCount,
        declinedCount
      },
      recentInterests: sanitizedRecent
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFounderDashboardSummary,
  getInvestorDashboardSummary
};
