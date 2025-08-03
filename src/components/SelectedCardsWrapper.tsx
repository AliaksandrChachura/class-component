import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { downloadCsv } from '../helper/index.ts';
import { clearSelectedItems } from '../store/slices/cardsSlicer';
import { useDispatch } from 'react-redux';
import Card from './Card';

const SelectedCardsWrapper: React.FC = () => {
  const selectedCards = useSelector(
    (state: RootState) => state.selectedItems.selectedCards
  );
  const dispatch = useDispatch();

  const handleClearSelectedCards = () => {
    dispatch(clearSelectedItems());
  };

  const handleDownloadSelectedCards = () => {
    downloadCsv(selectedCards);
  };

  if (selectedCards.length === 0) {
    return null;
  }

  return (
    <div className="selected-cards-wrapper">
      <h3 className="selected-cards-title">
        Selected {selectedCards.length}{' '}
        {selectedCards.length > 1 ? 'characters' : 'character'}
      </h3>
      <div className="selected-cards-grid">
        {selectedCards.map((card) => (
          <Card
            key={card.id}
            name={card.name}
            description={card.description}
            image={card.image}
          />
        ))}
      </div>
      <div className="selected-cards-actions">
        <button
          className="clear-selected-cards-button"
          onClick={handleClearSelectedCards}
        >
          Clear Selected Cards
        </button>
        <button
          className="download-selected-cards-button"
          onClick={handleDownloadSelectedCards}
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default SelectedCardsWrapper;
