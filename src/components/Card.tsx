import React from 'react';
import useLocalStorageOperations from '../hooks/useLocalStorageOperations';
import { useSearchContext } from '../context/SearchContext';

interface Props {
  name: string;
  description: string;
  image?: string;
  onClick?: () => void;
}

const Card: React.FC<Props> = ({ name, description, image, onClick }) => {
  const { setItem } = useLocalStorageOperations();
  const { state } = useSearchContext();
  const handleSelectedCharacter = () => {
    setItem('selectedCharacter', { name, description, image });
    if (onClick) {
      onClick();
    }
  };
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
            <img src={image} alt={name} loading="lazy" />
          </div>
        )}
        <div className="card-content">
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
