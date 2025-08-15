'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../../components/Header';
import SearchStatus from '../../components/SearchStatus';
import Results from '../../components/Results';
import SearchParamsWrapper from '../../components/SearchParamsWrapper';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const isDetailsOpen = /\/results\/\d+/i.test(pathname);
  const t = useTranslations('search');

  const handleCharacterSelect = (characterId: number) => {
    router.push(`/${locale}/results/${characterId}`);
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
            <Results onCharacterSelect={handleCharacterSelect} />
          </SearchParamsWrapper>
        </div>
        {/* Details content will be handled by Next.js routing */}
        {/* Remove Outlet since Next.js uses file-based routing */}
      </div>
    </div>
  );
};

export default SearchPage;
