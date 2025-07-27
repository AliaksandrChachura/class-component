import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { fetchCharacters } from '../../api/rickMortyAPI';
import Results from '../../components/Results';
import App from '../../App';
import { mockAPIResponse } from '../mocks/rickMortyAPI';
import { SearchProvider } from '../../context/SearchProvider';

vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

const mockFetchCharacters = vi.mocked(fetchCharacters);

const renderWithProvider = (component: React.ReactElement) => {
  return render(<SearchProvider>{component}</SearchProvider>);
};

describe('API & State Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
    vi.mocked(window.localStorage.setItem).mockImplementation(() => {});
    vi.mocked(window.localStorage.removeItem).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Results Component API Integration', () => {
    it('calls API immediately on component mount', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });
    });

    it('handles successful API response', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

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

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      await waitFor(() => {
        expect(
          screen.getByText('Error: Unable to load characters')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle & State', () => {
    it('handles component mount correctly', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });

      expect(mockFetchCharacters).toHaveBeenCalledTimes(1);
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

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Custom Rick')).toBeInTheDocument();
      });

      expect(screen.getByText(/Human from Earth C-137/)).toBeInTheDocument();
      expect(screen.getByText(/🟢 Alive/)).toBeInTheDocument();
      expect(
        screen.getByText(/Currently at: Citadel of Ricks/)
      ).toBeInTheDocument();
    });

    it('handles empty results correctly', async () => {
      mockFetchCharacters.mockResolvedValue({
        info: { count: 0, pages: 0, next: null, prev: null },
        results: [],
      });

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('No characters found.')).toBeInTheDocument();
      });
    });
  });

  describe('Component Isolation & State Cleanup', () => {
    it('does not leak state between component instances', async () => {
      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      const { unmount } = renderWithProvider(
        <Results onCharacterSelect={() => {}} />
      );

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

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Different Character')).toBeInTheDocument();
      });

      expect(screen.queryByText('Rick Sanchez')).not.toBeInTheDocument();
    });

    it('handles error recovery correctly', async () => {
      mockFetchCharacters.mockRejectedValue(new Error('First error'));

      const { unmount } = renderWithProvider(
        <Results onCharacterSelect={() => {}} />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Error: Unable to load characters')
        ).toBeInTheDocument();
      });

      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();

      unmount();

      mockFetchCharacters.mockResolvedValue(mockAPIResponse);

      renderWithProvider(<Results onCharacterSelect={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Error: Unable to load characters')
      ).not.toBeInTheDocument();
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
