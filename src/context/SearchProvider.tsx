import { useReducer, useMemo, useCallback, type ReactNode } from 'react';
import { SearchContext } from './SearchContext';

interface SearchState {
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

type SearchAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
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
  isLoading: false,
  error: null,
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
    case 'RESET_SEARCH':
      try {
        localStorage.removeItem('searchTerm');
      } catch {
        // Ignore localStorage errors
      }
      return {
        ...initialState,
        searchTerm: '',
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

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

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
