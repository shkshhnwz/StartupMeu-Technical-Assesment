import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { ArrowRight, Check, Briefcase, TrendingUp } from 'lucide-react';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Bonsai-inspired Hero Section */}
      <section className="hero-container">
        <div className="hero-left">
          {/* Partnership Tag */}
          <div className="partnership-tag">
            <span>In partnership with</span>
            <span className="partnership-badge">StartupMeu</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-heading">
            The discovery platform for founders & investors
          </h1>

          {/* Subtitle */}
          <p className="hero-description">
            Designed to simplify opportunity publishing, delight investors, and accelerate growth.
            Create your profile or sign in today.
          </p>

          {/* Action Buttons Row (Solid Black Pill + Outline Pill) */}
          <div className="hero-button-row">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard'}
                className="btn-hero-primary"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero-primary">
                  Get started
                </Link>
                <Link to="/login" className="btn-hero-secondary">
                  Book a demo
                </Link>
              </>
            )}
          </div>

          {/* Social Proof Stars */}
          <div className="social-proof-row">
            <span className="stars-rating">★★★★★</span>
            <span className="reviews-count">1020+ Reviews</span>
          </div>
        </div>

        {/* Right Product Screen Display */}
        <div className="hero-right">
          <div className="hero-image-wrapper">
            <img
              src="/hero-dashboard.jpg"
              alt="StartupMeu Connect Marketplace Interface"
              className="hero-display-image"
            />
          </div>
        </div>
      </section>

      {/* Feature Split Cards */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <p className="section-pretitle">Tailored Experiences</p>
            <h2 className="section-title">Built for both sides of the marketplace</h2>
          </div>

          <div className="features-grid">
            {/* Founder Card */}
            <div className="feature-card">
              <div className="feature-icon-wrapper feature-founder-icon">
                <Briefcase size={22} />
              </div>
              <h3>For Founders</h3>
              <p>
                Present your startup with clean, structured profiles. Manage your funding requirements and review verified investor requests seamlessly.
              </p>
              <ul className="feature-bullets">
                <li><Check size={16} color="#00A35C" /> Create and manage drafts & published ventures</li>
                <li><Check size={16} color="#00A35C" /> Receive private interest notes from investors</li>
                <li><Check size={16} color="#00A35C" /> Control acceptance and introductions</li>
              </ul>
              <Link to="/register" className="btn-card-link">
                Join as Founder <ArrowRight size={16} />
              </Link>
            </div>

            {/* Investor Card */}
            <div className="feature-card">
              <div className="feature-icon-wrapper feature-investor-icon">
                <TrendingUp size={22} />
              </div>
              <h3>For Investors</h3>
              <p>
                Efficiently filter pre-seed to growth-stage startups by industry, traction, and location. Express interest with zero premature contact leakage.
              </p>
              <ul className="feature-bullets">
                <li><Check size={16} color="#111111" /> Discover curated opportunities across tech & SaaS</li>
                <li><Check size={16} color="#111111" /> One-click interest submission with custom note</li>
                <li><Check size={16} color="#111111" /> Track intro request status in real-time</li>
              </ul>
              <Link to="/register" className="btn-card-link">
                Join as Investor <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
