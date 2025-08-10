import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { SearchProvider } from '../../context/SearchProvider';
import ErrorBoundary from '../../ErrorBoundary';
import { useGetCharactersQuery } from '../../api/endpoints/charactersApi';
import { mockAPIResponse } from '../mocks/rickMortyAPI';
import { RouterProvider } from 'react-router-dom';
import { createTestRouter } from '../../routes/Routes';

vi.mock('../../api/endpoints/charactersApi', () => ({
  useGetCharactersQuery: vi.fn(),
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
  render(
    <Provider store={store}>
      <SearchProvider>
        <RouterProvider router={createTestRouter(initialEntries)} />
      </SearchProvider>
    </Provider>
  );

const mockedUseGetCharactersQuery = vi.mocked(useGetCharactersQuery);

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    mockedUseGetCharactersQuery.mockReturnValue({
      data: mockAPIResponse,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: mockAPIResponse,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });
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
    mockedUseGetCharactersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: { status: 500, data: 'API Error' },
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'rejected',
      isSuccess: false,
      isError: true,
      isUninitialized: false,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    // Check that the error toast is displayed
    const errorToast = screen.getByText('API Error').closest('.error-toast');
    expect(errorToast).toBeInTheDocument();

    // Check that the error icon is present
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('displays character data correctly', async () => {
    mockedUseGetCharactersQuery.mockReturnValue({
      data: mockAPIResponse,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: mockAPIResponse,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });
  });

  it('handles empty search results', async () => {
    mockedUseGetCharactersQuery.mockReturnValue({
      data: {
        ...mockAPIResponse,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: { ...mockAPIResponse, results: [] },
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });

    renderApp(['/']);

    await waitFor(() => {
      expect(mockedUseGetCharactersQuery).toHaveBeenCalled();
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
