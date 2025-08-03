import type { Card } from '../types';

function isCardInSelectedCards(cards: Card[], card: Card) {
  return cards.some((c) => c.id === card.id);
}

export { isCardInSelectedCards };
