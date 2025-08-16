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

  const cachedCharacter = enableCache ? getCachedCharacter(id) : null;

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

  useEffect(() => {
    if (freshCharacter && enableCache) {
      setCachedCharacter(freshCharacter);
    }
  }, [freshCharacter, setCachedCharacter, enableCache]);

  const character = freshCharacter || cachedCharacter || undefined;

  const clearCache = useCallback(() => {
    clearAllCache();
  }, [clearAllCache]);

  return {
    character,
    isLoading: isLoading && !cachedCharacter,
    isError,
    error: error as Error | null | undefined,
    isFetching,
    refetch,
    cacheStats: getCacheStats(),
    clearCache,
  };
};

export default useCachedCharacter;
