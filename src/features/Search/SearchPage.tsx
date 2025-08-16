'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '../../components/CreateNavigation';
import Header from '../../components/Header';
import SearchStatus from '../../components/SearchStatus';
import Results from '../../components/Results';
import SearchParamsWrapper from '../../components/SearchParamsWrapper';
import type { RickMortyResponse } from '../../types/api';

interface SearchPageProps {
  initialData?: RickMortyResponse;
}

const SearchPage: React.FC<SearchPageProps> = ({ initialData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isDetailsOpen = /\/results\/\d+/i.test(pathname);
  const t = useTranslations('search');

  const handleCharacterSelect = (characterId: number) => {
    router.push({
      pathname: '/results/[id]',
      params: { id: characterId.toString() },
    });
  };

  return (
    <div className="search-page">
      <SearchParamsWrapper>
        <Header />
        <h1>{t('title')}</h1>
      </SearchParamsWrapper>
      <div className={`search-layout ${isDetailsOpen ? 'split-view' : ''}`}>
        <div className="search-content">
          <SearchParamsWrapper>
            <SearchStatus />
          </SearchParamsWrapper>
          <SearchParamsWrapper>
            <Results
              onCharacterSelect={handleCharacterSelect}
              initialData={initialData}
            />
          </SearchParamsWrapper>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
