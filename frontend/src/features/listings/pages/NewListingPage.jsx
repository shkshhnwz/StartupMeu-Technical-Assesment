import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { businessService } from '../services/businessService';
import { ArrowLeft, ArrowRight, Building, Globe, MapPin, DollarSign, Layers, Tag, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

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

export const NewListingPage = () => {
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
    status: 'published' // Default to publish or draft
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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
      errors.location = 'Location is required (e.g. San Francisco, US)';
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
      await businessService.create({
        ...formData,
        fundingRequired: Number(formData.fundingRequired)
      });
      navigate('/founder/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create listing. Please check your inputs.');
      if (err.fields) {
        setFieldErrors(err.fields);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container" style={{ maxWidth: '840px' }}>
        {/* Navigation Breadcrumb */}
        <Link to="/founder/dashboard" className="btn-secondary-pill" style={{ width: 'fit-content' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="dashboard-hero-card">
          <h2>Create Business Opportunity</h2>
          <p>
            Publish your venture to connect with verified investors. Provide accurate financial metrics and business overview.
          </p>
        </div>

        {errorMessage && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: '100%' }} noValidate>
          {/* Status Selection Pill Toggle */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label>Listing Visibility</label>
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
                <CheckCircle2 size={15} /> Publish Directly
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
                Save as Draft
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.2rem' }}>
              {formData.status === 'published'
                ? 'Published listings are visible to all investors on the marketplace.'
                : 'Drafts are private and only visible to you until published.'}
            </span>
          </div>

          {/* Business Name */}
          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <div className="input-container">
              <Building className="input-icon" size={18} />
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="e.g. Acme Technologies"
                value={formData.businessName}
                onChange={handleChange}
                className={fieldErrors.businessName ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.businessName && <span className="field-error-text">{fieldErrors.businessName}</span>}
          </div>

          {/* Tagline */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="tagline">One-line Tagline</label>
              <span style={{ fontSize: '0.75rem', color: '#737373' }}>{formData.tagline.length}/160</span>
            </div>
            <div className="input-container">
              <Tag className="input-icon" size={18} />
              <input
                id="tagline"
                name="tagline"
                type="text"
                placeholder="e.g. AI-powered treasury management for high-growth enterprises"
                value={formData.tagline}
                onChange={handleChange}
                maxLength={160}
                className={fieldErrors.tagline ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.tagline && <span className="field-error-text">{fieldErrors.tagline}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="description">Comprehensive Business Description</label>
              <span style={{ fontSize: '0.75rem', color: formData.description.length < 50 ? '#DC2626' : '#737373' }}>
                {formData.description.length}/3000 (min 50)
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Detail your problem statement, solution, target market, business model, and competitive edge..."
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

          {/* Row: Industry & Stage */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industry">Industry Sector</label>
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

          {/* Row: Funding Required & Currency */}
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
                  placeholder="500000"
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

          {/* Row: Location & Website */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location (City, Country)</label>
              <div className="input-container">
                <MapPin className="input-icon" size={18} />
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. San Francisco, US"
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
                  placeholder="https://acme.com"
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
                  <span className="spinner-btn"></span> Saving...
                </span>
              ) : (
                <span>
                  {formData.status === 'published' ? 'Publish Listing' : 'Save as Draft'}{' '}
                  <ArrowRight size={16} />
                </span>
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
