import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { fetchCharacters } from '../../api/rickMortyAPI';
import Results from '../../components/Results';
import App from '../../App';
import { mockAPIResponse } from '../mocks/rickMortyAPI';

vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetchCharacters = vi.mocked(fetchCharacters);

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

describe('API & State Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.localStorage.getItem).mockReturnValue('');
    vi.mocked(window.localStorage.setItem).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Results Component API Integration', () => {
    it('calls API immediately on component mount', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      render(<Results />);

      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });
    });

    it('uses localStorage search term on mount', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);
      vi.mocked(window.localStorage.getItem).mockReturnValue('saved-term');

      render(<Results />);

      expect(window.localStorage.getItem).toHaveBeenCalledWith('searchTerm');

      expect(mockFetchCharacters).toHaveBeenCalledWith('saved-term', 1);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });
    });

    it('handles successful API response', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      expect(screen.getByText(/Human from Earth/)).toBeInTheDocument();
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
      expect(screen.getByText(/Human from Earth/)).toBeInTheDocument();
    });

    it('handles API error response', async () => {
      mockFetchCharacters.mockRejectedValue(new Error('Network error'));

      render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Error: Unable to load characters')
        ).toBeInTheDocument();
      });
    });

    it('displays loading state correctly', async () => {
      let resolvePromise: (value: typeof mockAPIResponse) => void;
      const promise = new Promise<typeof mockAPIResponse>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchCharacters.mockReturnValue(promise);

      render(<Results />);

      expect(
        screen.getByText(/Loading Rick and Morty characters/)
      ).toBeInTheDocument();

      act(() => {
        if (resolvePromise) {
          resolvePromise(mockAPIResponse);
        }
      });

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByText(/Loading Rick and Morty characters/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle & State', () => {
    it('handles component mount correctly', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });

      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);
    });

    it('manages loading state lifecycle correctly', async () => {
      let resolvePromise: (value: typeof mockAPIResponse) => void;
      const promise = new Promise<typeof mockAPIResponse>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchCharacters.mockReturnValue(promise);

      render(<Results />);

      expect(
        screen.getByText(/Loading Rick and Morty characters/)
      ).toBeInTheDocument();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(
        screen.getByText(/Loading Rick and Morty characters/)
      ).toBeInTheDocument();

      act(() => {
        if (resolvePromise) {
          resolvePromise(mockAPIResponse);
        }
      });

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Data Display Integration', () => {
    it('correctly displays character information from API', async () => {
      const customResponse = {
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [
          {
            id: 1,
            name: 'Custom Rick',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: 'Earth C-137', url: '' },
            location: { name: 'Citadel of Ricks', url: '' },
            image: '',
            episode: [],
            url: '',
            created: '',
          },
        ],
      };

      mockFetchCharacters.mockResolvedValue(customResponse);

      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('Custom Rick')).toBeInTheDocument();
      });

      expect(screen.getByText(/Human from Earth C-137/)).toBeInTheDocument();
      expect(screen.getByText(/Status: Alive/)).toBeInTheDocument();
      expect(
        screen.getByText(/Currently at: Citadel of Ricks/)
      ).toBeInTheDocument();
    });

    it('handles empty results correctly', async () => {
      mockFetchCharacters.mockResolvedValue({
        info: { count: 0, pages: 0, next: null, prev: null },
        results: [],
      });

      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('No characters found.')).toBeInTheDocument();
      });
    });
  });

  describe('Component Isolation & State Cleanup', () => {
    it('does not leak state between component instances', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      const { unmount } = render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });

      unmount();

      const differentResponse = {
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [
          {
            id: 999,
            name: 'Different Character',
            status: 'Unknown',
            species: 'Alien',
            type: '',
            gender: 'Unknown',
            origin: { name: 'Unknown', url: '' },
            location: { name: 'Unknown', url: '' },
            image: '',
            episode: [],
            url: '',
            created: '',
          },
        ],
      };

      mockFetchCharacters.mockResolvedValue(differentResponse);

      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('Different Character')).toBeInTheDocument();
      });

      expect(screen.queryByText('Rick Sanchez')).not.toBeInTheDocument();
    });

    it('handles error recovery correctly', async () => {
      mockFetchCharacters.mockRejectedValue(new Error('First error'));

      const { unmount } = render(<Results />);

      await waitFor(() => {
        expect(
          screen.getByText('Error: Unable to load characters')
        ).toBeInTheDocument();
      });

      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();

      unmount();

      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      render(<Results />);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Error: Unable to load characters')
      ).not.toBeInTheDocument();
    });
  });

  describe('LocalStorage Integration', () => {
    it('respects localStorage search term configuration', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);
      vi.mocked(window.localStorage.getItem).mockReturnValue('rick');

      render(<Results />);

      expect(mockFetchCharacters).toHaveBeenCalledWith('rick', 1);
    });
  });

  describe('App-Level Integration', () => {
    it('integrates properly with App component', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      render(<App />);

      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/search characters/i)
      ).toBeInTheDocument();
    });

    it('maintains consistent state across re-renders', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);
      vi.mocked(window.localStorage.getItem).mockReturnValue('test-term');

      const { rerender } = render(<App />);

      expect(mockFetchCharacters).toHaveBeenCalledWith('test-term', 1);

      rerender(<App />);

      expect(mockFetchCharacters).toHaveBeenCalledWith('test-term', 1);
    });

    it('handles full user workflow correctly', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      render(<App />);

      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      });
    });
  });
});
