import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { FounderDashboard } from './pages/FounderDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { NewListingPage } from './features/listings/pages/NewListingPage';
import { EditListingPage } from './features/listings/pages/EditListingPage';
import { OpportunitiesPage } from './features/discovery/pages/OpportunitiesPage';
import { OpportunityDetailPage } from './features/discovery/pages/OpportunityDetailPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Founder Role-Protected Routes */}
              <Route
                path="/founder/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['founder']}>
                    <FounderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/founder/listings/new"
                element={
                  <ProtectedRoute allowedRoles={['founder']}>
                    <NewListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/founder/listings/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['founder']}>
                    <EditListingPage />
                  </ProtectedRoute>
                }
              />

              {/* Investor Role-Protected Routes */}
              <Route
                path="/investor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['investor']}>
                    <InvestorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
