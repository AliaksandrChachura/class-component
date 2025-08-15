'use client';

import React, { type ErrorInfo } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { SearchProvider } from '../context/SearchProvider';
import { useSearchContext } from '../context/SearchContext';
import ErrorBoundary from '../ErrorBoundary';

function ThemedShell({ children }: { children: React.ReactNode }) {
  const { state } = useSearchContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme class until mounted
  if (!mounted) {
    return <div className="app">{children}</div>;
  }

  return <div className={`app ${state.theme}`}>{children}</div>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
  };

  return (
    <Provider store={store}>
      <ErrorBoundary onError={handleError}>
        <SearchProvider>
          <ThemedShell>{children}</ThemedShell>
        </SearchProvider>
      </ErrorBoundary>
    </Provider>
  );
}
