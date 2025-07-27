import React, { useState, useEffect } from 'react';
import { SearchProvider } from './context/SearchProvider';
import ErrorBoundary from './ErrorBoundary';
import Header from './components/Header';
import SearchStatus from './components/SearchStatus';
import Results from './components/Results';
import CharacterDetails from './components/CharacterDetails';

const App: React.FC = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
  };

  useEffect(() => {
    if (selectedCharacterId) {
      const url = new URL(window.location.href);
      url.searchParams.set('character', selectedCharacterId.toString());
      window.history.pushState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('character');
      window.history.pushState({}, '', url.toString());
    }
  }, [selectedCharacterId]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const characterId = urlParams.get('character');

      if (characterId) {
        setSelectedCharacterId(parseInt(characterId, 10));
        setIsDetailsOpen(true);
      } else {
        setSelectedCharacterId(null);
        setIsDetailsOpen(false);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('character');
    if (characterId) {
      setSelectedCharacterId(parseInt(characterId, 10));
      setIsDetailsOpen(true);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleCharacterSelect = (characterId: number) => {
    setSelectedCharacterId(characterId);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedCharacterId(null);
  };

  const handleMainContentClick = () => {
    if (isDetailsOpen) {
      handleCloseDetails();
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SearchProvider>
        <div className="app">
          <div
            className={`app-content ${isDetailsOpen ? 'details-open' : ''}`}
            onClick={handleMainContentClick}
          >
            <Header />
            <SearchStatus />
            <Results onCharacterSelect={handleCharacterSelect} />
          </div>

          <CharacterDetails
            characterId={selectedCharacterId}
            isOpen={isDetailsOpen}
            onClose={handleCloseDetails}
          />
        </div>
      </SearchProvider>
    </ErrorBoundary>
  );
};

export default App;
