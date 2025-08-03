interface State {
  searchTerm: string;
}

interface Card {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface SelectedItemsState {
  selectedCards: Card[];
}

export type { State, Card, SelectedItemsState };
