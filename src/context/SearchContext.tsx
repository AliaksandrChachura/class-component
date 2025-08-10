import { createContext, useContext } from 'react';

interface SearchState {
  theme: string;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
}

interface SearchContextType {
  state: SearchState;
  setSearchTerm: (term: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSearch: () => void;
  setTheme: (theme: string) => void;
  setCurrentPage: (page: number) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
