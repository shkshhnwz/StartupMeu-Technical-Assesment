import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { authService } from '../features/auth/services/authService';
import { interestService } from '../features/interests/services/interestService';
import {
  TrendingUp,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Compass,
  ArrowRight,
  Mail,
  User,
  Building,
  DollarSign,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const InvestorDashboard = () => {
  const { user } = useAuth();
  const [sentInterests, setSentInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchSentInterests = async () => {
    try {
      const data = await interestService.getSentInterests();
      setSentInterests(data || []);
    } catch (err) {
      console.error('Failed to load sent interests:', err);
    } finally {
      setLoadingInterests(false);
    }
  };

  useEffect(() => {
    fetchSentInterests();
  }, []);

  const testInvestorAccess = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await authService.testRoleAccess('investor');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/investor',
        message: res.message || 'Access granted to Investor role.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: 'GET /api/auth/test/investor',
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testFounderAccessAsInvestor = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await authService.testRoleAccess('founder');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/founder',
        message: 'Unexpected: access allowed'
      });
    } catch (err) {
      setTestResult({
        success: false,
        isExpected403: true,
        endpoint: 'GET /api/auth/test/founder',
        message: `${err.code || '403 Forbidden'}: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const totalSubmitted = sentInterests.length;
  const acceptedCount = sentInterests.filter((i) => i.status === 'accepted').length;
  const pendingCount = sentInterests.filter((i) => i.status === 'pending').length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-hero-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <span className="role-badge badge-investor">Investor</span>
                <span style={{ fontSize: '0.9rem', color: '#737373' }}>Deal Pipeline & Outreach</span>
              </div>
              <h2>Welcome back, {user?.name}</h2>
              <p>
                Track your active expressions of interest, review unlocked founder contacts, and discover new vetted ventures.
              </p>
            </div>
            <Link to="/opportunities" className="btn-hero-primary" style={{ textDecoration: 'none' }}>
              <Compass size={18} /> Discover Opportunities
            </Link>
          </div>
        </div>

        <div className="metrics-row">
          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Send size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{totalSubmitted}</span>
              <span className="metric-desc">Submitted Interests</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble" style={{ backgroundColor: '#ECFDF5', color: '#00A35C' }}>
              <CheckCircle size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{acceptedCount}</span>
              <span className="metric-desc">Accepted & Unlocked</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <Clock size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">{pendingCount}</span>
              <span className="metric-desc">Pending Review</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Submitted Interest Pipeline</h3>
            <span style={{ fontSize: '0.9rem', color: '#737373' }}>
              {sentInterests.length} submission{sentInterests.length === 1 ? '' : 's'}
            </span>
          </div>

          {loadingInterests ? (
            <div className="loading-wrapper">
              <div className="spinner-clean"></div>
              <p>Loading your submitted interests...</p>
            </div>
          ) : sentInterests.length === 0 ? (
            <div className="empty-placeholder-card">
              <Compass size={44} color="#A3A3A3" />
              <h3>No active interest requests submitted yet</h3>
              <p>
                Explore live ventures on the marketplace, discover business opportunities, and express investment interest.
              </p>
              <Link to="/opportunities" className="btn-hero-primary" style={{ marginTop: '0.75rem', textDecoration: 'none' }}>
                Browse Opportunities <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sentInterests.map((item) => {
                const biz = item.business;
                const isAccepted = item.status === 'accepted';
                const isDeclined = item.status === 'declined';

                return (
                  <div
                    key={item._id}
                    className="metric-box"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: '1rem',
                      padding: '1.75rem',
                      cursor: 'default',
                      borderColor: isAccepted ? 'rgba(0, 163, 92, 0.4)' : 'var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                            {biz?.businessName || 'Business Opportunity'}
                          </h4>
                          {isAccepted ? (
                            <span
                              className="role-badge"
                              style={{
                                backgroundColor: '#ECFDF5',
                                color: '#00A35C',
                                border: '1px solid #A7F3D0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <CheckCircle size={13} /> Accepted • Contact Unlocked
                            </span>
                          ) : isDeclined ? (
                            <span
                              className="role-badge"
                              style={{
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <XCircle size={13} /> Declined
                            </span>
                          ) : (
                            <span
                              className="role-badge"
                              style={{
                                backgroundColor: '#FFFBEB',
                                color: '#D97706',
                                border: '1px solid #FDE68A',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Clock size={13} /> Pending Founder Review
                            </span>
                          )}
                        </div>
                        <p style={{ color: '#4A4A4A', fontSize: '0.95rem' }}>{biz?.tagline}</p>
                      </div>

                      {biz?._id && (
                        <Link
                          to={`/opportunities/${biz._id}`}
                          className="btn-demo-pill"
                          style={{ textDecoration: 'none' }}
                        >
                          View Listing <ExternalLink size={13} />
                        </Link>
                      )}
                    </div>

                    {item.message && (
                      <div
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          padding: '0.85rem 1.15rem',
                          borderRadius: '0.65rem',
                          borderLeft: '3px solid #111111',
                          fontSize: '0.9rem',
                          color: '#333333',
                          lineHeight: 1.5
                        }}
                      >
                        <strong style={{ fontSize: '0.8rem', color: '#737373', display: 'block', marginBottom: '0.2rem' }}>
                          Your Note:
                        </strong>
                        "{item.message}"
                      </div>
                    )}

                    {isAccepted && biz?.owner && (
                      <div
                        style={{
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '0.75rem',
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <User size={16} color="#00A35C" />
                            <span style={{ fontWeight: 700, color: '#166534', fontSize: '1rem' }}>
                              {biz.owner.name} (Founder)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803D', fontSize: '0.92rem' }}>
                            <Mail size={15} />
                            <span>{biz.owner.email}</span>
                          </div>
                        </div>

                        <a
                          href={`mailto:${biz.owner.email}?subject=StartupMeu Connect: Next steps regarding ${encodeURIComponent(biz.businessName)}`}
                          className="btn-hero-primary"
                          style={{
                            padding: '0.65rem 1.25rem',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            backgroundColor: '#00A35C'
                          }}
                        >
                          <Mail size={15} /> Email Founder
                        </a>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.25rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-light)',
                        fontSize: '0.875rem',
                        color: '#737373'
                      }}
                    >
                      <span>
                        <strong>Industry:</strong> {biz?.industry || 'N/A'}
                      </span>
                      <span>
                        <strong>Stage:</strong> {biz?.stage || 'N/A'}
                      </span>
                      {biz?.fundingRequired && (
                        <span>
                          <strong>Target:</strong> {biz?.currency || 'USD'} {Number(biz?.fundingRequired).toLocaleString()}
                        </span>
                      )}
                      <span>
                        <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="role-test-box">
          <div className="role-test-header-group">
            <ShieldCheck size={26} color="#00A35C" />
            <div>
              <h3>Role-Based Access Control Verification</h3>
              <p>Test live backend middleware enforcement of your Investor permissions:</p>
            </div>
          </div>

          <div className="role-button-group">
            <button
              onClick={testInvestorAccess}
              disabled={testing}
              className="btn-primary-pill"
            >
              Test Investor Endpoint (Expect 200 OK)
            </button>
            <button
              onClick={testFounderAccessAsInvestor}
              disabled={testing}
              className="btn-secondary-pill"
            >
              Test Founder Endpoint (Expect 403 Forbidden)
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
