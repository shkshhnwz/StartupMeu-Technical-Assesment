import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo (Bonsai style mark) */}
        <Link to="/" className="navbar-brand">
          <svg
            className="brand-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16v16H4z" rx="4" />
            <path d="M9 9h6v6H9z" />
          </svg>
          <div className="brand-text-wrapper">
            <span className="brand-title">startupmeu</span>
            <span className="brand-subtitle">connect</span>
          </div>
        </Link>

        {/* Center Links (like Bonsai's Products, Industries, Resources...) */}
        <div className="navbar-center-links">
          <Link to="/" className="nav-link">
            Products
          </Link>
          <Link to="/" className="nav-link">
            Industries
          </Link>
          <Link to="/opportunities" className="nav-link">
            Opportunities
          </Link>
          <Link to="/" className="nav-link">
            Customer stories
          </Link>
          <Link to="/" className="nav-link">
            Pricing
          </Link>
        </div>

        {/* Right Action Area */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              {user?.role === 'founder' ? (
                <Link to="/founder/dashboard" className="nav-link nav-link-active">
                  Dashboard
                </Link>
              ) : (
                <Link to="/investor/dashboard" className="nav-link nav-link-active">
                  Dashboard
                </Link>
              )}

              <span className={`role-badge ${user?.role === 'founder' ? 'badge-founder' : 'badge-investor'}`}>
                {user?.role === 'founder' ? 'Founder' : 'Investor'}
              </span>

              <div className="user-name-display">
                <UserIcon size={15} />
                <span>{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Log out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-login-link">
                Login
              </Link>
              <Link to="/register" className="btn-primary-pill">
                Try StartupMeu for free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
