import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2>404 — Page not found</h2>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary-pill" style={{ display: 'inline-flex' }}>
          <Home size={15} /> Return to Home
        </Link>
      </div>
    </div>
  );
};
