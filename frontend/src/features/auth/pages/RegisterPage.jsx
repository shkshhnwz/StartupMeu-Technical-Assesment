import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'founder'
  });

  const [showPassword, setShowPassword] = useState(false);
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

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (fieldErrors.role) {
      setFieldErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!['founder', 'investor'].includes(formData.role)) {
      errors.role = 'Please choose a valid role';
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
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (user.role === 'founder') {
        navigate('/founder/dashboard', { replace: true });
      } else {
        navigate('/investor/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
      if (err.fields) {
        setFieldErrors(err.fields);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h2>Create your account</h2>
          <p className="auth-subtitle">Join the founder and investor marketplace</p>
        </div>

        {errorMessage && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Account Role Selector */}
          <div className="form-group">
            <label>Select account type</label>
            <div className="role-choice-grid">
              <div
                className={`role-choice-card ${formData.role === 'founder' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('founder')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleRoleSelect('founder')}
              >
                <div className="role-choice-header">
                  <Briefcase size={20} color={formData.role === 'founder' ? '#111111' : '#737373'} />
                  {formData.role === 'founder' && <CheckCircle2 size={16} color="#00A35C" />}
                </div>
                <h4>Founder</h4>
                <p>Publish ventures and connect with strategic capital.</p>
              </div>

              <div
                className={`role-choice-card ${formData.role === 'investor' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('investor')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleRoleSelect('investor')}
              >
                <div className="role-choice-header">
                  <TrendingUp size={20} color={formData.role === 'investor' ? '#111111' : '#737373'} />
                  {formData.role === 'investor' && <CheckCircle2 size={16} color="#00A35C" />}
                </div>
                <h4>Investor</h4>
                <p>Discover startups and express interest seamlessly.</p>
              </div>
            </div>
            {fieldErrors.role && <span className="field-error-text">{fieldErrors.role}</span>}
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="reg-name">Full name</label>
            <div className="input-container">
              <User className="input-icon" size={18} />
              <input
                id="reg-name"
                name="name"
                type="text"
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className={fieldErrors.name ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email">Work email</label>
            <div className="input-container">
              <Mail className="input-icon" size={18} />
              <input
                id="reg-email"
                name="email"
                type="email"
                placeholder="alex@company.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={fieldErrors.email ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          {/* Password Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password (8+ chars)</label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={fieldErrors.password ? 'input-error' : ''}
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password">Confirm password</label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={fieldErrors.confirmPassword ? 'input-error' : ''}
                  required
                />
              </div>
              {fieldErrors.confirmPassword && (
                <span className="field-error-text">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-btn"></span> Creating account...
              </span>
            ) : (
              <span>
                Create {formData.role === 'founder' ? 'Founder' : 'Investor'} account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
