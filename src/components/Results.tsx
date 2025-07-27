import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { fetchCharacters } from '../api/rickMortyAPI';
import type { Character, RickMortyResponse } from '../api/rickMortyAPI';
import Card from './Card';
import Loader from './Loader';
import Pagination from './Pagination';
import NotFoundPage from './NotFoundPage';

interface ResultsProps {
  onCharacterSelect?: (characterId: number) => void;
}

const Results: React.FC<ResultsProps> = ({ onCharacterSelect }) => {
  const { state } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<
    RickMortyResponse['info'] | null
  >(null);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const isCharacterDetailsRoute = /\/results\/\d+/.test(
      window.location.pathname
    );
    if (isCharacterDetailsRoute) return;

    const params = new URLSearchParams(searchParams);
    if (state.searchTerm) {
      params.set('q', state.searchTerm);
    } else {
      params.delete('q');
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    setSearchParams(params);
  }, [state.searchTerm, currentPage, setSearchParams, searchParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams();
      if (state.searchTerm) {
        newParams.set('q', state.searchTerm);
      }
      if (page > 1) {
        newParams.set('page', page.toString());
      }
      window.history.pushState({}, '', `/results?${newParams.toString()}`);
      setSearchParams(newParams);
    },
    [state.searchTerm, setSearchParams]
  );

  useEffect(() => {
    const searchCharacters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchCharacters(state.searchTerm, currentPage);
        setCharacters(response.results);
        console.log(response.results);
        setPaginationInfo(response.info);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch characters'
        );
        setCharacters([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    searchCharacters();
  }, [state.searchTerm, currentPage]);

  useEffect(() => {
    if (currentPage > 1) {
      handlePageChange(1);
    }
  }, [state.searchTerm, currentPage, handlePageChange]);

  const getCharacterDescription = (character: Character): string => {
    const statusEmoji =
      character.status === 'Alive'
        ? '🟢'
        : character.status === 'Dead'
          ? '🔴'
          : '❓';
    const origin =
      character.origin.name === 'unknown'
        ? 'an unknown location'
        : character.origin.name;
    const location =
      character.location.name === 'unknown'
        ? 'an unknown location'
        : character.location.name;
    return `${statusEmoji} ${character.status} ${character.species} from ${origin}. Currently at: ${location}`;
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (characters.length === 0 && !isLoading && !error) {
    return (
      <div className="no-results">
        <p>No characters found.</p>
      </div>
    );
  }

  return (
    <div className="results">
      {isLoading && <Loader />}
      {characters.length === 0 ? (
        <NotFoundPage />
      ) : (
        <div className="results-grid">
          {characters.map((character) => (
            <Card
              key={character.id}
              name={character.name}
              description={getCharacterDescription(character)}
              image={character.image}
              onClick={() => onCharacterSelect?.(character.id)}
            />
          ))}
        </div>
      )}
      {paginationInfo && paginationInfo.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={paginationInfo.pages}
          onPageChange={handlePageChange}
          hasNextPage={!!paginationInfo.next}
          hasPrevPage={!!paginationInfo.prev}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Results;
