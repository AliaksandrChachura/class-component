import { useReducer, useMemo, useCallback, type ReactNode } from 'react';
import { SearchContext } from './SearchContext';
import type { RickMortyResponse } from '../api/types/index';
import useLocalStorageOperations from '../hooks/useLocalStorageOperations';

interface SearchState {
  theme: string;
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
  | { type: 'RESET_SEARCH' }
  | { type: 'SET_THEME'; payload: string };

const getInitialSearchTerm = (): string => {
  try {
    const saved = localStorage.getItem('searchTerm');
    return saved && saved.length > 0 ? JSON.parse(saved) : '';
  } catch {
    return '';
  }
};

const getInitialTheme = (): string => {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const initialState: SearchState = {
  theme: getInitialTheme(),
  searchTerm: getInitialSearchTerm(),
  currentPage: 1,
  isLoading: false,
  error: null,
  searchResults: null,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        currentPage: 1,
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
      return {
        ...initialState,
        searchTerm: '',
        currentPage: 1,
        searchResults: null,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
}

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const { setItem, removeItem } = useLocalStorageOperations();
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const setSearchTerm = useCallback(
    (term: string) => {
      const trimmedTerm = term.trim();

      setItem('searchTerm', trimmedTerm);

      dispatch({ type: 'SET_SEARCH_TERM', payload: trimmedTerm });
    },
    [setItem]
  );

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetSearch = useCallback(() => {
    removeItem('searchTerm');

    dispatch({ type: 'RESET_SEARCH' });
  }, [removeItem]);

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  const setTheme = useCallback(
    (theme: string) => {
      setItem('theme', theme);

      dispatch({ type: 'SET_THEME', payload: theme });
    },
    [setItem]
  );

  const value = useMemo(
    () => ({
      state,
      setSearchTerm,
      setLoading,
      setError,
      resetSearch,
      setTheme,
      setCurrentPage,
    }),
    [
      state,
      setSearchTerm,
      setLoading,
      setError,
      resetSearch,
      setTheme,
      setCurrentPage,
    ]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
