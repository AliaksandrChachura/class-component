import React from 'react';
import useLocalStorageOperations from '../hooks/useLocalStorageOperations';
import '../styles/Card.scss';

interface Props {
  name: string;
  description: string;
  image?: string;
}

const Card: React.FC<Props> = ({ name, description, image }) => {
  const { setItem } = useLocalStorageOperations();

  const handleSelectedCharacter = () => {
    setItem('selectedCharacter', { name, description, image });
  };

  return (
    <div
      className="card"
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
