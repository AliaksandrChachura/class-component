'use client';

import React from 'react';
import { useRouter } from './CreateNavigation';
import { useSearchParams } from 'next/navigation';
import SearchStatus from './SearchStatus';
import Results from './Results';

interface SearchContentProps {
  hasDetails: boolean;
}

export default function SearchContent({ hasDetails }: SearchContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCharacterSelect = (characterId: number) => {
    const qs = searchParams.toString();
    if (qs) {
      const queryObj: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        queryObj[key] = value;
      });

      router.push({
        pathname: '/results/[id]',
        params: { id: characterId.toString() },
        query: queryObj,
      });
    } else {
      router.push({
        pathname: '/results/[id]',
        params: { id: characterId.toString() },
      });
    }
  };

  return (
    <div className={`search-layout ${hasDetails ? 'split-view' : ''}`}>
      <div className="search-content">
        <SearchStatus />
        <Results onCharacterSelect={handleCharacterSelect} />
      </div>
    </div>
  );
}
