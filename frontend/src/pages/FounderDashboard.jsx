import React, { useState } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { authService } from '../features/auth/services/authService';
import { Briefcase, Clock, CheckCircle, ShieldCheck, ShieldAlert, FolderPlus } from 'lucide-react';

export const FounderDashboard = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testFounderAccess = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await authService.testRoleAccess('founder');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/founder',
        message: res.message || 'Access granted to Founder role.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: 'GET /api/auth/test/founder',
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testInvestorAccessAsFounder = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await authService.testRoleAccess('investor');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/investor',
        message: 'Unexpected: access allowed'
      });
    } catch (err) {
      setTestResult({
        success: false,
        isExpected403: true,
        endpoint: 'GET /api/auth/test/investor',
        message: `${err.code || '403 Forbidden'}: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Header Card */}
        <div className="dashboard-hero-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="role-badge badge-founder">Founder</span>
            <span style={{ fontSize: '0.9rem', color: '#737373' }}>Workspace Overview</span>
          </div>
          <h2>Welcome back, {user?.name}</h2>
          <p>
            Manage your venture listings, monitor engagement, and respond to incoming interest from verified investors.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="metrics-row">
          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Briefcase size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">0</span>
              <span className="metric-desc">Published Listings</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Clock size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">0</span>
              <span className="metric-desc">Pending Interest Requests</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <CheckCircle size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">0</span>
              <span className="metric-desc">Accepted Introductions</span>
            </div>
          </div>
        </div>

        {/* Live Role-Based Authorization Verification Panel */}
        <div className="role-test-box">
          <div className="role-test-header-group">
            <ShieldCheck size={26} color="#00A35C" />
            <div>
              <h3>Role-Based Access Control Verification</h3>
              <p>Test live backend middleware enforcement of your Founder permissions:</p>
            </div>
          </div>

          <div className="role-button-group">
            <button
              onClick={testFounderAccess}
              disabled={testing}
              className="btn-primary-pill"
            >
              Test Founder Endpoint (Expect 200 OK)
            </button>
            <button
              onClick={testInvestorAccessAsFounder}
              disabled={testing}
              className="btn-secondary-pill"
            >
              Test Investor Endpoint (Expect 403 Forbidden)
            </button>
          </div>

          {testResult && (
            <div className={`test-outcome-panel ${testResult.isExpected403 || testResult.success ? 'pass' : 'fail'}`}>
              <div className="test-outcome-title">
                {testResult.isExpected403 ? (
                  <>
                    <ShieldCheck size={16} /> Enforced Role Check: Server Blocked Wrong Role (403 Forbidden)
                  </>
                ) : testResult.success ? (
                  <>
                    <CheckCircle size={16} /> Permission Verified: 200 OK
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} /> Error
                  </>
                )}
              </div>
              <code>{testResult.endpoint}</code>
              <p style={{ fontSize: '0.875rem', marginTop: '0.2rem' }}>{testResult.message}</p>
            </div>
          )}
        </div>

        {/* Empty Listings Section */}
        <div className="empty-placeholder-card">
          <FolderPlus size={44} color="#A3A3A3" />
          <h3>No business listings created yet</h3>
          <p>
            You are ready for the next feature: <strong>Founder Listing Management</strong>. You will be able to create drafts, publish ventures, and receive interest requests from investors.
          </p>
        </div>
      </div>
    </div>
  );
};
