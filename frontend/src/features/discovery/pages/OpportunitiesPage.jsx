import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { discoveryService } from '../services/discoveryService';
import { Search, Filter, MapPin, DollarSign, ArrowRight, RotateCcw, ChevronLeft, ChevronRight, Briefcase, Globe, User } from 'lucide-react';

const INDUSTRIES = [
  'All',
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

const STAGES = ['All', 'Idea', 'Early Revenue', 'Growth', 'Established'];

export const OpportunitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const industry = searchParams.get('industry') || 'All';
  const stage = searchParams.get('stage') || 'All';
  const location = searchParams.get('location') || '';
  const minFunding = searchParams.get('minFunding') || '';
  const maxFunding = searchParams.get('maxFunding') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [locationInput, setLocationInput] = useState(location);

  useEffect(() => {
    setSearchInput(search);
    setLocationInput(location);
  }, [search, location]);

  useEffect(() => {
    let isMounted = true;
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sort
        };
        if (search) params.search = search;
        if (industry && industry !== 'All') params.industry = industry;
        if (stage && stage !== 'All') params.stage = stage;
        if (location) params.location = location;
        if (minFunding) params.minFunding = minFunding;
        if (maxFunding) params.maxFunding = maxFunding;

        const data = await discoveryService.getOpportunities(params);
        if (isMounted) {
          setBusinesses(data.businesses || []);
          setPagination(data.pagination || {});
        }
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchListings();
    return () => {
      isMounted = false;
    };
  }, [search, industry, stage, location, minFunding, maxFunding, sort, page]);

  const updateParam = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    Object.keys(merged).forEach((key) => {
      if (!merged[key] || merged[key] === 'All' || (key === 'page' && merged[key] === 1)) {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam({ search: searchInput.trim(), location: locationInput.trim(), page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateParam({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(location) ||
    industry !== 'All' ||
    stage !== 'All' ||
    Boolean(minFunding) ||
    Boolean(maxFunding);

  return (
    <div className="home-page" style={{ paddingBottom: '5rem' }}>
      <section className="section-container" style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
          <p className="section-pretitle">Explore Verified Startups</p>
          <h1 className="section-title" style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>
            Opportunity Discovery
          </h1>
          <p className="hero-description" style={{ fontSize: '1.05rem' }}>
            Discover and connect with vetted startups actively raising capital. Filter by industry, growth stage, location, and funding required.
          </p>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%', padding: '1.75rem', marginBottom: '2.5rem' }}>
          <form onSubmit={handleSearchSubmit}>
            <div className="form-row" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="search-input">Search Keywords</label>
                <div className="input-container">
                  <Search className="input-icon" size={18} />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search by company name, technology, problem..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location-input">Location</label>
                <div className="input-container">
                  <MapPin className="input-icon" size={18} />
                  <input
                    id="location-input"
                    type="text"
                    placeholder="e.g. San Francisco, US or London, UK"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                alignItems: 'flex-end'
              }}
            >
              <div className="form-group">
                <label htmlFor="industry-filter">Industry</label>
                <select
                  id="industry-filter"
                  value={industry}
                  onChange={(e) => updateParam({ industry: e.target.value, page: 1 })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-medium)',
                    background: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind === 'All' ? 'All Industries' : ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stage-filter">Stage</label>
                <select
                  id="stage-filter"
                  value={stage}
                  onChange={(e) => updateParam({ stage: e.target.value, page: 1 })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-medium)',
                    background: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                >
                  {STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg === 'All' ? 'All Stages' : stg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sort-filter">Sort By</label>
                <select
                  id="sort-filter"
                  value={sort}
                  onChange={(e) => updateParam({ sort: e.target.value, page: 1 })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-medium)',
                    background: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="fundingAsc">Funding (Low to High)</option>
                  <option value="fundingDesc">Funding (High to Low)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-hero-primary" style={{ padding: '0.65rem 1.25rem', flex: 1 }}>
                  Apply
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="btn-demo-pill"
                    title="Reset all filters"
                  >
                    <RotateCcw size={14} /> Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.95rem', color: '#4A4A4A', fontWeight: 600 }}>
            Showing <strong>{businesses.length}</strong> of <strong>{pagination.total || 0}</strong> published opportunities
          </p>
          {hasActiveFilters && (
            <span style={{ fontSize: '0.85rem', color: '#00A35C', fontWeight: 600 }}>
              Active Filters Applied
            </span>
          )}
        </div>

        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner-clean"></div>
            <p>Searching published opportunities...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="empty-placeholder-card">
            <Briefcase size={44} color="#A3A3A3" />
            <h3>No opportunities match your search</h3>
            <p>
              We couldn't find any published startup profiles matching your selected criteria. Try adjusting your search keywords, industry, or stage filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-primary-pill"
              style={{ marginTop: '0.5rem' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {businesses.map((biz) => (
              <div
                key={biz._id}
                className="feature-card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className="role-badge badge-founder">{biz.industry}</span>
                    <span className="role-badge badge-investor">{biz.stage}</span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem', color: '#111111' }}>
                    {biz.businessName}
                  </h3>
                  <p style={{ color: '#4A4A4A', fontSize: '0.925rem', fontWeight: 500, marginBottom: '0.85rem' }}>
                    {biz.tagline}
                  </p>

                  <p style={{ color: '#737373', fontSize: '0.875rem', lineHeight: 1.55 }}>
                    {biz.description.length > 140 ? `${biz.description.substring(0, 140)}...` : biz.description}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 0',
                      borderTop: '1px solid var(--border-light)',
                      borderBottom: '1px solid var(--border-light)',
                      marginBottom: '1rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#737373' }}>
                      <MapPin size={14} /> {biz.location}
                    </span>
                    <span style={{ fontWeight: 800, color: '#111111', fontSize: '0.95rem' }}>
                      {biz.currency} {Number(biz.fundingRequired).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#737373' }}>
                      <User size={14} />
                      <span>{biz.owner?.name || 'Verified Founder'}</span>
                    </div>

                    <Link
                      to={`/opportunities/${biz._id}`}
                      className="btn-demo-pill"
                      style={{ textDecoration: 'none', padding: '0.4rem 0.85rem', fontWeight: 600 }}
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '3.5rem'
            }}
          >
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-secondary-pill"
              style={{ padding: '0.5rem 1rem' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: '#4A4A4A', fontWeight: 600 }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="btn-secondary-pill"
              style={{ padding: '0.5rem 1rem' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
