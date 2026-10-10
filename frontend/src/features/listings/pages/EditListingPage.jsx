import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { businessService } from '../services/businessService';
import { ArrowLeft, ArrowRight, Building, Globe, MapPin, DollarSign, Tag, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const INDUSTRIES = [
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

const STAGES = ['Idea', 'Early Revenue', 'Growth', 'Established'];

export const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    description: '',
    industry: 'SaaS',
    stage: 'Early Revenue',
    location: '',
    fundingRequired: '',
    currency: 'USD',
    website: '',
    status: 'draft'
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchListing = async () => {
      try {
        const business = await businessService.getById(id);
        if (isMounted) {
          setFormData({
            businessName: business.businessName || '',
            tagline: business.tagline || '',
            description: business.description || '',
            industry: business.industry || 'SaaS',
            stage: business.stage || 'Early Revenue',
            location: business.location || '',
            fundingRequired: business.fundingRequired || '',
            currency: business.currency || 'USD',
            website: business.website || '',
            status: business.status || 'draft'
          });
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load business listing.');
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    fetchListing();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters';
    }
    if (!formData.tagline.trim()) {
      errors.tagline = 'Tagline is required';
    } else if (formData.tagline.length > 160) {
      errors.tagline = 'Tagline cannot exceed 160 characters';
    }
    if (!formData.description.trim() || formData.description.trim().length < 50) {
      errors.description = `Description must be at least 50 characters (currently ${formData.description.trim().length})`;
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    const funding = Number(formData.fundingRequired);
    if (!formData.fundingRequired || isNaN(funding) || funding <= 0) {
      errors.fundingRequired = 'Please enter a valid positive funding amount';
    }
    if (formData.website && !formData.website.startsWith('http')) {
      errors.website = 'Website must start with http:// or https://';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await businessService.update(id, {
        ...formData,
        fundingRequired: Number(formData.fundingRequired)
      });
      navigate('/founder/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update listing.');
      if (err.fields) {
        setFieldErrors(err.fields);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing? It will be removed from the marketplace.')) {
      try {
        await businessService.delete(id);
        navigate('/founder/dashboard');
      } catch (err) {
        setErrorMessage(err.message || 'Failed to delete listing.');
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner-clean"></div>
        <p>Loading listing details...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/founder/dashboard" className="btn-secondary-pill">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-demo-pill"
            style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
          >
            <Trash2 size={15} /> Delete Listing
          </button>
        </div>

        <div className="dashboard-hero-card">
          <h2>Edit Business Listing</h2>
          <p>Update your venture details, funding goals, or toggle between draft and published status.</p>
        </div>

        {errorMessage && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: '100%' }} noValidate>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label>Listing Status</label>
            <div className="demo-pill-buttons" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: '380px' }}>
              <button
                type="button"
                className={`btn-demo-pill ${formData.status === 'published' ? 'active' : ''}`}
                style={
                  formData.status === 'published'
                    ? { backgroundColor: '#111111', color: '#FFFFFF', borderColor: '#111111' }
                    : {}
                }
                onClick={() => setFormData((prev) => ({ ...prev, status: 'published' }))}
              >
                <CheckCircle2 size={15} /> Published
              </button>
              <button
                type="button"
                className={`btn-demo-pill ${formData.status === 'draft' ? 'active' : ''}`}
                style={
                  formData.status === 'draft'
                    ? { backgroundColor: '#111111', color: '#FFFFFF', borderColor: '#111111' }
                    : {}
                }
                onClick={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
              >
                Draft (Private)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <div className="input-container">
              <Building className="input-icon" size={18} />
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className={fieldErrors.businessName ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.businessName && <span className="field-error-text">{fieldErrors.businessName}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="tagline">Tagline</label>
              <span style={{ fontSize: '0.75rem', color: '#737373' }}>{formData.tagline.length}/160</span>
            </div>
            <div className="input-container">
              <Tag className="input-icon" size={18} />
              <input
                id="tagline"
                name="tagline"
                type="text"
                value={formData.tagline}
                onChange={handleChange}
                maxLength={160}
                className={fieldErrors.tagline ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.tagline && <span className="field-error-text">{fieldErrors.tagline}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="description">Business Description</label>
              <span style={{ fontSize: '0.75rem', color: formData.description.length < 50 ? '#DC2626' : '#737373' }}>
                {formData.description.length}/3000
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className={`input-container ${fieldErrors.description ? 'input-error' : ''}`}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-medium)',
                fontFamily: 'inherit',
                fontSize: '0.95rem'
              }}
              required
            />
            {fieldErrors.description && <span className="field-error-text">{fieldErrors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-medium)',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stage">Company Stage</label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-medium)',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fundingRequired">Funding Required</label>
              <div className="input-container">
                <DollarSign className="input-icon" size={18} />
                <input
                  id="fundingRequired"
                  name="fundingRequired"
                  type="number"
                  min="1"
                  step="any"
                  value={formData.fundingRequired}
                  onChange={handleChange}
                  className={fieldErrors.fundingRequired ? 'input-error' : ''}
                  required
                />
              </div>
              {fieldErrors.fundingRequired && (
                <span className="field-error-text">{fieldErrors.fundingRequired}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-medium)',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="input-container">
                <MapPin className="input-icon" size={18} />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className={fieldErrors.location ? 'input-error' : ''}
                  required
                />
              </div>
              {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="website">Website URL (Optional)</label>
              <div className="input-container">
                <Globe className="input-icon" size={18} />
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className={fieldErrors.website ? 'input-error' : ''}
                />
              </div>
              {fieldErrors.website && <span className="field-error-text">{fieldErrors.website}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-hero-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? (
                <span>
                  <span className="spinner-btn"></span> Saving Changes...
                </span>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
            <Link to="/founder/dashboard" className="btn-hero-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
