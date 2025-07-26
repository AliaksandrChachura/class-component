import { useReducer, type ReactNode } from 'react';
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

const initialState: SearchState = {
  searchTerm: localStorage.getItem('searchTerm') || '',
  isLoading: false,
  error: null,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      localStorage.setItem('searchTerm', action.payload);
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
      localStorage.removeItem('searchTerm');
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

  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term.trim() });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetSearch = () => {
    dispatch({ type: 'RESET_SEARCH' });
  };

  const value = {
    state,
    setSearchTerm,
    setLoading,
    setError,
    resetSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
