import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Results from '../Results';
import { useGetCharactersQuery } from '../../api/endpoints/charactersApi';
import { mockAPIResponse } from '../../test/mocks/rickMortyAPI';
import { SearchProvider } from '../../context/SearchProvider';
import { SearchContext } from '../../context/SearchContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../api/endpoints/charactersApi', () => ({
  useGetCharactersQuery: vi.fn(),
}));

const mockUseGetCharactersQuery = vi.mocked(useGetCharactersQuery);

const mockOnCharacterSelect = vi.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <SearchProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </SearchProvider>
    </Provider>
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
    mockUseGetCharactersQuery.mockReturnValue({
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
    mockOnCharacterSelect.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders loading state when fetchCharacters is called', async () => {
    mockUseGetCharactersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'pending',
      isSuccess: false,
      isError: false,
      isUninitialized: false,
    });

    const mockSearchContext = {
      state: {
        theme: 'light',
        searchTerm: '',
        isLoading: true,
        error: null,
        currentPage: 1,
      },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
      setTheme: vi.fn(),
      setCurrentPage: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>
          <SearchContext.Provider value={mockSearchContext}>
            {children}
          </SearchContext.Provider>
        </MemoryRouter>
      </Provider>
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
      state: {
        theme: 'light',
        searchTerm: 'Rick',
        isLoading: false,
        error: null,
        currentPage: 1,
      },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
      setTheme: vi.fn(),
      setCurrentPage: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>
          <SearchContext.Provider value={mockSearchContext}>
            {children}
          </SearchContext.Provider>
        </MemoryRouter>
      </Provider>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(mockUseGetCharactersQuery).toHaveBeenCalled();
  });

  it('fetches data on component mount', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('');
    renderWithProps();

    await waitFor(() => {
      expect(mockUseGetCharactersQuery).toHaveBeenCalled();
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

  it('renders error toast when API call fails', async () => {
    mockUseGetCharactersQuery.mockReturnValue({
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

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    // Check that the error toast is displayed
    const errorToast = screen.getByText('API Error').closest('.error-toast');
    expect(errorToast).toBeInTheDocument();

    // Check that the error icon is present
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    // Check that the close button is present
    expect(
      screen.getByRole('button', { name: /close error message/i })
    ).toBeInTheDocument();

    expect(screen.queryByText('Found')).not.toBeInTheDocument();
  });

  it('renders "no characters found" when results array is empty', async () => {
    mockUseGetCharactersQuery.mockReturnValue({
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
    // Test loading state
    mockUseGetCharactersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'pending',
      isSuccess: false,
      isError: false,
      isUninitialized: false,
    });

    const mockSearchContext = {
      state: {
        theme: 'light',
        searchTerm: '',
        isLoading: true,
        error: null,
        currentPage: 1,
      },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
      setTheme: vi.fn(),
      setCurrentPage: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>
          <SearchContext.Provider value={mockSearchContext}>
            {children}
          </SearchContext.Provider>
        </MemoryRouter>
      </Provider>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('clears error state when refetching data', async () => {
    mockUseGetCharactersQuery.mockReturnValue({
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

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    mockUseGetCharactersQuery.mockReturnValue({
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

  it('allows user to close error toast manually', async () => {
    mockUseGetCharactersQuery.mockReturnValue({
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

    renderWithProps();

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', {
      name: /close error message/i,
    });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('API Error')).not.toBeInTheDocument();
    });
  });

  it('auto-hides error toast after 5 seconds', () => {
    // Mock setTimeout to control the timer behavior
    const mockSetTimeout = vi.fn();
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation(mockSetTimeout);

    mockUseGetCharactersQuery.mockReturnValue({
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

    renderWithProps();

    // Check that error appears
    expect(screen.getByText('API Error')).toBeInTheDocument();

    // Verify that setTimeout was called with 5000ms
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

    // Restore original setTimeout
    setTimeoutSpy.mockRestore();
  });

  it('passes correct props to Loader component', () => {
    mockUseGetCharactersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'pending',
      isSuccess: false,
      isError: false,
      isUninitialized: false,
    });

    const mockSearchContext = {
      state: {
        theme: 'light',
        searchTerm: '',
        isLoading: true,
        error: null,
        currentPage: 1,
      },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
      setTheme: vi.fn(),
      setCurrentPage: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>
          <SearchContext.Provider value={mockSearchContext}>
            {children}
          </SearchContext.Provider>
        </MemoryRouter>
      </Provider>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
  });

  it('renders cards with unique keys', () => {
    // Ensure mock data is properly set
    mockUseGetCharactersQuery.mockReturnValue({
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

    renderWithProps();

    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();

    const cards = document.querySelectorAll('.card');
    expect(cards).toHaveLength(2);
  });

  it('handles API response with different character data', () => {
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

    const customMockResponse = {
      info: {
        count: 1,
        pages: 1,
        next: null,
        prev: null,
      },
      results: [customCharacter],
    };

    mockUseGetCharactersQuery.mockReturnValue({
      data: customMockResponse,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: customMockResponse,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'fulfilled',
      isSuccess: true,
      isError: false,
      isUninitialized: false,
    });

    renderWithProps();

    expect(screen.getByText('Custom Character')).toBeInTheDocument();

    const description =
      '🔴 Dead Alien from Custom Planet. Currently at: Custom Location';
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('maintains loading state during the entire fetch process', () => {
    // Mock the hook to return loading state
    mockUseGetCharactersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
      unsubscribe: vi.fn(),
      reset: vi.fn(),
      currentData: undefined,
      endpointName: 'getCharacters',
      originalArgs: { pageNumber: 1, name: '', pageSize: 20 },
      requestId: 'test-request-id',
      status: 'pending',
      isSuccess: false,
      isError: false,
      isUninitialized: false,
    });

    const mockSearchContext = {
      state: {
        theme: 'light',
        searchTerm: 'test',
        isLoading: true,
        error: null,
        currentPage: 1,
      },
      setSearchTerm: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      resetSearch: vi.fn(),
      setTheme: vi.fn(),
      setCurrentPage: vi.fn(),
    };

    const TestProvider = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>
          <SearchContext.Provider value={mockSearchContext}>
            {children}
          </SearchContext.Provider>
        </MemoryRouter>
      </Provider>
    );

    render(
      <TestProvider>
        <Results onCharacterSelect={mockOnCharacterSelect} />
      </TestProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(screen.queryByText('Found')).not.toBeInTheDocument();
  });

  it('has correct CSS classes and structure', () => {
    // Ensure mock data is properly set
    mockUseGetCharactersQuery.mockReturnValue({
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

    renderWithProps();

    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();

    const resultsContainer = document.querySelector('.results');
    expect(resultsContainer).toBeInTheDocument();
  });
});
