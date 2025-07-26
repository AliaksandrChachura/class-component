import React from 'react';
import { useSearch } from '../hooks/useSearch';

const SearchStatus: React.FC = () => {
  const { state, resetSearch } = useSearch();

  if (!state.searchTerm && !state.isLoading && !state.error) {
    return null;
  }

  return (
    <div className="search-status">
      {state.searchTerm && (
        <p>
          Searching for: <strong>&ldquo;{state.searchTerm}&rdquo;</strong>
          <button onClick={resetSearch} className="reset-btn">
            Clear Search
          </button>
        </p>
      )}

      {state.isLoading && <p className="loading-status">🔍 Searching...</p>}

      {state.error && <p className="error-status">❌ {state.error}</p>}
    </div>
  );
};

export default SearchStatus;
