import { useCallback } from 'react';
import { useLocalStorageOperations } from './useLocalStorageOperations';
import type { Character } from '../api/types';

interface CachedCharacter extends Character {
  cachedAt: number;
}

interface CharacterCache {
  [id: number]: CachedCharacter;
}

const CACHE_KEY = 'character-details-cache';
const CACHE_EXPIRY_HOURS = 24; // Cache for 24 hours

export const useCharacterCache = () => {
  const localStorage = useLocalStorageOperations();

  const getCachedCharacters = useCallback((): CharacterCache => {
    return localStorage.getItem<CharacterCache>(CACHE_KEY, {}) || {};
  }, [localStorage]);

  const setCachedCharacter = useCallback(
    (character: Character) => {
      const cachedCharacters = getCachedCharacters();
      const cachedCharacter: CachedCharacter = {
        ...character,
        cachedAt: Date.now(),
      };

      cachedCharacters[character.id] = cachedCharacter;
      localStorage.setItem(CACHE_KEY, cachedCharacters);
    },
    [localStorage, getCachedCharacters]
  );

  const getCachedCharacter = useCallback(
    (id: number): Character | null => {
      const cachedCharacters = getCachedCharacters();
      const cachedCharacter = cachedCharacters[id];

      if (!cachedCharacter) return null;

      // Check if cache has expired
      const now = Date.now();
      const cacheAge = now - cachedCharacter.cachedAt;
      const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds

      if (cacheAge > maxAge) {
        // Remove expired cache entry
        const remainingCharacters = Object.fromEntries(
          Object.entries(cachedCharacters).filter(([key]) => Number(key) !== id)
        );
        localStorage.setItem(CACHE_KEY, remainingCharacters);
        return null;
      }

      return cachedCharacter;
    },
    [localStorage, getCachedCharacters]
  );

  const clearExpiredCache = useCallback(() => {
    const cachedCharacters = getCachedCharacters();
    const now = Date.now();
    const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

    const validCharacters: CharacterCache = {};

    Object.keys(cachedCharacters).forEach((idStr) => {
      const id = parseInt(idStr, 10);
      const cachedCharacter = cachedCharacters[id];
      const cacheAge = now - cachedCharacter.cachedAt;

      if (cacheAge <= maxAge) {
        validCharacters[id] = cachedCharacter;
      }
    });

    localStorage.setItem(CACHE_KEY, validCharacters);
  }, [localStorage, getCachedCharacters]);

  const clearAllCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, [localStorage]);

  const getCacheStats = useCallback(() => {
    const cachedCharacters = getCachedCharacters();
    const now = Date.now();
    const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

    let totalEntries = 0;
    let expiredEntries = 0;
    let validEntries = 0;

    Object.values(cachedCharacters).forEach((cachedCharacter) => {
      totalEntries++;
      const cacheAge = now - cachedCharacter.cachedAt;

      if (cacheAge > maxAge) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries,
      expiredEntries,
      validEntries,
      cacheSize: Object.keys(cachedCharacters).length,
    };
  }, [getCachedCharacters]);

  return {
    getCachedCharacter,
    setCachedCharacter,
    clearExpiredCache,
    clearAllCache,
    getCacheStats,
  };
};

export default useCharacterCache;
