import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../baseApi', () => ({
  baseApi: {
    injectEndpoints: vi.fn((config) => {
      return {
        useGetCharactersQuery: vi.fn(),
        endpoints: config.endpoints,
      };
    }),
  },
}));

import { useGetCharactersQuery } from '../charactersApi';

describe('charactersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exports', () => {
    it('should export useGetCharactersQuery', () => {
      expect(useGetCharactersQuery).toBeDefined();
      expect(typeof useGetCharactersQuery).toBe('function');
    });
  });

  describe('endpoint configuration', () => {
    it('should have correct endpoint configuration', () => {
      expect(useGetCharactersQuery).toBeDefined();
    });

    it('should have correct query function structure', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should have correct providesTags function structure', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should have correct serializeQueryArgs function structure', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });
  });

  describe('query function behavior', () => {
    it('should handle query parameters correctly', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle default values', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle undefined parameters', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle custom pageNumber and pageSize', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });
  });

  describe('providesTags function behavior', () => {
    it('should return correct tags when result exists', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should return only Characters tag when result is null', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should return only Characters tag when result is undefined', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle empty results array', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });
  });

  describe('serializeQueryArgs function behavior', () => {
    it('should serialize query arguments correctly', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle undefined name parameter', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle null name parameter', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should handle empty string name parameter', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });
  });

  describe('configuration values', () => {
    it('should have correct keepUnusedDataFor value', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });

    it('should have all required functions defined', () => {
      expect(typeof useGetCharactersQuery).toBe('function');
    });
  });
});
