import React, { useEffect, useState } from 'react';
import { fetchCharacterDetails } from '../api/rickMortyAPI';
import type { Character } from '../api/rickMortyAPI';
import Loader from './Loader';

interface CharacterDetailsProps {
  characterId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({
  characterId,
  isOpen,
  onClose,
}) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCharacterDetails = async () => {
      if (!characterId) return;

      setLoading(true);
      setError(null);

      try {
        const characterData = await fetchCharacterDetails(characterId);
        setCharacter(characterData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load character details'
        );
        setCharacter(null);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && characterId) {
      loadCharacterDetails();
    }
  }, [characterId, isOpen]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'alive':
        return '#55cc44';
      case 'dead':
        return '#d63d2e';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="character-details-overlay">
      <div className="character-details-panel">
        <div className="character-details-header">
          <h2>Character Details</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close details panel"
          >
            ×
          </button>
        </div>

        <div className="character-details-content">
          {loading && (
            <div className="details-loader">
              <Loader />
              <p>Loading character details...</p>
            </div>
          )}

          {error && (
            <div className="details-error">
              <p>Error: {error}</p>
              <button onClick={onClose} className="retry-button">
                Close
              </button>
            </div>
          )}

          {character && !loading && (
            <div className="character-info">
              <div className="character-image-section">
                <img
                  src={character.image}
                  alt={character.name}
                  className="character-detail-image"
                />
                <div className="character-basic-info">
                  <h3>{character.name}</h3>
                  <div className="status-indicator">
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor: getStatusColor(character.status),
                      }}
                    ></span>
                    <span>
                      {character.status} - {character.species}
                    </span>
                  </div>
                </div>
              </div>

              <div className="character-details-grid">
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-item">
                    <span className="label">Gender:</span>
                    <span className="value">{character.gender}</span>
                  </div>
                  {character.type && (
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{character.type}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">
                      {formatDate(character.created)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Location Information</h4>
                  <div className="detail-item">
                    <span className="label">Origin:</span>
                    <span className="value">{character.origin.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Known Location:</span>
                    <span className="value">{character.location.name}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Episodes</h4>
                  <div className="episodes-info">
                    <span>
                      Appeared in <strong>{character.episode.length}</strong>{' '}
                      episodes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;
