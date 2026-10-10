const discoveryRoutes = require('./discovery.routes');
const { getPublicOpportunities, getPublicOpportunityById } = require('./discovery.controller');

module.exports = {
  discoveryRoutes,
  getPublicOpportunities,
  getPublicOpportunityById
};
