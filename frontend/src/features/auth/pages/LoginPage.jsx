import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const redirectPath = location.state?.from?.pathname;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'founder') {
      setFormData({
        email: 'founder@startupmeu.demo',
        password: 'Founder123!'
      });
    } else {
      setFormData({
        email: 'investor@startupmeu.demo',
        password: 'Investor123!'
      });
    }
    setErrorMessage('');
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (!formData.email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!formData.password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData);
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (user.role === 'founder') {
        navigate('/founder/dashboard', { replace: true });
      } else {
        navigate('/investor/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      if (err.fields) {
        setFieldErrors(err.fields);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Lock size={20} />
          </div>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your StartupMeu Connect account</p>
        </div>

        <div className="demo-pill-section">
          <p className="demo-pill-title">Quick Demo Login (1-Click Fill):</p>
          <div className="demo-pill-buttons">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickFill('founder')}
            >
              <Briefcase size={14} /> Founder Demo
            </button>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickFill('investor')}
            >
              <ShieldCheck size={14} /> Investor Demo
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <div className="input-container">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={fieldErrors.email ? 'input-error' : ''}
                required
              />
            </div>
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-btn"></span> Signing in...
              </span>
            ) : (
              <span>
                Sign in <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-footer-link">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
