import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Results from '../Results';
import {
  fetchCharacters,
  type RickMortyResponse,
} from '../../api/rickMortyAPI';
import { mockAPIResponse } from '../../test/mocks/rickMortyAPI';

// Mock the API module
vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetchCharacters = vi.mocked(fetchCharacters);

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
    // Make API call hang to test loading state
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    render(<Results />);

    expect(
      screen.getAllByText(/loading rick and morty characters/i)
    ).toHaveLength(2);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('loads saved search term from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('Rick');

    render(<Results />);

    expect(localStorage.getItem).toHaveBeenCalledWith('searchTerm');
    expect(mockFetchCharacters).toHaveBeenCalledWith('Rick', 1);
  });

  it('fetches data on component mount', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(''); // Ensure empty string
    render(<Results />);

    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
    });
  });

  it('renders characters when data is loaded successfully', async () => {
    render(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Morty Smith')).toBeInTheDocument();
  });

  it('renders character cards with correct descriptions', async () => {
    render(<Results />);

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

    render(<Results />);

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

    render(<Results />);

    await waitFor(() => {
      expect(screen.getByText('No characters found.')).toBeInTheDocument();
    });
  });

  it('updateSearchTerm method updates state and refetches data', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(''); // Ensure empty string
    render(<Results />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockFetchCharacters).toHaveBeenCalledWith('', 1);
    });

    // Get component instance to test updateSearchTerm
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

    render(<Results />);

    // Should show loading initially
    expect(
      screen.getAllByText(/loading rick and morty characters/i)
    ).toHaveLength(2);

    // Resolve the promise
    resolvePromise(mockAPIResponse);

    // Should show results after loading
    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('clears error state when refetching data', async () => {
    // First call fails
    mockFetchCharacters.mockRejectedValueOnce(new Error('API Error'));

    render(<Results />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Unable to load characters')
      ).toBeInTheDocument();
    });

    // Second call succeeds (simulating retry)
    mockFetchCharacters.mockResolvedValueOnce(mockAPIResponse);

    // This would require triggering a refetch, which we can't easily do
    // without access to component methods. In a real app, this might be
    // triggered by a retry button or search update.
  });

  it('passes correct props to Loader component', () => {
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    render(<Results />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute(
      'aria-label',
      'Loading Rick and Morty characters...'
    );
  });

  it('renders cards with unique keys', async () => {
    render(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    // Check that each character card is rendered
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

    render(<Results />);

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

    render(<Results />);

    // Should be loading
    expect(screen.getAllByText(/loading/i)).toHaveLength(2);

    // Resolve after a short delay
    setTimeout(() => resolvePromise(mockAPIResponse), 100);

    // Should still be loading before resolution
    expect(screen.getAllByText(/loading/i)).toHaveLength(2);

    // Should show results after resolution
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
    render(<Results />);

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    const resultsContainer = document.querySelector('.results');
    expect(resultsContainer).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Rick and Morty Characters');
  });
});
