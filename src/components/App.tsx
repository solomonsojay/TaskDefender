import React from 'react';
import { AppProvider } from '../context/AppContext';
import AuthWrapper from './auth/AuthWrapper';
import OnboardingFlow from './onboarding/OnboardingFlow';
import AppContent from './AppContent';
import { useApp } from '../context/AppContext';
import ErrorBoundary from './common/ErrorBoundary';

function AppInner() {
  const { isOnboarding } = useApp();

  if (isOnboarding) {
    return <OnboardingFlow />;
  }

  return <AppContent />;
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthWrapper>
          <AppInner />
        </AuthWrapper>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;