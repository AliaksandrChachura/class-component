'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    router.push(
      qs ? `/results/${characterId}?${qs}` : `/results/${characterId}`
    );
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
