import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchProvider } from '../SearchProvider';
import { useSearchContext } from '../SearchContext';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

// Mock useLocalStorageOperations hook
const mockSetItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock('../../hooks/useLocalStorageOperations', () => ({
  default: () => ({
    setItem: mockSetItem,
    removeItem: mockRemoveItem,
  }),
}));

const TestComponent = () => {
  const {
    state,
    setSearchTerm,
    setLoading,
    setError,
    resetSearch,
    setTheme,
    setCurrentPage,
  } = useSearchContext();

  return (
    <div>
      <div data-testid="search-term">{state.searchTerm}</div>
      <div data-testid="theme">{state.theme}</div>
      <div data-testid="loading">{state.isLoading.toString()}</div>
      <div data-testid="error">{state.error || 'no-error'}</div>
      <div data-testid="current-page">{state.currentPage}</div>
      <button onClick={() => setSearchTerm('test')}>Set Search Term</button>
      <button onClick={() => setLoading(true)}>Set Loading</button>
      <button onClick={() => setError('test error')}>Set Error</button>
      <button onClick={() => resetSearch()}>Reset Search</button>
      <button onClick={() => setTheme('dark')}>Set Theme</button>
      <button onClick={() => setCurrentPage(5)}>Set Page</button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <SearchProvider>
      <TestComponent />
    </SearchProvider>
  );
};

describe('SearchProvider Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Rendering and Initial State', () => {
    it('renders children with context', () => {
      renderWithProvider();

      expect(screen.getByTestId('search-term')).toBeInTheDocument();
      expect(screen.getByTestId('theme')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByTestId('current-page')).toBeInTheDocument();
    });

    it('provides initial state values', () => {
      renderWithProvider();

      expect(screen.getByTestId('search-term')).toHaveTextContent('');
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    });
  });

  describe('State Updates', () => {
    it('updates search term when setSearchTerm is called', () => {
      renderWithProvider();

      const setSearchButton = screen.getByText('Set Search Term');
      fireEvent.click(setSearchButton);

      expect(screen.getByTestId('search-term')).toHaveTextContent('test');
      expect(mockSetItem).toHaveBeenCalledWith('searchTerm', 'test');
    });

    it('updates loading state when setLoading is called', () => {
      renderWithProvider();

      const setLoadingButton = screen.getByText('Set Loading');
      fireEvent.click(setLoadingButton);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('updates error state when setError is called', () => {
      renderWithProvider();

      const setErrorButton = screen.getByText('Set Error');
      fireEvent.click(setErrorButton);

      expect(screen.getByTestId('error')).toHaveTextContent('test error');
    });

    it('resets search state when resetSearch is called', () => {
      renderWithProvider();

      // First set some values
      fireEvent.click(screen.getByText('Set Search Term'));
      fireEvent.click(screen.getByText('Set Error'));

      // Then reset
      fireEvent.click(screen.getByText('Reset Search'));

      expect(screen.getByTestId('search-term')).toHaveTextContent('');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
      expect(mockRemoveItem).toHaveBeenCalledWith('searchTerm');
    });

    it('updates theme when setTheme is called', () => {
      renderWithProvider();

      const setThemeButton = screen.getByText('Set Theme');
      fireEvent.click(setThemeButton);

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('updates current page when setCurrentPage is called', () => {
      renderWithProvider();

      const setPageButton = screen.getByText('Set Page');
      fireEvent.click(setPageButton);

      expect(screen.getByTestId('current-page')).toHaveTextContent('5');
    });
  });

  describe('State Persistence', () => {
    it('maintains state between multiple state updates', () => {
      renderWithProvider();

      // Set multiple values
      fireEvent.click(screen.getByText('Set Search Term'));
      fireEvent.click(screen.getByText('Set Theme'));
      fireEvent.click(screen.getByText('Set Page'));

      // Verify all values are maintained
      expect(screen.getByTestId('search-term')).toHaveTextContent('test');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('current-page')).toHaveTextContent('5');
    });

    it('provides context to multiple components', () => {
      const SecondTestComponent = () => {
        const { state } = useSearchContext();
        return <div data-testid="second-component">{state.searchTerm}</div>;
      };

      render(
        <SearchProvider>
          <TestComponent />
          <SecondTestComponent />
        </SearchProvider>
      );

      expect(screen.getByTestId('second-component')).toBeInTheDocument();
      expect(screen.getByTestId('second-component')).toHaveTextContent('');
    });
  });

  describe('Error Handling', () => {
    it('throws error when useSearchContext is used outside provider', () => {
      const TestComponentOutsideProvider = () => {
        const { state } = useSearchContext();
        return <div>{state.searchTerm}</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useSearchContext must be used within a SearchProvider');
    });
  });

  describe('Local Storage Integration', () => {
    it('loads saved theme from localStorage on mount', () => {
      // Mock localStorage.getItem to return 'dark' for theme
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn((key: string) => {
        if (key === 'theme') return 'dark';
        return null;
      });

      renderWithProvider();

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');

      // Restore original localStorage
      localStorage.getItem = originalGetItem;
    });

    it('handles localStorage access errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not crash and should use default theme
      expect(() => renderWithProvider()).not.toThrow();
      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      // Restore original localStorage
      localStorage.getItem = originalGetItem;
    });
  });
});
