'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearch } from '../hooks/useSearch';

const Search: React.FC = () => {
  const { state, setSearchTerm } = useSearch();
  const [inputValue, setInputValue] = useState(state.searchTerm);
  const t = useTranslations('search');

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
        placeholder={t('placeholder')}
      />
      <button onClick={handleSearch}>{t('searchButton')}</button>
    </div>
  );
};

export default Search;
