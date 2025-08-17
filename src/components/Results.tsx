'use client';
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from './CreateNavigation';
import { useSearch } from '../hooks/useSearch';
import type { RickMortyResponse, Character } from '../types/api';
import { useSearchContext } from '../context/SearchContext';
import { useGetCharactersQuery } from '../api/endpoints/charactersApi';
import Card from './Card';
import Loader from './Loader';
import Pagination from './Pagination';
import NotFoundPage from './NotFoundPage';
import SelectedCardsWrapper from './SelectedCardsWrapper';

interface ResultsProps {
  onCharacterSelect?: (characterId: number) => void;
  initialData?: RickMortyResponse;
}

const Results: React.FC<ResultsProps> = ({
  onCharacterSelect,
  initialData,
}) => {
  const { state } = useSearch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentPage } = useSearchContext();
  const [showError, setShowError] = useState(false);

  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );

  const searchTerm = state.searchTerm || searchParams.get('q') || '';

  const { data: queryData, isLoading: isQueryLoading } = useGetCharactersQuery(
    {
      pageNumber: currentPage,
      name: searchTerm,
      pageSize: 20,
    },
    {
      skip: !!initialData,
    }
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }

    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }

    const newParamsString = params.toString();
    if (newParamsString !== searchParams.toString()) {
      const queryObj: Record<string, string> = {};
      params.forEach((value, key) => {
        queryObj[key] = value;
      });

      router.push({ pathname: '/results', query: queryObj });
    }
  }, [searchTerm, currentPage, router, searchParams]);

  const data = initialData || queryData;
  const isLoading = !data || isQueryLoading;

  useEffect(() => {
    if (!data && !isLoading) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [data, isLoading]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);

      const updatedParams = new URLSearchParams(searchParams);

      if (state.searchTerm) {
        updatedParams.set('q', state.searchTerm);
      }

      if (page > 1) {
        updatedParams.set('page', page.toString());
      } else {
        updatedParams.delete('page');
      }

      const queryObj: Record<string, string> = {};
      updatedParams.forEach((value, key) => {
        queryObj[key] = value;
      });

      router.push({ pathname: '/results', query: queryObj });
    },
    [state.searchTerm, router, searchParams, setCurrentPage]
  );

  const characters: Character[] = data?.results ?? [];
  const paginationInfo: RickMortyResponse['info'] | null = data?.info ?? null;

  const getErrorMessage = (): string => {
    return 'Failed to load characters. Please try again.';
  };

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

  if (characters.length === 0 && !isLoading) {
    return (
      <div className="no-results">
        <p>No characters found.</p>
      </div>
    );
  }

  return (
    <div className="results">
      {showError && (
        <div className="error-toast">
          <div className="error-toast-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{getErrorMessage()}</span>
            <button
              className="error-close-btn"
              onClick={() => setShowError(false)}
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {isLoading && <Loader />}
      {characters.length === 0 ? (
        <NotFoundPage />
      ) : (
        <div className="results-grid">
          {characters.map((character) => (
            <Card
              key={character.id}
              id={character.id.toString()}
              name={character.name}
              description={getCharacterDescription(character)}
              image={character.image}
              onClick={() => onCharacterSelect?.(character.id)}
            />
          ))}
        </div>
      )}
      <SelectedCardsWrapper />
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
