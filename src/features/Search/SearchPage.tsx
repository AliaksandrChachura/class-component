import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../../components/Header';
import SearchStatus from '../../components/SearchStatus';
import Results from '../../components/Results';
import SearchParamsWrapper from '../../components/SearchParamsWrapper';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isDetailsOpen = /\/results\/\d+/i.test(pathname);

  const handleCharacterSelect = (characterId: number) => {
    router.push(`/results/${characterId}`);
  };

  return (
    <div className="search-page">
      <Header />
      <h1>Rick and Morty Characters</h1>
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
