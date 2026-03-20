import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOnboarding = location.pathname === '/onboarding';

  if (profile && !profile.onboardingCompleted && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile?.onboardingCompleted && isOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
