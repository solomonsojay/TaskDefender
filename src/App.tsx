import { AppProvider } from './contexts/AppContext';
import AuthWrapper from './components/auth/AuthWrapper';
import AppContent from './components/AppContent';

function App() {
  return (
    <AppProvider>
      <AuthWrapper>
        <AppContent />
      </AuthWrapper>
    </AppProvider>
  );
}

export default App;