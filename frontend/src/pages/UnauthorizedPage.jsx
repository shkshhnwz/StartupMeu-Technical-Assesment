import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { ShieldAlert, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-icon-badge" style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}>
          <ShieldAlert size={22} color="#DC2626" />
        </div>
        <h2>Access restricted</h2>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
          Your current account role (<strong>{user?.role || 'Guest'}</strong>) does not have permission to view this resource.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {user?.role === 'founder' ? (
            <Link to="/founder/dashboard" className="btn-primary-pill" style={{ width: '100%' }}>
              Go to Founder Dashboard
            </Link>
          ) : user?.role === 'investor' ? (
            <Link to="/investor/dashboard" className="btn-primary-pill" style={{ width: '100%' }}>
              Go to Investor Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary-pill" style={{ width: '100%' }}>
              Sign in with authorized account
            </Link>
          )}
          <Link to="/" className="btn-secondary-pill" style={{ width: '100%' }}>
            <Home size={15} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
