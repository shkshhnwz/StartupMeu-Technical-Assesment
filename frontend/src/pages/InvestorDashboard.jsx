import React, { useState } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { authService } from '../features/auth/services/authService';
import { TrendingUp, Send, CheckCircle, ShieldCheck, ShieldAlert, Compass } from 'lucide-react';

export const InvestorDashboard = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testInvestorAccess = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await authService.testRoleAccess('investor');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/investor',
        message: res.message || 'Access granted to Investor role.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: 'GET /api/auth/test/investor',
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testFounderAccessAsInvestor = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await authService.testRoleAccess('founder');
      setTestResult({
        success: true,
        endpoint: 'GET /api/auth/test/founder',
        message: 'Unexpected: access allowed'
      });
    } catch (err) {
      setTestResult({
        success: false,
        isExpected403: true,
        endpoint: 'GET /api/auth/test/founder',
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
            <span className="role-badge badge-investor">Investor</span>
            <span style={{ fontSize: '0.9rem', color: '#737373' }}>Portfolio Discovery</span>
          </div>
          <h2>Welcome back, {user?.name}</h2>
          <p>
            Browse high-potential ventures, track your submitted expressions of interest, and connect directly with founding teams.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="metrics-row">
          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Compass size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">0</span>
              <span className="metric-desc">Saved Opportunities</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Send size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">0</span>
              <span className="metric-desc">Submitted Interests</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <CheckCircle size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-val">0</span>
              <span className="metric-desc">Accepted Connections</span>
            </div>
          </div>
        </div>

        {/* Live Role-Based Authorization Verification Panel */}
        <div className="role-test-box">
          <div className="role-test-header-group">
            <ShieldCheck size={26} color="#00A35C" />
            <div>
              <h3>Role-Based Access Control Verification</h3>
              <p>Test live backend middleware enforcement of your Investor permissions:</p>
            </div>
          </div>

          <div className="role-button-group">
            <button
              onClick={testInvestorAccess}
              disabled={testing}
              className="btn-primary-pill"
            >
              Test Investor Endpoint (Expect 200 OK)
            </button>
            <button
              onClick={testFounderAccessAsInvestor}
              disabled={testing}
              className="btn-secondary-pill"
            >
              Test Founder Endpoint (Expect 403 Forbidden)
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

        {/* Empty State */}
        <div className="empty-placeholder-card">
          <Compass size={44} color="#A3A3A3" />
          <h3>No active interest requests submitted yet</h3>
          <p>
            You are ready for the next feature: <strong>Opportunity Discovery & Investor Interest Workflow</strong>. You will be able to search published startups and express interest directly.
          </p>
        </div>
      </div>
    </div>
  );
};
