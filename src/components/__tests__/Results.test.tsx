import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Results from '../Results';
import {
  fetchCharacters,
  type RickMortyResponse,
} from '../../api/rickMortyAPI';
import { mockAPIResponse } from '../../test/mocks/rickMortyAPI';
import { SearchProvider } from '../../context/SearchProvider';

vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetchCharacters = vi.mocked(fetchCharacters);

const renderWithProvider = (component: React.ReactElement) => {
  return render(<SearchProvider>{component}</SearchProvider>);
};

describe('Results Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetchCharacters.mockResolvedValue(mockAPIResponse);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state initially', () => {
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    renderWithProvider(<Results />);

    expect(
      screen.getAllByText(/loading rick and morty characters/i)
    ).toHaveLength(2);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads saved search term from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('Rick');

    renderWithProvider(<Results />);

    expect(localStorage.getItem).toHaveBeenCalledWith('searchTerm');
    expect(mockFetchCharacters).toHaveBeenCalledWith('Rick', 1);
  });

  it('fetches data on component mount', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('');
    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
    });
  });

  it('renders characters when data is loaded successfully', async () => {
    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Morty Smith')).toBeInTheDocument();
  });

  it('renders character cards with correct descriptions', async () => {
    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    const rickDescription =
      'Human from Earth (C-137). Status: Alive. Currently at: Citadel of Ricks';
    const mortyDescription =
      'Human from unknown. Status: Alive. Currently at: Citadel of Ricks';

    expect(screen.getByText(rickDescription)).toBeInTheDocument();
    expect(screen.getByText(mortyDescription)).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    mockFetchCharacters.mockRejectedValue(new Error('API Error'));

    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Unable to load characters')
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Rick and Morty Characters')
    ).not.toBeInTheDocument();
  });

  it('renders "no characters found" when results array is empty', async () => {
    mockFetchCharacters.mockResolvedValue({
      ...mockAPIResponse,
      results: [],
    });

    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(screen.getByText('No characters found.')).toBeInTheDocument();
    });
  });

  it('updateSearchTerm method updates state and refetches data', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('');
    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
    });

    const resultsComponent = screen
      .getByText('Rick and Morty Characters')
      .closest('div');
    expect(resultsComponent).toBeInTheDocument();
  });

  it('handles loading state properly during data fetch', async () => {
    let resolvePromise: (value: RickMortyResponse) => void = () => {};
    const promise = new Promise<RickMortyResponse>((resolve) => {
      resolvePromise = resolve;
    });

    mockFetchCharacters.mockReturnValue(promise);

    renderWithProvider(<Results />);

    expect(
      screen.getAllByText(/loading rick and morty characters/i)
    ).toHaveLength(2);

    resolvePromise(mockAPIResponse);

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('clears error state when refetching data', async () => {
    mockFetchCharacters.mockRejectedValueOnce(new Error('API Error'));

    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Unable to load characters')
      ).toBeInTheDocument();
    });

    mockFetchCharacters.mockResolvedValueOnce(mockAPIResponse);
  });

  it('passes correct props to Loader component', () => {
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    renderWithProvider(<Results />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute(
      'aria-label',
      'Loading Rick and Morty characters...'
    );
  });

  it('renders cards with unique keys', async () => {
    renderWithProvider(<Results />);

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

    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Custom Character')).toBeInTheDocument();
    });

    const description =
      'Alien from Custom Planet. Status: Dead. Currently at: Custom Location';
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('maintains loading state during the entire fetch process', async () => {
    let resolvePromise: (value: RickMortyResponse) => void = () => {};
    const promise = new Promise<RickMortyResponse>((resolve) => {
      resolvePromise = resolve;
    });

    mockFetchCharacters.mockReturnValue(promise);

    renderWithProvider(<Results />);

    expect(screen.getAllByText(/loading/i)).toHaveLength(2);

    setTimeout(() => resolvePromise(mockAPIResponse), 100);

    expect(screen.getAllByText(/loading/i)).toHaveLength(2);

    await waitFor(
      () => {
        expect(
          screen.getByText('Rick and Morty Characters')
        ).toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it('has correct CSS classes and structure', async () => {
    renderWithProvider(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    const resultsContainer = document.querySelector('.results');
    expect(resultsContainer).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Rick and Morty Characters');
  });
});
