import type { Card } from '../types';

function isCardInSelectedCards(cards: Card[], card: Card) {
  return cards.some((c) => c.id === card.id);
}

function downloadCsv(cards: Card[]) {
  const csvContent = cards
    .map((card) => `${card.name},${card.description},${card.image}`)
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cards.length}_items.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export { isCardInSelectedCards, downloadCsv };
