import React, { useState, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';

const Search: React.FC = () => {
  const { state, setSearchTerm } = useSearch();
  const [inputValue, setInputValue] = useState(state.searchTerm);

  useEffect(() => {
    setInputValue(state.searchTerm);
  }, [state.searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    const trimmedValue = inputValue.trim();
    setSearchTerm(trimmedValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search">
      <input
        value={inputValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Search characters (e.g. Rick, Morty)..."
      />
      <button onClick={handleSearch}>Search</button>
      {state.isLoading && <span className="search-loading">Searching...</span>}
    </div>
  );
};

export default Search;
