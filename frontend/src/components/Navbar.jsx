import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, Inbox, Plus, Compass } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo (Bonsai style mark) */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
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

        {/* Center Links (Desktop only) */}
        <div className="navbar-center-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
            Home
          </Link>
          <Link
            to="/opportunities"
            className={`nav-link ${isActive('/opportunities') ? 'nav-link-active' : ''}`}
          >
            Opportunities
          </Link>
          {isAuthenticated && user?.role === 'founder' && (
            <Link
              to="/founder/interests"
              className={`nav-link ${isActive('/founder/interests') ? 'nav-link-active' : ''}`}
            >
              Inbound Requests
            </Link>
          )}
        </div>

        {/* Right Action Area (Desktop) */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              {user?.role === 'founder' ? (
                <Link
                  to="/founder/dashboard"
                  className={`nav-link ${isActive('/founder/dashboard') ? 'nav-link-active' : ''}`}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/investor/dashboard"
                  className={`nav-link ${isActive('/investor/dashboard') ? 'nav-link-active' : ''}`}
                >
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
                aria-label="Log out"
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

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobileMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-links">
              <Link to="/" className="mobile-drawer-item" onClick={closeMobileMenu}>
                Home
              </Link>
              <Link to="/opportunities" className="mobile-drawer-item" onClick={closeMobileMenu}>
                Browse Opportunities
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="mobile-drawer-divider" />

                  {user?.role === 'founder' ? (
                    <>
                      <Link
                        to="/founder/dashboard"
                        className="mobile-drawer-item"
                        onClick={closeMobileMenu}
                      >
                        Founder Dashboard
                      </Link>
                      <Link
                        to="/founder/interests"
                        className="mobile-drawer-item"
                        onClick={closeMobileMenu}
                      >
                        <Inbox size={16} /> Inbound Inquiries
                      </Link>
                      <Link
                        to="/founder/listings/new"
                        className="mobile-drawer-item"
                        onClick={closeMobileMenu}
                      >
                        <Plus size={16} /> Create Opportunity
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/investor/dashboard"
                        className="mobile-drawer-item"
                        onClick={closeMobileMenu}
                      >
                        Investor Pipeline
                      </Link>
                      <Link
                        to="/opportunities"
                        className="mobile-drawer-item"
                        onClick={closeMobileMenu}
                      >
                        <Compass size={16} /> Discover Deals
                      </Link>
                    </>
                  )}

                  <div className="mobile-drawer-divider" />

                  <div className="mobile-user-info">
                    <span className={`role-badge ${user?.role === 'founder' ? 'badge-founder' : 'badge-investor'}`}>
                      {user?.role === 'founder' ? 'Founder' : 'Investor'}
                    </span>
                    <span className="mobile-user-name">{user?.name}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-secondary-pill"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="mobile-drawer-divider" />
                  <Link
                    to="/login"
                    className="btn-secondary-pill"
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary-pill"
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center', marginTop: '0.5rem' }}
                    onClick={closeMobileMenu}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
