import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchCharacters,
  type RickMortyResponse,
  type Character,
} from '../../api/rickMortyAPI';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('rickMortyAPI', () => {
  const mockCharacter: Character = {
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
      name: 'Citadel of Ricks',
      url: 'https://rickandmortyapi.com/api/location/3',
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z',
  };

  const mockResponse: RickMortyResponse = {
    info: {
      count: 826,
      pages: 42,
      next: 'https://rickandmortyapi.com/api/character?page=2',
      prev: null,
    },
    results: [mockCharacter],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API Integration Tests', () => {
    it('calls API with correct base URL when no parameters provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character',
        { method: 'GET' }
      );
    });

    it('calls API with correct parameters for search term', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Rick', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Rick',
        { method: 'GET' }
      );
    });

    it('calls API with correct parameters for pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('', 2);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?page=2',
        { method: 'GET' }
      );
    });

    it('calls API with both search term and pagination parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Morty', 3);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Morty&page=3',
        { method: 'GET' }
      );
    });

    it('trims search term and ignores empty strings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('  Rick  ', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Rick',
        { method: 'GET' }
      );
    });

    it('ignores empty or whitespace-only search terms', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('   ', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character',
        { method: 'GET' }
      );
    });

    it('does not add page parameter when page is 1', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Rick', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Rick',
        { method: 'GET' }
      );
    });
  });

  describe('API Response Handling', () => {
    it('handles successful API responses correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchCharacters('Rick');

      expect(result).toEqual(mockResponse);
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual(mockCharacter);
      expect(result.info.count).toBe(826);
    });

    it('handles empty results correctly', async () => {
      const emptyResponse: RickMortyResponse = {
        info: {
          count: 0,
          pages: 0,
          next: null,
          prev: null,
        },
        results: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emptyResponse),
      });

      const result = await fetchCharacters('NonExistentCharacter');

      expect(result).toEqual(emptyResponse);
      expect(result.results).toHaveLength(0);
    });

    it('handles API responses with multiple characters', async () => {
      const multiCharacterResponse: RickMortyResponse = {
        info: {
          count: 2,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [
          mockCharacter,
          {
            ...mockCharacter,
            id: 2,
            name: 'Morty Smith',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(multiCharacterResponse),
      });

      const result = await fetchCharacters();

      expect(result.results).toHaveLength(2);
      expect(result.results[0].name).toBe('Rick Sanchez');
      expect(result.results[1].name).toBe('Morty Smith');
    });
  });

  describe('API Error Handling', () => {
    it('throws error when API request fails with non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchCharacters('InvalidCharacter')).rejects.toThrow(
        'API request failed'
      );
    });

    it('throws error when API request fails with 500 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(fetchCharacters()).rejects.toThrow('API request failed');
    });

    it('throws error when network request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchCharacters()).rejects.toThrow('Network error');
    });

    it('throws error when JSON parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(fetchCharacters()).rejects.toThrow('Invalid JSON');
    });

    it('handles various HTTP error codes', async () => {
      const errorCodes = [400, 401, 403, 404, 500, 502, 503];

      for (const code of errorCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: code,
        });

        await expect(fetchCharacters()).rejects.toThrow('API request failed');
      }

      expect(mockFetch).toHaveBeenCalledTimes(errorCodes.length);
    });
  });

  describe('Parameter Validation and Edge Cases', () => {
    it('handles default parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character',
        { method: 'GET' }
      );
    });

    it('handles undefined search term', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters(undefined as unknown as string);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character',
        { method: 'GET' }
      );
    });

    it('handles zero page number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Rick', 0);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Rick',
        { method: 'GET' }
      );
    });

    it('handles negative page number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Rick', -1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Rick',
        { method: 'GET' }
      );
    });

    it('handles very long search terms', async () => {
      const longSearchTerm = 'a'.repeat(1000);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters(longSearchTerm, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://rickandmortyapi.com/api/character?name=${longSearchTerm}`,
        { method: 'GET' }
      );
    });

    it('handles special characters in search terms', async () => {
      const specialCharacters = 'Rick & Morty™ (C-137)';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters(specialCharacters, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character?name=Rick+%26+Morty%E2%84%A2+%28C-137%29',
        { method: 'GET' }
      );
    });
  });

  describe('URL Construction Tests', () => {
    it('constructs URL correctly with no parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters();

      const [[url]] = mockFetch.mock.calls;
      expect(url).toBe('https://rickandmortyapi.com/api/character');
    });

    it('constructs URL correctly with search parameter only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Rick');

      const [[url]] = mockFetch.mock.calls;
      expect(url).toBe('https://rickandmortyapi.com/api/character?name=Rick');
    });

    it('constructs URL correctly with page parameter only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('', 2);

      const [[url]] = mockFetch.mock.calls;
      expect(url).toBe('https://rickandmortyapi.com/api/character?page=2');
    });

    it('constructs URL correctly with both parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchCharacters('Morty', 3);

      const [[url]] = mockFetch.mock.calls;
      expect(url).toBe(
        'https://rickandmortyapi.com/api/character?name=Morty&page=3'
      );
    });
  });

  describe('Response Type Validation', () => {
    it('returns properly typed response object', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchCharacters();

      expect(result).toHaveProperty('info');
      expect(result).toHaveProperty('results');

      expect(result.info).toHaveProperty('count');
      expect(result.info).toHaveProperty('pages');
      expect(result.info).toHaveProperty('next');
      expect(result.info).toHaveProperty('prev');

      expect(Array.isArray(result.results)).toBe(true);
      if (result.results.length > 0) {
        const character = result.results[0];
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('status');
        expect(character).toHaveProperty('species');
        expect(character).toHaveProperty('type');
        expect(character).toHaveProperty('gender');
        expect(character).toHaveProperty('origin');
        expect(character).toHaveProperty('location');
        expect(character).toHaveProperty('image');
        expect(character).toHaveProperty('episode');
        expect(character).toHaveProperty('url');
        expect(character).toHaveProperty('created');
      }
    });
  });
});
