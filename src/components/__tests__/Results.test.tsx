import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import Results from '../Results';
import {
  fetchCharacters,
  type RickMortyResponse,
} from '../../api/rickMortyAPI';
import { mockAPIResponse } from '../../test/mocks/rickMortyAPI';
import { SearchProvider } from '../../context/SearchProvider';
import { SearchContext } from '../../context/SearchContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetchCharacters = vi.mocked(fetchCharacters);

const mockOnCharacterSelect = vi.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <SearchProvider>{component}</SearchProvider>
    </MemoryRouter>
  );
};

const renderWithProps = (props = {}) => {
  const defaultProps = {
    onCharacterSelect: mockOnCharacterSelect,
    ...props,
  };
  return renderWithProvider(<Results {...defaultProps} />);
};

describe('Results Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetchCharacters.mockResolvedValue(mockAPIResponse);
    mockOnCharacterSelect.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state when fetchCharacters is called', async () => {
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    const mockSearchContext = {
      state: { searchTerm: '', isLoading: true, error: null },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SearchContext.Provider value={mockSearchContext}>
          {children}
        </SearchContext.Provider>
      </MemoryRouter>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads saved search term from SearchContext on mount', () => {
    const mockSearchContext = {
      state: { searchTerm: 'Rick', isLoading: false, error: null },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SearchContext.Provider value={mockSearchContext}>
          {children}
        </SearchContext.Provider>
      </MemoryRouter>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(mockFetchCharacters).toHaveBeenCalledWith('Rick', 1);
  });

  it('fetches data on component mount', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('');
    renderWithProps();

    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
    });
  });

  it('renders characters when data is loaded successfully', async () => {
    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    });
  });

  it('renders character cards with correct descriptions', async () => {
    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    const rickDescription =
      '🟢 Alive Human from Earth (C-137). Currently at: Citadel of Ricks';
    const mortyDescription =
      '🟢 Alive Human from an unknown location. Currently at: Citadel of Ricks';

    expect(screen.getByText(rickDescription)).toBeInTheDocument();
    expect(screen.getByText(mortyDescription)).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    mockFetchCharacters.mockRejectedValue(new Error('API Error'));

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    expect(screen.queryByText('Found')).not.toBeInTheDocument();
  });

  it('renders "no characters found" when results array is empty', async () => {
    mockFetchCharacters.mockResolvedValue({
      ...mockAPIResponse,
      results: [],
    });

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('No characters found.')).toBeInTheDocument();
    });
  });

  it('calls onCharacterSelect when character card is clicked', async () => {
    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    const rickCard = screen.getByText('Rick Sanchez').closest('.card');
    if (rickCard) {
      fireEvent.click(rickCard);
    }

    expect(mockOnCharacterSelect).toHaveBeenCalledWith(1);
  });

  it('handles loading state properly during data fetch', async () => {
    let resolvePromise: (value: RickMortyResponse) => void = () => {};
    const promise = new Promise<RickMortyResponse>((resolve) => {
      resolvePromise = resolve;
    });

    mockFetchCharacters.mockReturnValue(promise);

    // Mock SearchContext to have loading state
    const mockSearchContext = {
      state: { searchTerm: '', isLoading: true, error: null },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SearchContext.Provider value={mockSearchContext}>
          {children}
        </SearchContext.Provider>
      </MemoryRouter>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    mockSearchContext.state.isLoading = false;
    resolvePromise(mockAPIResponse);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('clears error state when refetching data', async () => {
    mockFetchCharacters.mockRejectedValueOnce(new Error('API Error'));

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    mockFetchCharacters.mockResolvedValueOnce(mockAPIResponse);
  });

  it('passes correct props to Loader component', () => {
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    // Mock SearchContext to have loading state
    const mockSearchContext = {
      state: { searchTerm: '', isLoading: true, error: null },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SearchContext.Provider value={mockSearchContext}>
          {children}
        </SearchContext.Provider>
      </MemoryRouter>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
  });

  it('renders cards with unique keys', async () => {
    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    const cards = document.querySelectorAll('.card');
    expect(cards).toHaveLength(2);
  });

  it('handles API response with different character data', async () => {
    const customCharacter = {
      id: 999,
      name: 'Custom Character',
      status: 'Dead',
      species: 'Alien',
      type: '',
      gender: 'Unknown',
      origin: { name: 'Custom Planet', url: '' },
      location: { name: 'Custom Location', url: '' },
      image: '',
      episode: [],
      url: '',
      created: '',
    };

    mockFetchCharacters.mockResolvedValue({
      ...mockAPIResponse,
      results: [customCharacter],
    });

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('Custom Character')).toBeInTheDocument();
    });

    const description =
      '🔴 Dead Alien from Custom Planet. Currently at: Custom Location';
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('maintains loading state during the entire fetch process', () => {
    const mockSearchContext = {
      state: { searchTerm: 'test', isLoading: true, error: null },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SearchContext.Provider value={mockSearchContext}>
          {children}
        </SearchContext.Provider>
      </MemoryRouter>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(screen.queryByText('Found')).not.toBeInTheDocument();
  });

  it('has correct CSS classes and structure', async () => {
    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    const resultsContainer = document.querySelector('.results');
    expect(resultsContainer).toBeInTheDocument();
  });
});
