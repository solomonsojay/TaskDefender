import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AuthWrapper from './components/auth/AuthWrapper';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AppContent from './components/AppContent';
import { useApp } from './context/AppContext';
import AuthRoutes from './components/auth/AuthRoutes';

function AppInner() {
  const { isOnboarding } = useApp();

  if (isOnboarding) {
    return <OnboardingFlow />;
  }

  return <AppContent />;
}

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route path="*" element={
            <AuthWrapper>
              <AppInner />
            </AuthWrapper>
          } />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;