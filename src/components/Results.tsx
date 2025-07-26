import React, { useEffect, useState, useCallback } from 'react';
import { useSearch } from '../hooks/useSearch';
import Loader from './Loader';
import Card from './Card';
import { fetchCharacters } from '../api/rickMortyAPI';
import type { Character } from '../api/rickMortyAPI';

const Results: React.FC = () => {
  const { state, setLoading, setError } = useSearch();
  const [results, setResults] = useState<Character[]>([]);

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
    return <Loader size="large" text="Loading Rick and Morty characters..." />;
  }

  if (state.error) {
    return <div className="error">Error: {state.error}</div>;
  }

  return (
    <div className="results">
      <h2>Rick and Morty Characters</h2>
      {results.length === 0 ? (
        <p>No characters found.</p>
      ) : (
        results.map((character) => (
          <Card
            key={character.id}
            name={character.name}
            description={`${character.species} from ${character.origin.name}. Status: ${character.status}. Currently at: ${character.location.name}`}
          />
        ))
      )}
    </div>
  );
};

export default Results;
