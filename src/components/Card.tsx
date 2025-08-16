import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import useLocalStorageOperations from '../hooks/useLocalStorageOperations';
import { useSearchContext } from '../context/SearchContext';
import { toggleSelectedItem } from '../store/slices/cardsSlicer';
import type { RootState } from '../store';

interface Props {
  name: string;
  description: string;
  image?: string;
  onClick?: () => void;
}

const Card: React.FC<Props> = ({ name, description, image, onClick }) => {
  const { setItem } = useLocalStorageOperations();
  const { state } = useSearchContext();
  const dispatch = useDispatch();
  const selectedCards = useSelector(
    (state: RootState) => state.selectedItems.selectedCards
  );

  const handleSelectedCharacter = () => {
    setItem('selectedCharacter', { name, description, image });
    if (onClick) {
      onClick();
    }
  };
  const [checked, setChecked] = useState(false);

  const handleCheckCharacter = () => {
    setChecked(!checked);
    dispatch(
      toggleSelectedItem({ id: name, name, description, image: image || '' })
    );
  };

  const isSelected = selectedCards.some((card) => card.id === name);

  const cardClass = `card ${state.theme}`;

  return (
    <div
      className={cardClass}
      role="button"
      tabIndex={0}
      onClick={handleSelectedCharacter}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSelectedCharacter();
        }
      }}
    >
      <div className="card-layout">
        {image && (
          <div className="card-image">
            <Image
              src={image}
              alt={name}
              width={300}
              height={300}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="card-content">
          <div
            className="card-content-checkbox"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckCharacter}
            />
          </div>
          <div className="card-content-header">
            <h3>{name}</h3>
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
