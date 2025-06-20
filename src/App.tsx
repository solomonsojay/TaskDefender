import React from 'react';
import { AppProvider } from './context/AppContext';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AppContent from './components/AppContent';
import { useApp } from './context/AppContext';

function AppInner() {
  const { isOnboarding } = useApp();

  if (isOnboarding) {
    return <OnboardingFlow />;
  }

  return <AppContent />;
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;