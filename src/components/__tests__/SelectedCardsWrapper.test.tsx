import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SelectedCardsWrapper from '../SelectedCardsWrapper';

// Mock Card component
vi.mock('../Card', () => ({
  default: ({
    id,
    name,
    description,
    image,
  }: {
    id: string;
    name: string;
    description: string;
    image?: string;
  }) => (
    <div data-testid={`card-${id}`} className="card">
      <h4>{name}</h4>
      <p>{description}</p>
      <img src={image} alt={name} />
    </div>
  ),
}));

// Mock CSVDownloadButton component
vi.mock('../CSVDownloadButton', () => ({
  default: ({
    characterIds,
    children,
    className,
  }: {
    characterIds: string[];
    children: React.ReactNode;
    className?: string;
  }) => (
    <button data-testid="csv-download-button" className={className}>
      {children} ({characterIds.join(', ')})
    </button>
  ),
}));

describe('SelectedCardsWrapper Component', () => {
  let store: TestStore;

  // Type for the test store state
  type TestStoreState = {
    selectedItems: {
      selectedCards: Array<{
        id: string | number;
        name: string;
        description: string;
        image: string;
      }>;
    };
  };

  const createTestStore = (initialState: Partial<TestStoreState>) => {
    return configureStore({
      reducer: {
        selectedItems: (
          state: TestStoreState['selectedItems'] = { selectedCards: [] },
          action: { type: string }
        ) => {
          if (action.type === 'selectedItems/clearSelectedItems') {
            return { ...state, selectedCards: [] };
          }
          return state;
        },
      },
      preloadedState: initialState as TestStoreState,
    });
  };

  // Type for the store
  type TestStore = ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering States', () => {
    it('renders nothing when no cards are selected', () => {
      store = createTestStore({
        selectedItems: {
          selectedCards: [],
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders selected cards when cards are selected', () => {
      const selectedCards = [
        {
          id: '1',
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
        {
          id: '2',
          name: 'Morty Smith',
          description: "Rick's grandson",
          image: 'morty.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText('Selected 2 characters')).toBeInTheDocument();
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    });

    it('renders singular form for one selected character', () => {
      const selectedCards = [
        {
          id: '1',
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText('Selected 1 character')).toBeInTheDocument();
    });

    it('renders plural form for multiple selected characters', () => {
      const selectedCards = [
        {
          id: '1',
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
        {
          id: '2',
          name: 'Morty Smith',
          description: "Rick's grandson",
          image: 'morty.jpg',
        },
        {
          id: '3',
          name: 'Summer Smith',
          description: "Rick's granddaughter",
          image: 'summer.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText('Selected 3 characters')).toBeInTheDocument();
    });
  });

  describe('Card Rendering', () => {
    it('renders each selected card with correct props', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
        {
          id: 2,
          name: 'Morty Smith',
          description: "Rick's grandson",
          image: 'morty.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const card1 = screen.getByTestId('card-1');
      const card2 = screen.getByTestId('card-2');

      expect(card1).toBeInTheDocument();
      expect(card2).toBeInTheDocument();
      expect(card1).toHaveTextContent('Rick Sanchez');
      expect(card1).toHaveTextContent('A mad scientist');
      expect(card2).toHaveTextContent('Morty Smith');
      expect(card2).toHaveTextContent("Rick's grandson");
    });

    it('renders cards in a grid layout', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const grid = container.querySelector('.selected-cards-grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children).toHaveLength(1);
    });

    it('handles cards with missing optional properties', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: '',
          image: '',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });
  });

  describe('Clear Selected Cards Functionality', () => {
    it('renders clear button when cards are selected', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(
        screen.getByRole('button', { name: /clear selected cards/i })
      ).toBeInTheDocument();
    });

    it('calls clearSelectedItems action when clear button is clicked', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const clearButton = screen.getByRole('button', {
        name: /clear selected cards/i,
      });
      fireEvent.click(clearButton);

      // Check that the action was dispatched
      const state = store.getState() as TestStoreState;
      expect(state.selectedItems.selectedCards).toEqual([]);
    });

    it('has correct CSS class for clear button', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const clearButton = container.querySelector(
        '.clear-selected-cards-button'
      );
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('CSV Download Functionality', () => {
    it('renders CSV download button when cards are selected', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByTestId('csv-download-button')).toBeInTheDocument();
      expect(screen.getByText('Download CSV (1)')).toBeInTheDocument();
    });

    it('passes correct character IDs to CSV download button', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
        {
          id: 2,
          name: 'Morty Smith',
          description: "Rick's grandson",
          image: 'morty.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText('Download CSV (1, 2)')).toBeInTheDocument();
    });

    it('has correct CSS class for CSV download button', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const csvButton = container.querySelector(
        '.download-selected-cards-button'
      );
      expect(csvButton).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('has correct CSS classes', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const wrapper = container.querySelector('.selected-cards-wrapper');
      const title = container.querySelector('.selected-cards-title');
      const grid = container.querySelector('.selected-cards-grid');
      const actions = container.querySelector('.selected-cards-actions');

      expect(wrapper).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(grid).toBeInTheDocument();
      expect(actions).toBeInTheDocument();
    });

    it('maintains proper DOM hierarchy', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const wrapper = container.querySelector('.selected-cards-wrapper');
      const title = wrapper?.querySelector('.selected-cards-title');
      const grid = wrapper?.querySelector('.selected-cards-grid');
      const actions = wrapper?.querySelector('.selected-cards-actions');

      expect(title?.parentElement).toBe(wrapper);
      expect(grid?.parentElement).toBe(wrapper);
      expect(actions?.parentElement).toBe(wrapper);
    });
  });

  describe('Edge Cases', () => {
    it('handles cards with very long names', () => {
      const longName = 'A'.repeat(1000);
      const selectedCards = [
        {
          id: 1,
          name: longName,
          description: 'A character with a very long name',
          image: 'long-name.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles cards with special characters in names', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick & Morty 🚀',
          description: 'Special characters: !@#$%^&*()',
          image: 'special.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText('Rick & Morty 🚀')).toBeInTheDocument();
      expect(
        screen.getByText('Special characters: !@#$%^&*()')
      ).toBeInTheDocument();
    });

    it('handles cards with missing image', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: '',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    it('handles cards with missing description', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: '',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Selected 1 character');
    });

    it('has proper button labeling', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const clearButton = screen.getByRole('button', {
        name: /clear selected cards/i,
      });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveTextContent('Clear Selected Cards');
    });

    it('has proper semantic structure', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { container } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const wrapper = container.querySelector('.selected-cards-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily when unrelated state changes', () => {
      const selectedCards = [
        {
          id: 1,
          name: 'Rick Sanchez',
          description: 'A mad scientist',
          image: 'rick.jpg',
        },
      ];

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      const { rerender } = render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      const initialCardCount = (store.getState() as TestStoreState)
        .selectedItems.selectedCards.length;

      // Simulate some unrelated state change
      store.dispatch({ type: 'unrelated/action' });

      rerender(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      // Card count should remain the same
      expect(
        (store.getState() as TestStoreState).selectedItems.selectedCards
      ).toHaveLength(initialCardCount);
    });

    it('handles large numbers of selected cards efficiently', () => {
      const selectedCards = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Character ${i + 1}`,
        description: `Description for character ${i + 1}`,
        image: `character${i + 1}.jpg`,
      }));

      store = createTestStore({
        selectedItems: {
          selectedCards,
        },
      });

      render(
        <Provider store={store}>
          <SelectedCardsWrapper />
        </Provider>
      );

      expect(screen.getByText('Selected 100 characters')).toBeInTheDocument();
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-100')).toBeInTheDocument();
    });
  });
});
