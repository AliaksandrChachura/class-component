import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCachedCharacter } from '../useCachedCharacter';

// Mock the character cache hook
const mockUseCharacterCache = {
  getCachedCharacter: vi.fn(),
  setCachedCharacter: vi.fn(),
  clearAllCache: vi.fn(),
  getCacheStats: vi.fn(() => ({
    totalEntries: 0,
    expiredEntries: 0,
    validEntries: 0,
    cacheSize: 0,
  })),
};

vi.mock('../useCharacterCache', () => ({
  useCharacterCache: () => mockUseCharacterCache,
}));

// Mock the RTK Query hook
const mockUseGetCharacterQuery = {
  data: null as unknown,
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null as unknown,
  refetch: vi.fn(),
};

// Mock the RTK Query hook
vi.mock('../../api/endpoints/characterApi', () => ({
  useGetCharacterQuery: vi.fn(() => mockUseGetCharacterQuery),
}));

// Create test store
// Mock store not needed for this test

// Test data
const TEST_CHARACTER = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: {
    name: 'Earth (C-137)',
    url: 'https://rickandmortyapi.com/api/location/1',
  },
  location: {
    name: 'Earth (Replacement Dimension)',
    url: 'https://rickandmortyapi.com/api/location/20',
  },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [
    'https://rickandmortyapi.com/api/episode/1',
    'https://rickandmortyapi.com/api/episode/2',
  ],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
};

// Define the hook result type
interface HookResult {
  character: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  cacheStats: {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
    cacheSize: number;
  };
  clearCache: () => void;
}

// Simple renderHook wrapper
const renderHookWithProvider = (hook: () => HookResult) => {
  return renderHook(hook);
};

describe('useCachedCharacter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetCharacterQuery.data = null;
    mockUseGetCharacterQuery.isLoading = false;
    mockUseGetCharacterQuery.isFetching = false;
    mockUseGetCharacterQuery.isError = false;
    mockUseGetCharacterQuery.error = null;
    mockUseCharacterCache.getCachedCharacter.mockReturnValue(null);
    mockUseCharacterCache.getCacheStats.mockReturnValue({
      totalEntries: 0,
      expiredEntries: 0,
      validEntries: 0,
      cacheSize: 0,
    });
  });

  describe('Basic Functionality', () => {
    it('returns hook state and functions', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current).toHaveProperty('character');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('cacheStats');
      expect(result.current).toHaveProperty('clearCache');
    });

    it('returns character data when available from API', () => {
      mockUseGetCharacterQuery.data = TEST_CHARACTER;

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.character).toEqual(TEST_CHARACTER);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isError).toBe(false);
    });

    it('returns character data from cache when available', () => {
      mockUseCharacterCache.getCachedCharacter.mockReturnValue(TEST_CHARACTER);

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.character).toEqual(TEST_CHARACTER);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('returns isLoading state when fetching', () => {
      mockUseGetCharacterQuery.isLoading = true;

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('returns error state when API fails', () => {
      const mockError = new Error('Failed to fetch character');
      mockUseGetCharacterQuery.isError = true;
      mockUseGetCharacterQuery.error = mockError;

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('returns fetching state', () => {
      mockUseGetCharacterQuery.isFetching = true;

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.isFetching).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('calls refetch when refetch is called', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      result.current.refetch();

      expect(mockUseGetCharacterQuery.refetch).toHaveBeenCalled();
    });

    it('calls clearCache when clearCache is called', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      result.current.clearCache();

      expect(mockUseCharacterCache.clearAllCache).toHaveBeenCalled();
    });

    it('returns cache statistics', () => {
      const mockCacheStats = {
        totalEntries: 5,
        expiredEntries: 2,
        validEntries: 3,
        cacheSize: 1024,
      };
      mockUseCharacterCache.getCacheStats.mockReturnValue(mockCacheStats);

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.cacheStats).toEqual(mockCacheStats);
    });

    it('sets character in cache when fresh data is received', () => {
      mockUseGetCharacterQuery.data = TEST_CHARACTER;

      renderHookWithProvider(() => useCachedCharacter({ id: 1 }));

      expect(mockUseCharacterCache.setCachedCharacter).toHaveBeenCalledWith(
        TEST_CHARACTER
      );
    });
  });

  describe('Options and Configuration', () => {
    it('skips API call when skip is true', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1, skip: true })
      );

      expect(result.current.character).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('skips API call when cached character exists', () => {
      mockUseCharacterCache.getCachedCharacter.mockReturnValue(TEST_CHARACTER);

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.character).toEqual(TEST_CHARACTER);
      // The API call should be skipped due to cache
      expect(mockUseGetCharacterQuery.refetch).not.toHaveBeenCalled();
    });

    it('disables cache when enableCache is false', () => {
      mockUseCharacterCache.getCachedCharacter.mockReturnValue(TEST_CHARACTER);

      renderHookWithProvider(() =>
        useCachedCharacter({ id: 1, enableCache: false })
      );

      // Should not use cached character
      expect(mockUseCharacterCache.getCachedCharacter).not.toHaveBeenCalled();
    });

    it('does not set character in cache when enableCache is false', () => {
      mockUseGetCharacterQuery.data = TEST_CHARACTER;

      renderHookWithProvider(() =>
        useCachedCharacter({ id: 1, enableCache: false })
      );

      expect(mockUseCharacterCache.setCachedCharacter).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles null character ID gracefully', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: null as unknown as number })
      );

      // The hook should handle null gracefully without throwing
      expect(result.current.character).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles undefined character ID gracefully', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: undefined as unknown as number })
      );

      // The hook should handle undefined gracefully without throwing
      expect(result.current.character).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles zero character ID', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 0 })
      );

      expect(result.current.character).toBeUndefined();
    });

    it('handles negative character ID', () => {
      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: -1 })
      );

      expect(result.current.character).toBeUndefined();
    });
  });

  describe('Loading State Logic', () => {
    it('returns false isLoading when character is cached', () => {
      mockUseCharacterCache.getCachedCharacter.mockReturnValue(TEST_CHARACTER);
      mockUseGetCharacterQuery.isLoading = true;

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.isLoading).toBe(false);
    });

    it('returns true isLoading when no cached character and API is loading', () => {
      mockUseGetCharacterQuery.isLoading = true;

      const { result } = renderHookWithProvider(() =>
        useCachedCharacter({ id: 1 })
      );

      expect(result.current.isLoading).toBe(true);
    });
  });
});
