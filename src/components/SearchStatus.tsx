'use client';

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { baseApi } from '../api/baseApi';
import { useSearch } from '../hooks/useSearch';

const SearchStatus: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const locale = useLocale();
  const { state, resetSearch } = useSearch();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = useCallback(() => {
    router.replace(`/${locale}/results`);
    resetSearch();
    dispatch(baseApi.util.invalidateTags([{ type: 'Characters', id: 'LIST' }]));
  }, [resetSearch, dispatch, router, locale]);

  if (!mounted) {
    return null;
  }

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
