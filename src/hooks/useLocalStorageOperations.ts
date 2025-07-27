import { useCallback } from 'react';

interface LocalStorageOperations {
  getItem: <T>(key: string, defaultValue?: T) => T | null;
  setItem: <T>(key: string, value: T) => boolean;
  removeItem: (key: string) => boolean;
  clear: () => boolean;
  exists: (key: string) => boolean;
}

export const useLocalStorageOperations = (): LocalStorageOperations => {
  const getItem = useCallback(<T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue ?? null;
    }
  }, []);

  const setItem = useCallback(<T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }, []);

  const removeItem = useCallback((key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }, []);

  const clear = useCallback((): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }, []);

  const exists = useCallback((key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    exists,
  } as const;
};

export default useLocalStorageOperations;
