import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile) {
    const isOnboarding = location.pathname === '/onboarding';
    
    if (!profile.onboardingCompleted && !isOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    
    if (profile.onboardingCompleted && isOnboarding) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
