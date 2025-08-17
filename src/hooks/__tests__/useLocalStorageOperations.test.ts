import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useLocalStorageOperations from '../useLocalStorageOperations';

describe('useLocalStorageOperations', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          mockLocalStorage[key] = undefined;
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns hook functions', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    expect(result.current).toHaveProperty('getItem');
    expect(result.current).toHaveProperty('setItem');
    expect(result.current).toHaveProperty('removeItem');
    expect(result.current).toHaveProperty('clear');
    expect(result.current).toHaveProperty('exists');
  });

  it('sets item in localStorage', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      const success = result.current.setItem('testKey', 'testValue');
      expect(success).toBe(true);
    });

    expect(mockLocalStorage['testKey']).toBe('"testValue"');
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'testKey',
      '"testValue"'
    );
  });

  it('gets item from localStorage', () => {
    mockLocalStorage['testKey'] = '"testValue"';

    const { result } = renderHook(() => useLocalStorageOperations());

    const value = result.current.getItem('testKey');

    expect(value).toBe('testValue');
    expect(window.localStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  it('returns null for non-existent key', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    const value = result.current.getItem('nonExistentKey');

    expect(value).toBeNull();
    expect(window.localStorage.getItem).toHaveBeenCalledWith('nonExistentKey');
  });

  it('returns default value for non-existent key', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    const value = result.current.getItem('nonExistentKey', 'default');

    expect(value).toBe('default');
  });

  it('removes item from localStorage', () => {
    mockLocalStorage['testKey'] = '"testValue"';

    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      const success = result.current.removeItem('testKey');
      expect(success).toBe(true);
    });

    expect(mockLocalStorage['testKey']).toBeUndefined();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('testKey');
  });

  it('clears all localStorage', () => {
    mockLocalStorage['key1'] = '"value1"';
    mockLocalStorage['key2'] = '"value2"';

    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      const success = result.current.clear();
      expect(success).toBe(true);
    });

    expect(mockLocalStorage).toEqual({});
    expect(window.localStorage.clear).toHaveBeenCalled();
  });

  it('handles complex objects', () => {
    const complexObject = { name: 'Rick', age: 70, location: 'Earth' };

    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      const success = result.current.setItem('complexKey', complexObject);
      expect(success).toBe(true);
    });

    expect(mockLocalStorage['complexKey']).toBe(JSON.stringify(complexObject));
  });

  it('handles empty string values', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      const success = result.current.setItem('emptyKey', '');
      expect(success).toBe(true);
    });

    expect(mockLocalStorage['emptyKey']).toBe('""');
  });

  it('handles null values', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      const success = result.current.setItem('nullKey', null);
      expect(success).toBe(true);
    });

    expect(mockLocalStorage['nullKey']).toBe('null');
  });

  it('handles multiple operations in sequence', () => {
    const { result } = renderHook(() => useLocalStorageOperations());

    act(() => {
      result.current.setItem('key1', 'value1');
      result.current.setItem('key2', 'value2');
      result.current.removeItem('key1');
    });

    expect(mockLocalStorage['key1']).toBeUndefined();
    expect(mockLocalStorage['key2']).toBe('"value2"');
  });

  it('checks if key exists', () => {
    mockLocalStorage['existingKey'] = '"value"';

    const { result } = renderHook(() => useLocalStorageOperations());

    expect(result.current.exists('existingKey')).toBe(true);
    expect(result.current.exists('nonExistingKey')).toBe(false);
  });

  it('handles JSON parse errors gracefully', () => {
    mockLocalStorage['invalidKey'] = 'invalid json';

    const { result } = renderHook(() => useLocalStorageOperations());

    const value = result.current.getItem('invalidKey');

    expect(value).toBeNull();
  });
});
