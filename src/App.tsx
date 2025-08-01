import React from 'react';
import { SearchProvider } from './context/SearchProvider';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { useSearchContext } from './context/SearchContext';

const App: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SearchProvider>
        <AppContent />
      </SearchProvider>
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  const { state } = useSearchContext();

  return (
    <div className={`app ${state.theme}`}>
      <Outlet />
    </div>
  );
};

export default App;
