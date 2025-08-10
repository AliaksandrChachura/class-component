import React, { useEffect, useCallback, useMemo } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useGetCharactersQuery } from '../api/endpoints/charactersApi';
import type { Character, RickMortyResponse } from '../api/types';
import { useSearchContext } from '../context/SearchContext';
import Card from './Card';
import Loader from './Loader';
import Pagination from './Pagination';
import NotFoundPage from './NotFoundPage';
import SelectedCardsWrapper from './SelectedCardsWrapper';

interface ResultsProps {
  onCharacterSelect?: (characterId: number) => void;
}

const Results: React.FC<ResultsProps> = ({ onCharacterSelect }) => {
  const { state } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentPage } = useSearchContext();

  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );

  const searchTerm = state.searchTerm || searchParams.get('q') || '';

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

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
      navigate(`/results?${params.toString()}`, { replace: false });
    }
  }, [searchTerm, currentPage, setSearchParams, navigate, searchParams]);

  const {
    data,
    error: queryError,
    isLoading,
    isFetching,
  } = useGetCharactersQuery(
    {
      pageNumber: currentPage,
      pageSize: 20,
      name: searchTerm || undefined,
    }
    // { skip: !searchTerm }
  );

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

      navigate(`/results?${updatedParams.toString()}`, { replace: false });
    },
    [state.searchTerm, navigate, searchParams, setCurrentPage]
  );

  const characters: Character[] = data?.results ?? [];
  const paginationInfo: RickMortyResponse['info'] | null = data?.info ?? null;

  const isFetchBaseQueryError = (
    error: unknown
  ): error is FetchBaseQueryError =>
    typeof error === 'object' && error !== null && 'status' in error;

  const isSerializedError = (error: unknown): error is SerializedError =>
    typeof error === 'object' && error !== null && 'message' in error;

  const getErrorMessage = (error: unknown): string => {
    if (isFetchBaseQueryError(error)) {
      const dataField = (error as FetchBaseQueryError).data;
      if (typeof dataField === 'string') return dataField;
      if (
        dataField &&
        typeof (dataField as { message?: string }).message === 'string'
      ) {
        return (dataField as { message?: string }).message as string;
      }
      return 'Unknown error';
    }
    if (isSerializedError(error)) {
      return error.message ?? 'Unknown error';
    }
    return 'Unknown error';
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

  if (isLoading) {
    return <Loader />;
  }

  if (queryError) {
    return (
      <div className="error-message">
        <p>Error: {getErrorMessage(queryError)}</p>
      </div>
    );
  }

  if (characters.length === 0 && !isLoading && !queryError) {
    return (
      <div className="no-results">
        <p>No characters found.</p>
      </div>
    );
  }

  return (
    <div className="results">
      {isLoading && <Loader />}
      {isFetching && <Loader />}
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
