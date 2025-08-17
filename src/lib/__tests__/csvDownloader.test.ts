import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  downloadCharactersCSV,
  downloadCharactersCSVByIds,
  downloadCharactersCSVWithProgress,
} from '../csvDownloader';

// Define mock response interface
interface MockResponse {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
}

// Mock fetch globally
global.fetch = vi.fn();

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

describe('csvDownloader', () => {
  const mockCharacter = {
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
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z',
  };

  const mockCharacters = [mockCharacter];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    });

    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadCharactersCSV', () => {
    it('successfully downloads CSV with character data', async () => {
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSV(mockCharacters);

      expect(fetch).toHaveBeenCalledWith('/api/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characters: mockCharacters }),
      });

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('handles HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ message: 'Internal server error' }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await expect(downloadCharactersCSV(mockCharacters)).rejects.toThrow(
        'Internal server error'
      );

      expect(fetch).toHaveBeenCalledWith('/api/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characters: mockCharacters }),
      });
    });

    it('handles network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(downloadCharactersCSV(mockCharacters)).rejects.toThrow(
        'Network error'
      );
    });

    it('handles JSON parse errors in error response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await expect(downloadCharactersCSV(mockCharacters)).rejects.toThrow(
        'Unknown error occurred'
      );

      expect(fetch).toHaveBeenCalledWith('/api/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characters: mockCharacters }),
      });
    });

    it('creates correct blob and download link', async () => {
      const csvContent = 'name,status,species\nRick Sanchez,Alive,Human';
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue(csvContent),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSV(mockCharacters);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('downloadCharactersCSVByIds', () => {
    it('successfully downloads CSV using character IDs', async () => {
      const characterIds = ['1', '2', '3'];
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=1%2C2%2C3', {
        method: 'GET',
      });

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('handles single character ID', async () => {
      const characterIds = ['1'];
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=1', {
        method: 'GET',
      });
    });

    it('handles empty character IDs array', async () => {
      const characterIds: string[] = [];
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('name,status,species\n'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=', {
        method: 'GET',
      });
    });

    it('handles HTTP error responses', async () => {
      const characterIds = ['1', '2'];
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ message: 'Characters not found' }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await expect(downloadCharactersCSVByIds(characterIds)).rejects.toThrow(
        'Characters not found'
      );
    });

    it('handles network errors gracefully', async () => {
      const characterIds = ['1'];
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(downloadCharactersCSVByIds(characterIds)).rejects.toThrow(
        'Network error'
      );
    });

    it('encodes special characters in IDs correctly', async () => {
      const characterIds = ['1', '2&3', '4,5'];
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('name,status,species\n'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=1%2C2%263%2C4%2C5', {
        method: 'GET',
      });
    });
  });

  describe('downloadCharactersCSVWithProgress', () => {
    it('successfully downloads CSV with progress updates', async () => {
      const characterIds = ['1', '2', '3'];
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      const onProgress = vi.fn();

      await downloadCharactersCSVWithProgress(characterIds, onProgress);

      expect(onProgress).toHaveBeenCalledWith(0);
      expect(onProgress).toHaveBeenCalledWith(100);
      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=1%2C2%2C3', {
        method: 'GET',
      });
    });

    it('works without progress callback', async () => {
      const characterIds = ['1'];
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await expect(
        downloadCharactersCSVWithProgress(characterIds)
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=1', {
        method: 'GET',
      });
    });

    it('handles HTTP error responses with progress', async () => {
      const characterIds = ['1', '2'];
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ message: 'Server error' }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      const onProgress = vi.fn();

      await expect(
        downloadCharactersCSVWithProgress(characterIds, onProgress)
      ).rejects.toThrow('Server error');

      expect(onProgress).toHaveBeenCalledWith(0);
      expect(onProgress).not.toHaveBeenCalledWith(100);
    });

    it('handles network errors with progress', async () => {
      const characterIds = ['1'];
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const onProgress = vi.fn();

      await expect(
        downloadCharactersCSVWithProgress(characterIds, onProgress)
      ).rejects.toThrow('Network error');

      expect(onProgress).toHaveBeenCalledWith(0);
      expect(onProgress).not.toHaveBeenCalledWith(100);
    });

    it('handles empty character IDs array with progress', async () => {
      const characterIds: string[] = [];
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('name,status,species\n'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      const onProgress = vi.fn();

      await downloadCharactersCSVWithProgress(characterIds, onProgress);

      expect(onProgress).toHaveBeenCalledWith(0);
      expect(onProgress).toHaveBeenCalledWith(100);
      expect(fetch).toHaveBeenCalledWith('/api/csv?ids=', {
        method: 'GET',
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long character IDs arrays', async () => {
      const characterIds = Array.from({ length: 1000 }, (_, i) => i.toString());
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('name,status,species\n'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      expect(fetch).toHaveBeenCalledWith(
        `/api/csv?ids=${encodeURIComponent(characterIds.join(','))}`,
        {
          method: 'GET',
        }
      );
    });

    it('handles special characters in CSV content', async () => {
      const csvContent =
        'name,status,species\n"Rick & Morty",Alive,"Human, Alien"';
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue(csvContent),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSV(mockCharacters);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('handles large CSV content', async () => {
      const largeCsvContent =
        'name,status,species\n' + 'Rick,Alive,Human\n'.repeat(10000);
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue(largeCsvContent),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSV(mockCharacters);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('handles DOM manipulation errors gracefully', async () => {
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      // Mock DOM manipulation to throw error
      mockAppendChild.mockImplementation(() => {
        throw new Error('DOM manipulation error');
      });

      await expect(downloadCharactersCSV(mockCharacters)).rejects.toThrow(
        'DOM manipulation error'
      );
    });
  });

  describe('File Naming', () => {
    it('generates correct filename for character data download', async () => {
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSV(mockCharacters);

      const mockLink = mockCreateElement.mock.results[0].value;
      expect(mockLink.download).toBe('characters_1_items.csv');
    });

    it('generates correct filename for character IDs download', async () => {
      const characterIds = ['1', '2', '3'];
      const mockResponse = {
        ok: true,
        text: vi
          .fn()
          .mockResolvedValue('name,status,species\nRick Sanchez,Alive,Human'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      const mockLink = mockCreateElement.mock.results[0].value;
      expect(mockLink.download).toBe('characters_3_items.csv');
    });

    it('generates correct filename for empty character IDs', async () => {
      const characterIds: string[] = [];
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('name,status,species\n'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as MockResponse);

      await downloadCharactersCSVByIds(characterIds);

      const mockLink = mockCreateElement.mock.results[0].value;
      expect(mockLink.download).toBe('characters_0_items.csv');
    });
  });
});
