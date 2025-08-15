'use client';
import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCachedCharacter } from '../hooks/useCachedCharacter';

const CharacterDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const id = Number(Array.isArray(params?.id) ? params.id[0] : params?.id);

  const { character, isLoading, isError: error } = useCachedCharacter({ id });

  const handleClose = () => {
    const qs = searchParams?.toString();

    if (qs) {
      router.push(`/${locale}/results?${qs}`);
    } else {
      router.push(`/${locale}/results`);
    }
  };

  const handlePanelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="character-details-container">
        <div className="character-details-panel">
          <div className="character-details-header">
            <h2>Character Details</h2>
            <button
              className="close-button"
              onClick={handleClose}
              aria-label="Close details panel"
            >
              ×
            </button>
          </div>
          <div className="character-details-content">
            <div className="loading-state">
              <div className="loader-spinner"></div>
              <p>Loading character details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="character-details-container">
        <div className="character-details-panel">
          <div className="character-details-header">
            <h2>Character Details</h2>
            <button
              className="close-button"
              onClick={handleClose}
              aria-label="Close details panel"
            >
              ×
            </button>
          </div>
          <div className="character-details-content">
            <div className="error-state">
              <p>Error loading character details. Please try again.</p>
              <button
                onClick={handleClose}
                className="error-close-button"
                aria-label="Close details panel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no character found state
  if (!character) {
    return (
      <div className="character-details-container">
        <div className="character-details-panel">
          <div className="character-details-header">
            <h2>Character Details</h2>
            <button
              className="close-button"
              onClick={handleClose}
              aria-label="Close details panel"
            >
              ×
            </button>
          </div>
          <div className="character-details-content">
            <div className="no-character-state">
              <p>Character not found.</p>
              <button
                onClick={handleClose}
                className="no-character-close-button"
                aria-label="Close details panel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show character details
  return (
    <div className="character-details-container" onClick={handleClose}>
      <div className="character-details-panel" onClick={handlePanelClick}>
        <div className="character-details-header">
          <h2>Character Details</h2>
          <button
            className="close-button"
            onClick={handleClose}
            aria-label="Close details panel"
          >
            ×
          </button>
        </div>

        <div className="character-details-content">
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
                  <span className="value">{formatDate(character.created)}</span>
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
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;
