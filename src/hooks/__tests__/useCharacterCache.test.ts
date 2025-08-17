import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCharacterCache } from '../useCharacterCache';
import type { Character } from '../../types/api';

// Mock useLocalStorageOperations hook
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  exists: vi.fn(),
};

vi.mock('../useLocalStorageOperations', () => ({
  useLocalStorageOperations: () => mockLocalStorage,
}));

describe('useCharacterCache', () => {
  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth', url: 'https://example.com/earth' },
    location: { name: 'Earth', url: 'https://example.com/earth' },
    image: 'https://example.com/rick.jpg',
    episode: ['https://example.com/episode1'],
    url: 'https://example.com/rick',
    created: '2017-11-04T18:48:46.250Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns hook functions', () => {
    const { result } = renderHook(() => useCharacterCache());

    expect(result.current).toHaveProperty('getCachedCharacter');
    expect(result.current).toHaveProperty('setCachedCharacter');
    expect(result.current).toHaveProperty('clearExpiredCache');
    expect(result.current).toHaveProperty('clearAllCache');
    expect(result.current).toHaveProperty('getCacheStats');
  });

  it('returns null for non-cached character', () => {
    const { result } = renderHook(() => useCharacterCache());

    const cached = result.current.getCachedCharacter(1);

    expect(cached).toBeNull();
  });

  it('returns cached character when exists', () => {
    const now = Date.now();
    const cachedCharacter = { ...mockCharacter, cachedAt: now };
    mockLocalStorage.getItem.mockReturnValue({ 1: cachedCharacter });

    const { result } = renderHook(() => useCharacterCache());

    const cached = result.current.getCachedCharacter(1);

    expect(cached).toEqual(cachedCharacter);
  });

  it('caches character correctly', () => {
    const { result } = renderHook(() => useCharacterCache());

    act(() => {
      result.current.setCachedCharacter(mockCharacter);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'character-details-cache',
      expect.any(Object)
    );
  });

  it('clears all cache', () => {
    const { result } = renderHook(() => useCharacterCache());

    act(() => {
      result.current.clearAllCache();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'character-details-cache'
    );
  });

  it('gets cache stats', () => {
    const now = Date.now();
    const cachedCharacter = { ...mockCharacter, cachedAt: now };
    mockLocalStorage.getItem.mockReturnValue({ 1: cachedCharacter });

    const { result } = renderHook(() => useCharacterCache());

    const stats = result.current.getCacheStats();

    expect(stats.totalEntries).toBe(1);
    expect(stats.validEntries).toBe(1);
    expect(stats.expiredEntries).toBe(0);
    expect(stats.cacheSize).toBe(1);
  });

  it('handles expired cache entries', () => {
    const oldTime = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    const expiredCharacter = { ...mockCharacter, cachedAt: oldTime };
    mockLocalStorage.getItem.mockReturnValue({ 1: expiredCharacter });

    const { result } = renderHook(() => useCharacterCache());

    const cached = result.current.getCachedCharacter(1);

    expect(cached).toBeNull();
  });

  it('handles empty cache', () => {
    mockLocalStorage.getItem.mockReturnValue({});

    const { result } = renderHook(() => useCharacterCache());

    const cached = result.current.getCachedCharacter(1);

    expect(cached).toBeNull();
  });

  it('handles null cache value', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCharacterCache());

    const cached = result.current.getCachedCharacter(1);

    expect(cached).toBeNull();
  });

  it('caches multiple characters', () => {
    const { result } = renderHook(() => useCharacterCache());

    const character2 = { ...mockCharacter, id: 2, name: 'Morty Smith' };

    act(() => {
      result.current.setCachedCharacter(mockCharacter);
      result.current.setCachedCharacter(character2);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('clears expired cache', () => {
    const now = Date.now();
    const validCharacter = { ...mockCharacter, cachedAt: now };
    const oldTime = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    const expiredCharacter = { ...mockCharacter, id: 2, cachedAt: oldTime };
    mockLocalStorage.getItem.mockReturnValue({
      1: validCharacter,
      2: expiredCharacter,
    });

    const { result } = renderHook(() => useCharacterCache());

    act(() => {
      result.current.clearExpiredCache();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'character-details-cache',
      { 1: validCharacter }
    );
  });
});
