import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SelectedItemsState, Card } from '../../types';
import { isCardInSelectedCards } from '../../helper/index.ts';

const initialState: SelectedItemsState = {
  selectedCards: [],
};

const selectedItemsSlice = createSlice({
  name: 'selectedItems',
  initialState,
  reducers: {
    toggleSelectedItem(state, action: PayloadAction<Card>) {
      const card = action.payload;
      if (isCardInSelectedCards(state.selectedCards, card)) {
        state.selectedCards = state.selectedCards.filter(
          (item) => item.id !== card.id
        );
      } else {
        state.selectedCards.push(card);
      }
    },
    clearSelectedItems(state) {
      state.selectedCards = [];
    },
  },
});

export const { toggleSelectedItem, clearSelectedItems } =
  selectedItemsSlice.actions;
export default selectedItemsSlice.reducer;
