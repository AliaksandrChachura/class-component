import { describe, it, expect } from 'vitest';
import selectedItemsReducer, {
  toggleSelectedItem,
  clearSelectedItems,
} from '../cardsSlicer';
import type { Card } from '../../../types';

describe('cardsSlicer', () => {
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

  describe('toggleSelectedItem', () => {
    it('should add a card when it is not in selected cards', () => {
      const initialState = {
        selectedCards: [mockCard1],
      };

      const action = toggleSelectedItem(mockCard2);
      const newState = selectedItemsReducer(initialState, action);

      expect(newState.selectedCards).toHaveLength(2);
      expect(newState.selectedCards).toContain(mockCard1);
      expect(newState.selectedCards).toContain(mockCard2);
    });

    it('should remove a card when it is already in selected cards', () => {
      const initialState = {
        selectedCards: [mockCard1, mockCard2],
      };

      const action = toggleSelectedItem(mockCard1);
      const newState = selectedItemsReducer(initialState, action);

      expect(newState.selectedCards).toHaveLength(1);
      expect(newState.selectedCards).not.toContain(mockCard1);
      expect(newState.selectedCards).toContain(mockCard2);
    });

    it('should handle empty selected cards array', () => {
      const initialState = {
        selectedCards: [],
      };

      const action = toggleSelectedItem(mockCard1);
      const newState = selectedItemsReducer(initialState, action);

      expect(newState.selectedCards).toHaveLength(1);
      expect(newState.selectedCards).toContain(mockCard1);
    });

    it('should handle removing the last card', () => {
      const initialState = {
        selectedCards: [mockCard1],
      };

      const action = toggleSelectedItem(mockCard1);
      const newState = selectedItemsReducer(initialState, action);

      expect(newState.selectedCards).toHaveLength(0);
      expect(newState.selectedCards).toEqual([]);
    });
  });

  describe('clearSelectedItems', () => {
    it('should clear all selected cards', () => {
      const initialState = {
        selectedCards: [mockCard1, mockCard2],
      };

      const action = clearSelectedItems();
      const newState = selectedItemsReducer(initialState, action);

      expect(newState.selectedCards).toHaveLength(0);
      expect(newState.selectedCards).toEqual([]);
    });

    it('should handle clearing empty selected cards array', () => {
      const initialState = {
        selectedCards: [],
      };

      const action = clearSelectedItems();
      const newState = selectedItemsReducer(initialState, action);

      expect(newState.selectedCards).toHaveLength(0);
      expect(newState.selectedCards).toEqual([]);
    });
  });

  describe('initial state', () => {
    it('should have empty selected cards array', () => {
      const initialState = selectedItemsReducer(undefined, { type: '@@INIT' });

      expect(initialState.selectedCards).toEqual([]);
    });
  });
});
