import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { interestService } from '../services/interestService';

export const ExpressInterestModal = ({ business, isOpen, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !business) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await interestService.submitInterest(business._id, message);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.message ||
        'Failed to express interest. You may have already submitted a request for this opportunity.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 17, 17, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#FAF9F6',
          borderRadius: '1.25rem',
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(229, 228, 223, 0.8)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#737373',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#00A35C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111111', marginBottom: '0.5rem' }}>
              Interest Submitted!
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your expression of interest has been delivered to <strong>{business.businessName}</strong>.
              When the founder accepts, their direct contact details will be unlocked in your Investor Dashboard.
            </p>
            <button
              onClick={handleClose}
              className="btn-hero-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="role-badge badge-investor" style={{ fontSize: '0.75rem' }}>
                Investor Workflow
              </span>
              <span style={{ fontSize: '0.85rem', color: '#737373' }}>
                {business.industry} • {business.stage}
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111111', marginBottom: '0.35rem' }}>
              Express Interest
            </h2>
            <p style={{ color: '#4A4A4A', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Introduce yourself to the founding team of <strong>{business.businessName}</strong> and share what makes your investment mandate a strong fit.
            </p>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '0.75rem',
                  color: '#991B1B',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>
                    Introductory Message (Optional)
                  </label>
                  <span style={{ fontSize: '0.8rem', color: message.length > 450 ? '#DC2626' : '#737373' }}>
                    {message.length} / 500
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. We lead early-stage fintech rounds with check sizes of $250k–$1M. Would love to schedule an introductory call to learn more about your traction."
                  maxLength={500}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary-pill"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-hero-primary"
                  disabled={submitting}
                  style={{ minWidth: '150px', justifyContent: 'center' }}
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send size={16} /> Send Interest
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
