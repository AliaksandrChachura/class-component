import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ErrorBoundary from '../../ErrorBoundary';
import { fetchCharacters } from '../../api/rickMortyAPI';
import { mockAPIResponse } from '../mocks/rickMortyAPI';
import { RouterProvider } from 'react-router-dom';
import { createTestRouter } from '../../routes/Routes';
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

const renderApp = (initialEntries = ['/']) =>
  render(<RouterProvider router={createTestRouter(initialEntries)} />);

const mockedFetchCharacters = vi.mocked(fetchCharacters);

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    mockedFetchCharacters.mockResolvedValue(mockAPIResponse);
  });

  it('error boundary integration works', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowError = () => {
      throw new Error('Test error');
    };

    const WrappedComponent = () => (
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(() => render(<WrappedComponent />)).not.toThrow();

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles API errors gracefully', async () => {
    mockedFetchCharacters.mockRejectedValue(new Error('API Error'));

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/error:\s*api error/i)).toBeInTheDocument();
    });
  });

  it('displays character data correctly', async () => {
    mockedFetchCharacters.mockResolvedValue(mockAPIResponse);

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });
  });

  it('handles empty search results', async () => {
    mockedFetchCharacters.mockResolvedValue({
      ...mockAPIResponse,
      results: [],
    });

    renderApp(['/']);

    await waitFor(() => {
      expect(mockedFetchCharacters).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByText((text) =>
          text.toLowerCase().includes('no characters found.')
        )
      ).toBeInTheDocument();
    });
  });
});
