import { Suspense } from 'react';
import { getCharacters } from '../../../lib/server/apiClient';
import Loader from '../../../components/Loader';
import SearchPage from '../../../features/Search/SearchPage';
import type { Metadata } from 'next';

interface ResultsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === 'en'
        ? 'Search Results - Rick & Morty'
        : 'Результаты поиска - Рик и Морти',
    description:
      locale === 'en'
        ? 'View search results for characters'
        : 'Просмотр результатов поиска персонажей',
    alternates: {
      canonical: `/${locale}/results`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ResultsPageRoute({
  searchParams,
}: ResultsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const name = params.q || '';

  try {
    const charactersData = await getCharacters({
      page,
      name,
    });

    return (
      <Suspense fallback={<Loader />}>
        <SearchPage initialData={charactersData} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching characters:', error);
    return (
      <Suspense fallback={<Loader />}>
        <SearchPage />
      </Suspense>
    );
  }
}
