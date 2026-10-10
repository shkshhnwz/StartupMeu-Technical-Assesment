import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { discoveryService } from '../services/discoveryService';
import { ArrowLeft, MapPin, DollarSign, Globe, Building, User, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInvestor } = useAuth();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchOpportunity = async () => {
      setLoading(true);
      try {
        const data = await discoveryService.getOpportunityById(id);
        if (isMounted) {
          setBusiness(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Opportunity not found or is no longer published');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOpportunity();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleExpressInterestClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/opportunities/${id}` } } });
    } else if (!isInvestor) {
      alert('Only registered investors can express interest in funding opportunities.');
    } else {
      // Future Feature 4 Modal trigger or prompt
      alert(`Interest workflow ready for Feature 4! You will be able to express interest in ${business.businessName}.`);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner-clean"></div>
        <p>Loading opportunity details...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Opportunity Not Available</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            {error || 'This business listing is either in draft mode, deleted, or does not exist.'}
          </p>
          <Link to="/opportunities" className="btn-primary-pill" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ paddingBottom: '6rem' }}>
      <div className="section-container" style={{ paddingTop: '3rem', maxWidth: '960px' }}>
        {/* Breadcrumb Navigation */}
        <Link
          to="/opportunities"
          className="btn-secondary-pill"
          style={{ width: 'fit-content', marginBottom: '2rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Back to All Opportunities
        </Link>

        {/* Hero Listing Header Card */}
        <div className="dashboard-hero-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <span className="role-badge badge-founder">{business.industry}</span>
                <span className="role-badge badge-investor">{business.stage} Stage</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#111111', marginBottom: '0.5rem' }}>
                {business.businessName}
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#4A4A4A', lineHeight: 1.5, maxWidth: '750px' }}>
                {business.tagline}
              </p>
            </div>

            <button
              onClick={handleExpressInterestClick}
              className="btn-hero-primary"
              style={{ padding: '0.85rem 1.75rem', textDecoration: 'none' }}
            >
              <Sparkles size={18} /> Express Interest
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.95rem',
              color: '#4A4A4A'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} color="#737373" /> Founder: <strong>{business.owner?.name || 'Verified Entrepreneur'}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="#737373" /> {business.location}
            </span>
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#00A35C', textDecoration: 'none' }}
              >
                <Globe size={16} /> Official Website
              </a>
            )}
          </div>
        </div>

        {/* Highlights & Financials Row */}
        <div className="metrics-row" style={{ marginBottom: '2.5rem' }}>
          <div className="metric-box">
            <div className="metric-icon-bubble" style={{ backgroundColor: '#ECFDF5', color: '#00A35C' }}>
              <DollarSign size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-val" style={{ fontSize: '1.75rem' }}>
                {business.currency} {Number(business.fundingRequired).toLocaleString()}
              </span>
              <span className="metric-desc">Target Funding Amount</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Building size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-val" style={{ fontSize: '1.75rem' }}>
                {business.stage}
              </span>
              <span className="metric-desc">Venture Maturity Stage</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <TrendingUp size={24} />
            </div>
            <div className="metric-data">
              <span className="metric-val" style={{ fontSize: '1.75rem' }}>
                {business.industry}
              </span>
              <span className="metric-desc">Market Sector</span>
            </div>
          </div>
        </div>

        {/* Detailed Business Overview Section */}
        <div className="feature-card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', color: '#111111' }}>
            About the Venture & Growth Thesis
          </h2>
          <div style={{ color: '#333333', fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {business.description}
          </div>
        </div>

        {/* Investor Call to Action Banner */}
        <div
          className="dashboard-hero-card"
          style={{
            backgroundColor: '#FAF9F6',
            borderColor: 'var(--border-medium)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '2rem 2.5rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111111', marginBottom: '0.35rem' }}>
              Interested in connecting with {business.businessName}?
            </h3>
            <p style={{ color: '#737373', fontSize: '0.95rem' }}>
              Express interest directly to open an introductory dialogue with the founder. Contact information is shared only after acceptance.
            </p>
          </div>
          <button onClick={handleExpressInterestClick} className="btn-hero-primary">
            Express Interest Now
          </button>
        </div>
      </div>
    </div>
  );
};
