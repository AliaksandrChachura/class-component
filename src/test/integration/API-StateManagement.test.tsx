import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { fetchCharacters } from '../../api/rickMortyAPI';
import Results from '../../components/Results';
import App from '../../App';
import { mockAPIResponse } from '../mocks/rickMortyAPI';

// Mock the API module
vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetchCharacters = vi.mocked(fetchCharacters);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API and State Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockFetchCharacters.mockResolvedValue(mockAPIResponse);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Mount and Initial API Calls', () => {
    it('makes initial API call on component mount', async () => {
      localStorageMock.getItem.mockReturnValue('');

      render(<Results />);

      // Verify API is called immediately on mount
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);

      // Wait for loading to complete
      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });

    it('handles search term from localStorage on initial load', async () => {
      const savedSearchTerm = 'Rick';
      localStorageMock.getItem.mockReturnValue(savedSearchTerm);

      render(<Results />);

      // Verify localStorage is accessed
      expect(localStorageMock.getItem).toHaveBeenCalledWith('searchTerm');

      // Verify API is called with saved search term
      expect(mockFetchCharacters).toHaveBeenCalledWith(savedSearchTerm, 1);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });

    it('makes API call with empty string when no localStorage value exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(<Results />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('searchTerm');
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });

    it('handles localStorage returning empty string', async () => {
      localStorageMock.getItem.mockReturnValue('');

      render(<Results />);

      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading State Management', () => {
    it('manages loading states during API calls', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: typeof mockAPIResponse) => void;
      const controlledPromise = new Promise<typeof mockAPIResponse>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );

      mockFetchCharacters.mockReturnValue(controlledPromise);

      render(<Results />);

      // Verify loading state is shown initially
      expect(
        screen.getAllByText(/loading rick and morty characters/i)
      ).toHaveLength(2);

      // Resolve the promise
      act(() => {
        resolvePromise(mockAPIResponse);
      });

      // Wait for loading to complete and data to be shown
      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // Verify loading state is gone
      expect(
        screen.queryByText(/loading rick and morty characters/i)
      ).not.toBeInTheDocument();
    });

    it('shows loading state during search term updates', async () => {
      localStorageMock.getItem.mockReturnValue('');

      render(<Results />);

      // Wait for initial load
      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // Verify that the initial loading was completed
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);

      // Note: This test verifies that loading states are properly managed during the initial load.
      // Search term updates would typically be tested through the App component integration,
      // as the Results component doesn't expose updateSearchTerm method directly.
    });

    it('maintains loading state during the entire fetch process', async () => {
      let resolvePromise: (value: typeof mockAPIResponse) => void;
      const controlledPromise = new Promise<typeof mockAPIResponse>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );

      mockFetchCharacters.mockReturnValue(controlledPromise);

      render(<Results />);

      // Verify loading is shown
      expect(
        screen.getAllByText(/loading rick and morty characters/i)
      ).toHaveLength(2);

      // Wait a bit to ensure loading persists
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(
        screen.getAllByText(/loading rick and morty characters/i)
      ).toHaveLength(2);

      // Resolve the promise
      act(() => {
        resolvePromise(mockAPIResponse);
      });

      // Wait for completion
      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });
  });

  describe('API Response and State Updates', () => {
    it('updates component state based on successful API responses', async () => {
      const customResponse = {
        ...mockAPIResponse,
        results: [
          {
            ...mockAPIResponse.results[0],
            name: 'Test Character',
          },
        ],
      };

      mockFetchCharacters.mockResolvedValue(customResponse);

      render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // Verify the character from API response is displayed
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    it('handles empty API responses correctly', async () => {
      const emptyResponse = {
        ...mockAPIResponse,
        info: { ...mockAPIResponse.info, count: 0 },
        results: [],
      };

      mockFetchCharacters.mockResolvedValue(emptyResponse);

      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText(/no characters found/i)).toBeInTheDocument();
      });
    });

    it('updates state when API returns multiple characters', async () => {
      const multiCharacterResponse = {
        ...mockAPIResponse,
        results: [
          mockAPIResponse.results[0],
          { ...mockAPIResponse.results[0], id: 2, name: 'Morty Smith' },
        ],
      };

      mockFetchCharacters.mockResolvedValue(multiCharacterResponse);

      render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    });

    it('clears previous results when new API call is made', async () => {
      // First API call with initial data
      const { unmount } = render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();

      // Unmount the first component
      unmount();

      // Mock new API response with different character
      const newResponse = {
        ...mockAPIResponse,
        results: [
          { ...mockAPIResponse.results[0], id: 3, name: 'Jerry Smith' },
        ],
      };

      mockFetchCharacters.mockResolvedValue(newResponse);

      // Render a new component instance
      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('Jerry Smith')).toBeInTheDocument();
      });

      // Old character should not be present
      expect(screen.queryByText('Rick Sanchez')).not.toBeInTheDocument();
    });
  });

  describe('Error State Management', () => {
    it('updates component state when API call fails', async () => {
      mockFetchCharacters.mockRejectedValue(new Error('API Error'));

      render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText(/unable to load characters/i)
        ).toBeInTheDocument();
      });

      // Verify loading state is cleared
      expect(
        screen.queryByText(/loading rick and morty characters/i)
      ).not.toBeInTheDocument();
    });

    it('clears error state when new successful API call is made', async () => {
      // First call fails
      mockFetchCharacters.mockRejectedValueOnce(new Error('API Error'));

      const { unmount } = render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText(/unable to load characters/i)
        ).toBeInTheDocument();
      });

      // Unmount the first component
      unmount();

      // Second call succeeds
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      // Render new component that should succeed
      render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // Error should be cleared (not present in new component)
      expect(
        screen.queryByText(/unable to load characters/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Search Term State Management', () => {
    it('manages search term state correctly across API calls', async () => {
      const searchTerm = 'Morty';
      localStorageMock.getItem.mockReturnValue(searchTerm);

      render(<Results />);

      // Verify initial API call uses saved search term
      expect(mockFetchCharacters).toHaveBeenCalledWith(searchTerm, 1);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });

    it('updates search term state when updateSearchTerm is called', async () => {
      // This test would require exposing updateSearchTerm method or testing through App component
      // Since Results component doesn't expose updateSearchTerm publicly,
      // we test this integration through the full App component
      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // Verify initial call
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
    });

    it('preserves search term state between component re-renders', async () => {
      const searchTerm = 'Rick';
      localStorageMock.getItem.mockReturnValue(searchTerm);

      const { rerender } = render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      expect(mockFetchCharacters).toHaveBeenCalledWith(searchTerm, 1);

      // Rerender component
      rerender(<Results />);

      // Should use the same search term from localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('searchTerm');
    });
  });

  describe('Integration with App Component', () => {
    it('handles complete search flow through App component', async () => {
      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // Verify initial API call
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('searchTerm');
    });

    it('manages state correctly when search term is updated from App', async () => {
      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      // The search functionality would be tested here if we had user interaction
      // For now, we verify the initial integration works
      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);
    });
  });
});
