import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interestService } from '../services/interestService';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Check,
  X,
  ArrowLeft,
  Building,
  Filter,
  Search
} from 'lucide-react';

export const FounderInterestsPage = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // all, pending, accepted, declined
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const data = await interestService.getReceivedInterests();
      setInterests(data || []);
    } catch (err) {
      console.error('Failed to load received interests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const handleUpdateStatus = async (interestId, newStatus, investorName) => {
    setActionLoadingId(interestId);
    try {
      await interestService.updateInterestStatus(interestId, newStatus);
      setInterests((prev) =>
        prev.map((item) =>
          item._id === interestId ? { ...item, status: newStatus, reviewedAt: new Date() } : item
        )
      );
      setToastMessage(
        newStatus === 'accepted'
          ? `Accepted request from ${investorName}. Your contact info has been shared!`
          : `Declined request from ${investorName}.`
      );
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert(err.message || `Failed to update status`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredInterests = interests.filter((item) => {
    if (filterTab !== 'all' && item.status !== filterTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const investorName = (item.investor?.name || '').toLowerCase();
      const investorEmail = (item.investor?.email || '').toLowerCase();
      const bizName = (item.business?.businessName || '').toLowerCase();
      return investorName.includes(q) || investorEmail.includes(q) || bizName.includes(q);
    }
    return true;
  });

  const pendingCount = interests.filter((i) => i.status === 'pending').length;
  const acceptedCount = interests.filter((i) => i.status === 'accepted').length;
  const declinedCount = interests.filter((i) => i.status === 'declined').length;

  return (
    <div className="dashboard-page" style={{ paddingBottom: '6rem' }}>
      <div className="dashboard-container" style={{ maxWidth: '1000px' }}>
        {/* Breadcrumb Back Link */}
        <Link
          to="/founder/dashboard"
          className="btn-secondary-pill"
          style={{ width: 'fit-content', textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Hero Header */}
        <div className="dashboard-hero-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="role-badge badge-founder">Founder Workspace</span>
            <span style={{ fontSize: '0.9rem', color: '#737373' }}>Investor Outreach Pipeline</span>
          </div>
          <h2>Inbound Investor Expressions of Interest</h2>
          <p>
            Review and respond to interest inquiries from qualified investors. Accepting an inquiry unlocks your direct contact information for one-on-one dialogues.
          </p>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-light)'
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterTab('all')}
              className={filterTab === 'all' ? 'btn-primary-pill' : 'btn-secondary-pill'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              All ({interests.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={filterTab === 'pending' ? 'btn-primary-pill' : 'btn-secondary-pill'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('accepted')}
              className={filterTab === 'accepted' ? 'btn-primary-pill' : 'btn-secondary-pill'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Accepted ({acceptedCount})
            </button>
            <button
              onClick={() => setFilterTab('declined')}
              className={filterTab === 'declined' ? 'btn-primary-pill' : 'btn-secondary-pill'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Declined ({declinedCount})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '320px' }}>
            <Search
              size={16}
              color="#A3A3A3"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by investor or venture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-medium)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner-clean"></div>
            <p>Loading incoming requests...</p>
          </div>
        ) : filteredInterests.length === 0 ? (
          <div className="empty-placeholder-card">
            <Inbox size={48} color="#A3A3A3" />
            <h3>No requests match your criteria</h3>
            <p>
              {interests.length === 0
                ? 'No investor interest submissions received yet. Make sure your business opportunities are published so investors can discover them.'
                : 'Try clearing your search query or selecting a different status filter tab.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredInterests.map((interest) => {
              const isPending = interest.status === 'pending';
              const isAccepted = interest.status === 'accepted';
              const isDeclined = interest.status === 'declined';
              const isProcessing = actionLoadingId === interest._id;

              return (
                <div
                  key={interest._id}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                        <span className="role-badge badge-investor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <User size={13} /> {interest.investor?.name || 'Verified Investor'}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#737373' }}>
                          for <strong>{interest.business?.businessName}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4A4A4A', fontSize: '0.95rem' }}>
                        <Mail size={15} color="#737373" />
                        <span>{interest.investor?.email}</span>
                      </div>
                    </div>

                    {/* Actions / Status */}
                    <div>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                          <button
                            onClick={() =>
                              handleUpdateStatus(interest._id, 'accepted', interest.investor?.name)
                            }
                            disabled={isProcessing}
                            className="btn-hero-primary"
                            style={{
                              backgroundColor: '#00A35C',
                              padding: '0.65rem 1.25rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <Check size={16} /> Accept & Share Details
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(interest._id, 'declined', interest.investor?.name)
                            }
                            disabled={isProcessing}
                            className="btn-demo-pill"
                            style={{
                              color: '#DC2626',
                              borderColor: '#FCA5A5',
                              padding: '0.65rem 1rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <X size={16} /> Decline
                          </button>
                        </div>
                      ) : isAccepted ? (
                        <span
                          className="role-badge"
                          style={{
                            backgroundColor: '#ECFDF5',
                            color: '#00A35C',
                            border: '1px solid #A7F3D0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.85rem'
                          }}
                        >
                          <CheckCircle size={14} /> Accepted & Contact Shared
                        </span>
                      ) : (
                        <span
                          className="role-badge"
                          style={{
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.85rem'
                          }}
                        >
                          <XCircle size={14} /> Declined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Note */}
                  {interest.message ? (
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
                        Investor Pitch / Inquiry Note:
                      </strong>
                      "{interest.message}"
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: '#A3A3A3', fontStyle: 'italic' }}>
                      No custom note included by investor.
                    </p>
                  )}

                  {/* Metadata footer */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      color: '#737373'
                    }}
                  >
                    <span>
                      <strong>Venture:</strong> {interest.business?.businessName} ({interest.business?.industry})
                    </span>
                    <span>
                      <strong>Received:</strong> {new Date(interest.createdAt).toLocaleDateString()}
                    </span>
                    {interest.reviewedAt && (
                      <span>
                        <strong>Reviewed:</strong> {new Date(interest.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
