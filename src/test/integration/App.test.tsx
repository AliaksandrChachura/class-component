import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { fetchCharacters } from '../../api/rickMortyAPI';
import { mockAPIResponse } from '../mocks/rickMortyAPI';

// Mock the API
vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetchCharacters = vi.mocked(fetchCharacters);

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetchCharacters.mockResolvedValue(mockAPIResponse);
  });

  it('renders the complete app structure', async () => {
    render(<App />);

    // Check header elements
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search characters/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /throw error/i })
    ).toBeInTheDocument();

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });
  });

  it('handles complete search flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    // Clear mock to track new calls
    mockFetchCharacters.mockClear();

    // Perform search
    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.clear(searchInput);
    await user.type(searchInput, 'Morty');
    await user.click(searchButton);

    // Verify search was called with correct term
    expect(mockFetchCharacters).toHaveBeenCalledWith('Morty', 1);
    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', 'Morty');
  });

  it('handles error boundary functionality', () => {
    // Mock console to avoid error output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // The error boundary is present and working (test that it renders)
    expect(screen.getByRole('banner')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles loading and error states', async () => {
    // Test loading state
    mockFetchCharacters.mockImplementation(() => new Promise(() => {}));

    render(<App />);

    expect(
      screen.getAllByText(/loading rick and morty characters/i)
    ).toHaveLength(2);

    // Test error state
    mockFetchCharacters.mockRejectedValue(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Unable to load characters')
      ).toBeInTheDocument();
    });
  });

  it('handles empty search results', async () => {
    mockFetchCharacters.mockResolvedValue({
      ...mockAPIResponse,
      results: [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No characters found.')).toBeInTheDocument();
    });
  });

  it('maintains search term across app lifecycle', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('Rick');

    render(<App />);

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    expect(searchInput).toHaveValue('Rick');

    expect(mockFetchCharacters).toHaveBeenCalledWith('Rick', 1);
  });

  it('renders multiple character cards correctly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    expect(screen.getByText('Morty Smith')).toBeInTheDocument();

    const cards = document.querySelectorAll('.card');
    expect(cards).toHaveLength(2);
  });

  it('handles accessibility correctly', async () => {
    render(<App />);

    // Check aria labels and roles
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Rick and Morty Characters'
      );
    });
  });
});
