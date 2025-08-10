import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { baseApi } from '../api/baseApi';
import { useSearch } from '../hooks/useSearch';

const SearchStatus: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { state, resetSearch } = useSearch();

  const handleReset = useCallback(() => {
    // Clear URL params and navigate
    setSearchParams(new URLSearchParams());
    navigate('/results', { replace: true });
    // Clear context and localStorage
    // setSearchTerm('');
    resetSearch();
    // removeItem('searchTerm');
    dispatch(baseApi.util.invalidateTags([{ type: 'Characters', id: 'LIST' }]));
    // navigate('/results', { replace: true });
  }, [resetSearch, dispatch, setSearchParams, navigate]);

  if (!state.searchTerm && !state.isLoading && !state.error) {
    return null;
  }

  return (
    <div className="search-status">
      {state.searchTerm && (
        <p>
          Searching for: <strong>&ldquo;{state.searchTerm}&rdquo;</strong>
          <button onClick={handleReset} className="reset-btn">
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
