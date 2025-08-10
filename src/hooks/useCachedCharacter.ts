import { useCallback, useEffect } from 'react';
import { useGetCharacterQuery } from '../api/endpoints/characterApi';
import { useCharacterCache } from './useCharacterCache';
import type { Character } from '../api/types';

interface UseCachedCharacterOptions {
  id: number;
  skip?: boolean;
  enableCache?: boolean;
  error?: Error | null | undefined;
  isError?: boolean;
  isFetching?: boolean;
  refetch?: () => void;
}

interface UseCachedCharacterResult {
  character: Character | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null | undefined;
  isFetching: boolean;
  refetch: () => void;
  cacheStats: {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
    cacheSize: number;
  };
  clearCache: () => void;
}

export const useCachedCharacter = ({
  id,
  skip = false,
  enableCache = true,
}: UseCachedCharacterOptions): UseCachedCharacterResult => {
  const {
    getCachedCharacter,
    setCachedCharacter,
    clearAllCache,
    getCacheStats,
  } = useCharacterCache();

  // Try to get from cache first
  const cachedCharacter = enableCache ? getCachedCharacter(id) : null;

  // Use RTK Query for fresh data
  const {
    data: freshCharacter,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useGetCharacterQuery(
    { id },
    {
      skip: skip || !!cachedCharacter,
    }
  );

  // Cache the fresh character data when it arrives
  useEffect(() => {
    if (freshCharacter && enableCache) {
      setCachedCharacter(freshCharacter);
    }
  }, [freshCharacter, setCachedCharacter, enableCache]);

  // Return cached character if available and not loading fresh data
  const character = freshCharacter || cachedCharacter || undefined;

  const clearCache = useCallback(() => {
    clearAllCache();
  }, [clearAllCache]);

  return {
    character,
    isLoading: isLoading && !cachedCharacter, // Don't show loading if we have cached data
    isError,
    error: error as Error | null | undefined,
    isFetching,
    refetch,
    cacheStats: getCacheStats(),
    clearCache,
  };
};

export default useCachedCharacter;
