import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { fetchCharacters } from '../../api/rickMortyAPI';
import { mockAPIResponse } from '../mocks/rickMortyAPI';

vi.mock('../../api/rickMortyAPI', () => ({
  fetchCharacters: vi.fn(),
}));

const mockedFetchCharacters = vi.mocked(fetchCharacters);

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockedFetchCharacters.mockResolvedValue(mockAPIResponse);
  });

  it('renders header and basic layout correctly', async () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search characters/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /throw error/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });
  });

  it('integrates search functionality between Header and Results', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    vi.clearAllMocks();

    await user.type(searchInput, 'Rick');
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockedFetchCharacters).toHaveBeenCalledWith('Rick', 1);
    });
  });

  it('error boundary integration works', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowError = () => {
      throw new Error('Test error');
    };

    expect(() => render(<ThrowError />)).not.toThrow();

    consoleSpy.mockRestore();
  });

  it('shows loading state during API calls', async () => {
    mockedFetchCharacters.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockAPIResponse), 100)
        )
    );

    render(<App />);

    expect(
      screen.getByText(/loading rick and morty characters/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Rick and Morty Characters')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockedFetchCharacters.mockRejectedValue(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/error: unable to load characters/i)
      ).toBeInTheDocument();
    });
  });

  it('persists search term in localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'Morty');
    await user.click(searchButton);

    expect(localStorage.getItem('searchTerm')).toBe('Morty');
  });

  it('loads saved search term from localStorage', () => {
    localStorage.setItem('searchTerm', 'Saved Term');

    render(<App />);

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    expect(searchInput).toHaveValue('Saved Term');
  });

  it('displays character data correctly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      expect(screen.getByText(/human from earth/i)).toBeInTheDocument();
    });
  });

  it('handles empty search results', async () => {
    mockedFetchCharacters.mockResolvedValue({
      ...mockAPIResponse,
      results: [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no characters found/i)).toBeInTheDocument();
    });
  });

  it('supports accessibility features', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText(/loading rick and morty characters/i)
    ).toBeInTheDocument();
  });
});
