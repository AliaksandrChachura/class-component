import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NextIntlClientProvider } from 'next-intl';
import Card from '../Card';
import { SearchProvider } from '../../context/SearchProvider';
import cardsReducer from '../../store/slices/cardsSlicer';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    style,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
  }) => <img src={src} alt={alt} width={width} height={height} style={style} />,
}));

// Mock useLocalStorageOperations
const mockSetItem = vi.fn();
vi.mock('../../hooks/useLocalStorageOperations', () => ({
  default: () => ({
    setItem: mockSetItem,
  }),
}));

// Create test store
const createTestStore = (preloadedState: Record<string, unknown> = {}) =>
  configureStore({
    reducer: {
      selectedItems: cardsReducer,
    },
    preloadedState: {
      selectedItems: {
        selectedCards: [],
        ...(preloadedState.selectedItems as Record<string, unknown>),
      },
    },
  });

// Test data
const TEST_CHARACTER = {
  id: '1',
  name: 'Rick Sanchez',
  description: 'A brilliant scientist',
  image: 'https://example.com/rick.jpg',
};

// Messages for internationalization
const messages = {
  common: {
    language: 'Language',
  },
};

// Render function
const renderCard = (props = {}, additionalProps = {}, storeState = {}) => {
  const store = createTestStore(storeState);

  return {
    ...render(
      <Provider store={store}>
        <NextIntlClientProvider messages={messages} locale="en">
          <SearchProvider>
            <Card {...TEST_CHARACTER} {...props} {...additionalProps} />
          </SearchProvider>
        </NextIntlClientProvider>
      </Provider>
    ),
    store,
  };
};

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders card with all required information', () => {
      renderCard();

      expect(screen.getByText(TEST_CHARACTER.name)).toBeInTheDocument();
      expect(screen.getByText(TEST_CHARACTER.description)).toBeInTheDocument();
      expect(screen.getByAltText(TEST_CHARACTER.name)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders card without image when image prop is not provided', () => {
      renderCard({}, { image: undefined });

      expect(screen.getByText(TEST_CHARACTER.name)).toBeInTheDocument();
      expect(
        screen.queryByAltText(TEST_CHARACTER.name)
      ).not.toBeInTheDocument();
    });

    it('applies correct CSS classes and accessibility attributes', () => {
      renderCard();

      const card = screen.getByRole('button');
      const checkbox = screen.getByRole('checkbox');

      expect(card).toHaveClass('card');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when card is clicked', () => {
      const mockOnClick = vi.fn();
      renderCard({}, { onClick: mockOnClick });

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Enter key is pressed', () => {
      const mockOnClick = vi.fn();
      renderCard({}, { onClick: mockOnClick });

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', () => {
      const mockOnClick = vi.fn();
      renderCard({}, { onClick: mockOnClick });

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick for other keys', () => {
      const mockOnClick = vi.fn();
      renderCard({}, { onClick: mockOnClick });

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Tab' });

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('handles checkbox click without triggering card click', () => {
      const mockOnClick = vi.fn();
      renderCard({}, { onClick: mockOnClick });

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Checkbox Functionality', () => {
    it('updates checkbox state when clicked', () => {
      const { store } = renderCard();

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);

      // Check that Redux state was updated
      const state = store.getState();
      expect(state.selectedItems.selectedCards).toHaveLength(1);
      expect(state.selectedItems.selectedCards[0].id).toBe(TEST_CHARACTER.id);
    });

    it('toggles checkbox state correctly', () => {
      const { store } = renderCard();

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

      // First click - should add to selected cards
      fireEvent.click(checkbox);
      let state = store.getState();
      expect(state.selectedItems.selectedCards).toHaveLength(1);

      // Second click - should remove from selected cards
      fireEvent.click(checkbox);
      state = store.getState();
      expect(state.selectedItems.selectedCards).toHaveLength(0);
    });
  });

  describe('Redux Integration', () => {
    it('dispatches toggleSelectedItem action when checkbox is clicked', () => {
      const { store } = renderCard();

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const state = store.getState();
      expect(state.selectedItems.selectedCards).toHaveLength(1);
      expect(state.selectedItems.selectedCards[0]).toEqual({
        ...TEST_CHARACTER,
        image: TEST_CHARACTER.image || '',
      });
    });
  });

  describe('Local Storage Integration', () => {
    it('calls setItem when card is clicked', () => {
      renderCard();

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockSetItem).toHaveBeenCalledWith('selectedCharacter', {
        id: TEST_CHARACTER.id,
        name: TEST_CHARACTER.name,
        description: TEST_CHARACTER.description,
        image: TEST_CHARACTER.image,
      });
    });

    it('calls setItem with correct data when image is undefined', () => {
      renderCard({}, { image: undefined });

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockSetItem).toHaveBeenCalledWith('selectedCharacter', {
        id: TEST_CHARACTER.id,
        name: TEST_CHARACTER.name,
        description: TEST_CHARACTER.description,
        image: undefined,
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty description gracefully', () => {
      renderCard({}, { description: '' });

      // Find the description paragraph specifically
      const descriptionElement = screen.getByRole('button').querySelector('p');
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement?.textContent).toBe('');
    });

    it('handles very long names and descriptions', () => {
      const longName = 'A'.repeat(100);
      const longDescription = 'B'.repeat(200);

      renderCard({}, { name: longName, description: longDescription });

      expect(screen.getByText(longName)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});
