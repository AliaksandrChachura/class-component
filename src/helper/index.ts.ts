import type { Card } from '../types';
import { downloadCharactersCSVByIds } from '../lib/csvDownloader';

function isCardInSelectedCards(cards: Card[], card: Card) {
  return cards.some((c) => c.id === card.id);
}

/**
 * Downloads a CSV file containing character data using the server action
 * @param characterIds Array of character IDs to include in the CSV
 */
async function downloadCsv(characterIds: string[]) {
  try {
    await downloadCharactersCSVByIds(characterIds);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}

export { isCardInSelectedCards, downloadCsv };
