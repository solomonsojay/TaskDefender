import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import AuthWrapper from './components/auth/AuthWrapper';
import AppContent from './components/AppContent';

function App() {
  return (
    <AppProvider>
      <SupabaseProvider>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </SupabaseProvider>
    </AppProvider>
  );
}

export default App;