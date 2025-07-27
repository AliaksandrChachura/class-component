import { useReducer, useMemo, useCallback, type ReactNode } from 'react';
import { SearchContext } from './SearchContext';
import type { RickMortyResponse } from '../api/rickMortyAPI';

interface SearchState {
  searchTerm: string;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  searchResults: RickMortyResponse | null;
}

type SearchAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_RESULTS'; payload: RickMortyResponse | null }
  | { type: 'RESET_SEARCH' };

const getInitialSearchTerm = (): string => {
  try {
    const saved = localStorage.getItem('searchTerm');
    return saved ? JSON.parse(saved) : '';
  } catch {
    return '';
  }
};

const initialState: SearchState = {
  searchTerm: getInitialSearchTerm(),
  currentPage: 1,
  isLoading: false,
  error: null,
  searchResults: null,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      try {
        localStorage.setItem('searchTerm', JSON.stringify(action.payload));
      } catch {
        // Ignore localStorage errors
      }
      return {
        ...state,
        searchTerm: action.payload,
        currentPage: 1, // Reset to page 1 when search term changes
        error: null,
      };
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        isLoading: false,
        error: null,
      };
    case 'RESET_SEARCH':
      try {
        localStorage.removeItem('searchTerm');
      } catch {
        // Ignore localStorage errors
      }
      return {
        ...initialState,
        searchTerm: '',
        currentPage: 1,
        searchResults: null,
      };
    default:
      return state;
  }
}

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term.trim() });
  }, []);

  // const setCurrentPage = useCallback((page: number) => {
  //   dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  // }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // const setSearchResults = useCallback((results: RickMortyResponse | null) => {
  //   dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  // }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  const value = useMemo(
    () => ({
      state,
      setSearchTerm,
      setLoading,
      setError,
      resetSearch,
    }),
    [state, setSearchTerm, setLoading, setError, resetSearch]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
