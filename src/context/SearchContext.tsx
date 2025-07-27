import { createContext } from 'react';

interface SearchState {
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

interface SearchContextType {
  state: SearchState;
  setSearchTerm: (term: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSearch: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);
