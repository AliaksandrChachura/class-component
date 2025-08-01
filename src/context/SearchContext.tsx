import { createContext, useContext } from 'react';

interface SearchState {
  theme: string;
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
  setTheme: (theme: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

// Custom hook to use the search context with proper error handling
export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
