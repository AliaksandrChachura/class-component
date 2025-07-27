import React from 'react';
import { SearchProvider } from './context/SearchProvider';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

const App: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SearchProvider>
        <div className="app">
          <Outlet />
        </div>
      </SearchProvider>
    </ErrorBoundary>
  );
};

export default App;
