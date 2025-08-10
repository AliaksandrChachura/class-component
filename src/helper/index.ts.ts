import type { Card } from '../types';
// import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
// import { useSearch } from '../hooks/useSearch';

function isCardInSelectedCards(cards: Card[], card: Card) {
  return cards.some((c) => c.id === card.id);
}

function downloadCsv(cards: Card[]) {
  const csvContent = cards
    .map((card) => `${card.name},${card.description},${card.image}`)
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cards.length}_items.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// function getSearchParams() {
//   const { state } = useSearch();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const params = new URLSearchParams(searchParams);
//   const currentPage = parseInt(searchParams.get('page') || '1', 10);

//   const isCharacterDetailsRoute = /\/results\/\d+/.test(
//     window.location.pathname
//   );

//   if (state.searchTerm) {
//     params.set('q', state.searchTerm);
//   } else {
//     params.delete('q');
//   }

//   if (currentPage > 1) {
//     params.set('page', currentPage.toString());
//   } else {
//     params.delete('page');
//   }

//   const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
//   if (pageSize) {
//     params.set('pageSize', pageSize.toString());
//   } else {
//     params.delete('pageSize');
//   }

//   setSearchParams(params);

//   navigate(`/results?${params.toString()}`, { replace: false });

//   return { params, setSearchParams };
// }

export { isCardInSelectedCards, downloadCsv };
