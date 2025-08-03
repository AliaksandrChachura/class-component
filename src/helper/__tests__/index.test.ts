import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isCardInSelectedCards, downloadCsv } from '../index.ts';
import type { Card } from '../../types';

const mockCreateElement = vi.fn();
const mockClick = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn();

const mockURL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
};

const mockDocument = {
  createElement: mockCreateElement,
};

describe('helper functions', () => {
  const mockCard1: Card = {
    id: '1',
    name: 'Test Card 1',
    description: 'Test Description 1',
    image: 'test-image-1.jpg',
  };

  const mockCard2: Card = {
    id: '2',
    name: 'Test Card 2',
    description: 'Test Description 2',
    image: 'test-image-2.jpg',
  };

  beforeEach(() => {
    global.document = mockDocument as unknown as typeof document;
    global.URL = mockURL as unknown as typeof URL;

    vi.clearAllMocks();

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

  describe('isCardInSelectedCards', () => {
    it('should return true when card is in selected cards', () => {
      const selectedCards = [mockCard1, mockCard2];
      const result = isCardInSelectedCards(selectedCards, mockCard1);

      expect(result).toBe(true);
    });

    it('should return false when card is not in selected cards', () => {
      const selectedCards = [mockCard2];
      const result = isCardInSelectedCards(selectedCards, mockCard1);

      expect(result).toBe(false);
    });

    it('should return false when selected cards array is empty', () => {
      const selectedCards: Card[] = [];
      const result = isCardInSelectedCards(selectedCards, mockCard1);

      expect(result).toBe(false);
    });

    it('should match cards by id', () => {
      const cardWithSameId: Card = {
        id: '1',
        name: 'Different Name',
        description: 'Different Description',
        image: 'different-image.jpg',
      };

      const selectedCards = [mockCard1];
      const result = isCardInSelectedCards(selectedCards, cardWithSameId);

      expect(result).toBe(true);
    });
  });

  describe('downloadCsv', () => {
    it('should create and download CSV file with correct content', () => {
      const cards = [mockCard1, mockCard2];
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      mockCreateElement.mockReturnValue(mockAnchor);

      downloadCsv(cards);

      expect(mockCreateElement).toHaveBeenCalledWith('a');

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));

      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe('2_items.csv');

      expect(mockClick).toHaveBeenCalled();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty cards array', () => {
      const cards: Card[] = [];
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      mockCreateElement.mockReturnValue(mockAnchor);

      downloadCsv(cards);

      expect(mockAnchor.download).toBe('0_items.csv');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should create correct CSV content', () => {
      const cards = [mockCard1, mockCard2];
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      mockCreateElement.mockReturnValue(mockAnchor);

      downloadCsv(cards);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text/csv',
        })
      );

      const blobCall = mockCreateObjectURL.mock.calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
    });

    it('should handle single card', () => {
      const cards = [mockCard1];
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };

      mockCreateElement.mockReturnValue(mockAnchor);

      downloadCsv(cards);

      expect(mockAnchor.download).toBe('1_items.csv');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });
});
