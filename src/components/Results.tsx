import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import Loader from './Loader';
import Card from './Card';
import { fetchCharacters } from '../api/rickMortyAPI';
import type { Character } from '../api/rickMortyAPI';

interface ResultsProps {
  onCharacterSelect: (characterId: number) => void;
}

const Results: React.FC<ResultsProps> = ({ onCharacterSelect }) => {
  const { state, setLoading, setError } = useSearch();
  const [results, setResults] = useState<Character[]>([]);

  const navigate = useNavigate();

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

  const handleCharacterClick = (character: Character) => {
    onCharacterSelect(character.id);
    navigate(`/Results/${character.id}`);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = !state.searchTerm.trim()
        ? await fetchCharacters('', 1)
        : await fetchCharacters(state.searchTerm, 1);
      setResults(data.results);
    } catch {
      setError('Unable to load characters');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [state.searchTerm, setLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (state.isLoading) {
    return <Loader />;
  }

  if (state.error) {
    return <div className="error">Error: {state.error}</div>;
  }

  return (
    <div className="results">
      <h2>Rick and Morty Characters</h2>

      {results.length === 0 ? (
        <div className="no-results">
          <p>No characters found.</p>
          <p>
            Try searching for &ldquo;Rick&rdquo;, &ldquo;Morty&rdquo;, or
            another character name!
          </p>
        </div>
      ) : (
        <>
          <p className="results-count">
            Found {results.length} character{results.length === 1 ? '' : 's'}
          </p>
          <div className="results-container">
            {results.map((character) => (
              <Card
                key={character.id}
                name={character.name}
                description={getCharacterDescription(character)}
                image={character.image}
                onClick={() => handleCharacterClick(character)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
