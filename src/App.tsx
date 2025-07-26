import React from 'react';
import { SearchProvider } from './context/SearchProvider';
import ErrorBoundary from './ErrorBoundary';
import Header from './components/Header';
import SearchStatus from './components/SearchStatus';
import Results from './components/Results';

const App: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SearchProvider>
        <div className="app">
          <Header />
          <SearchStatus />
          <Results />
        </div>
      </SearchProvider>
    </ErrorBoundary>
  );
};

export default App;
