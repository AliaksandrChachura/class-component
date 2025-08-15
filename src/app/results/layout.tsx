'use client';

import React, { Suspense } from 'react';

import Header from '../../components/Header';
import SearchContent from '../../components/SearchContent';

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasDetails = React.Children.count(children) > 0;

  return (
    <div className="search-page">
      <Header />
      <h1>Rick and Morty Characters</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <SearchContent hasDetails={hasDetails} />
      </Suspense>

      {hasDetails && <div className="details-content">{children}</div>}
    </div>
  );
}
