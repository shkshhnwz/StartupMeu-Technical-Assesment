import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { authService } from '../features/auth/services/authService';
import { businessService } from '../features/listings/services/businessService';
import { Briefcase, CheckCircle, ShieldCheck, ShieldAlert, Plus, Edit2, Trash2, Globe, MapPin, DollarSign, Layers } from 'lucide-react';

export const FounderDashboard = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchListings = async () => {
    try {
      const data = await businessService.getMine();
      setBusinesses(data || []);
    } catch (err) {
      console.error('Failed to load founder listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDeleteListing = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await businessService.delete(id);
        setBusinesses((prev) => prev.filter((b) => b._id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete listing');
      }
    }
  };

  const testFounderAccess = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await authService.testRoleAccess('founder');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/founder',
        message: res.message || 'Access granted to Founder role.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: 'GET /api/auth/test/founder',
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testInvestorAccessAsFounder = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await authService.testRoleAccess('investor');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/investor',
        message: 'Unexpected: access allowed'
      });
    } catch (err) {
      setTestResult({
        success: false,
        isExpected403: true,
        endpoint: 'GET /api/auth/test/investor',
        message: `${err.code || '403 Forbidden'}: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const publishedCount = businesses.filter((b) => b.status === 'published').length;
  const draftCount = businesses.filter((b) => b.status === 'draft').length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Header Card */}
        <div className="dashboard-hero-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <span className="role-badge badge-founder">Founder</span>
                <span style={{ fontSize: '0.9rem', color: '#737373' }}>Workspace Overview</span>
              </div>
              <h2>Welcome back, {user?.name}</h2>
              <p>
                Manage your venture listings, monitor incoming interest, and present your business to investors.
              </p>
            </div>
            <Link to="/founder/listings/new" className="btn-hero-primary" style={{ textDecoration: 'none' }}>
              <Plus size={18} /> Create New Opportunity
            </Link>
          </div>
        </div>

        {/* Dynamic Metrics Row */}
        <div className="metrics-row">
          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Briefcase size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{publishedCount}</span>
              <span className="metric-desc">Published Opportunities</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Layers size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{draftCount}</span>
              <span className="metric-desc">Draft Ventures</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <CheckCircle size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{businesses.length}</span>
              <span className="metric-desc">Total Listings</span>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Your Business Opportunities</h3>
            <span style={{ fontSize: '0.9rem', color: '#737373' }}>
              {businesses.length} listing{businesses.length === 1 ? '' : 's'} found
            </span>
          </div>

          {loadingListings ? (
            <div className="loading-wrapper">
              <div className="spinner-clean"></div>
              <p>Loading your listings...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="empty-placeholder-card">
              <Briefcase size={44} color="#A3A3A3" />
              <h3>No listings created yet</h3>
              <p>
                Ready to showcase your business? Create your first funding opportunity profile to start connecting with investors.
              </p>
              <Link to="/founder/listings/new" className="btn-primary-pill" style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Create Your First Listing
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {businesses.map((biz) => (
                <div
                  key={biz._id}
                  className="metric-box"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '1rem',
                    padding: '1.75rem',
                    cursor: 'default'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{biz.businessName}</h4>
                        <span
                          className={`role-badge ${biz.status === 'published' ? 'badge-founder' : 'badge-investor'}`}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {biz.status}
                        </span>
                      </div>
                      <p style={{ color: '#4A4A4A', fontSize: '0.95rem' }}>{biz.tagline}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/founder/listings/${biz._id}/edit`}
                        className="btn-demo-pill"
                        title="Edit listing"
                      >
                        <Edit2 size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(biz._id, biz.businessName)}
                        className="btn-demo-pill"
                        style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        title="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {biz.description.length > 200 ? `${biz.description.substring(0, 200)}...` : biz.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem', color: '#4A4A4A' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <strong>Industry:</strong> {biz.industry}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <strong>Stage:</strong> {biz.stage}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} color="#737373" /> {biz.location}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#111111', fontWeight: 700 }}>
                      <DollarSign size={15} color="#00A35C" />
                      {biz.currency} {Number(biz.fundingRequired).toLocaleString()}
                    </span>
                    {biz.website && (
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#00A35C', textDecoration: 'none' }}
                      >
                        <Globe size={15} /> Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Role-Based Authorization Verification Panel */}
        <div className="role-test-box">
          <div className="role-test-header-group">
            <ShieldCheck size={26} color="#00A35C" />
            <div>
              <h3>Role-Based Access Control Verification</h3>
              <p>Test live backend middleware enforcement of your Founder permissions:</p>
            </div>
          </div>

          <div className="role-button-group">
            <button
              onClick={testFounderAccess}
              disabled={testing}
              className="btn-primary-pill"
            >
              Test Founder Endpoint (Expect 200 OK)
            </button>
            <button
              onClick={testInvestorAccessAsFounder}
              disabled={testing}
              className="btn-secondary-pill"
            >
              Test Investor Endpoint (Expect 403 Forbidden)
            </button>
          </div>

          {testResult && (
            <div className={`test-outcome-panel ${testResult.isExpected403 || testResult.success ? 'pass' : 'fail'}`}>
              <div className="test-outcome-title">
                {testResult.isExpected403 ? (
                  <>
                    <ShieldCheck size={16} /> Enforced Role Check: Server Blocked Wrong Role (403 Forbidden)
                  </>
                ) : testResult.success ? (
                  <>
                    <CheckCircle size={16} /> Permission Verified: 200 OK
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} /> Error
                  </>
                )}
              </div>
              <code>{testResult.endpoint}</code>
              <p style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>{testResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
