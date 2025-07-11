import { Component } from 'react';
import Loader from './Loader';
import Card from './Card';
import { fetchCharacters } from '../api/rickMortyAPI';
import type { Character } from '../api/rickMortyAPI';

interface State {
  loading: boolean;
  error: string | null;
  results: Character[];
  searchTerm: string;
}

export default class Results extends Component<Record<string, unknown>, State> {
  constructor(props: Record<string, unknown>) {
    super(props);
    const savedTerm = localStorage.getItem('searchTerm') || '';
    this.state = {
      loading: false,
      error: null,
      results: [],
      searchTerm: savedTerm,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  updateSearchTerm = (newTerm: string) => {
    this.setState({ searchTerm: newTerm }, () => {
      this.fetchData();
    });
  };

  fetchData = () => {
    this.setState({ loading: true, error: null });
    const { searchTerm } = this.state;

    fetchCharacters(searchTerm, 1)
      .then((data) => {
        this.setState({ results: data.results, loading: false });
      })
      .catch(() => {
        // Silent error handling - no console messages
        this.setState({ error: 'Unable to load characters', loading: false });
      });
  };

  render() {
    const { loading, error, results } = this.state;

    if (loading)
      return (
        <Loader
          variant="spinner"
          size="large"
          text="Loading Rick and Morty characters..."
        />
      );
    if (error) return <div className="error">Error: {error}</div>;

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
  }
}
