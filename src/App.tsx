import { AppProvider } from './contexts/AppContext';
import AuthWrapper from './components/auth/AuthWrapper';
import AppContent from './components/AppContent';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { useApp } from './contexts/AppContext';

function AppInner() {
  const { isOnboarding } = useApp();

  if (isOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;