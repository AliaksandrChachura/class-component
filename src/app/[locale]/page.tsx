import { Suspense } from 'react';
import SearchPage from '../../features/Search/SearchPage';
import Loader from '../../components/Loader';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'en' ? 'Home - Rick & Morty' : 'Главная - Рик и Морти',
    description:
      locale === 'en'
        ? 'Search for your favorite Rick & Morty characters'
        : 'Ищите своих любимых персонажей из Рик и Морти',
    alternates: {
      canonical: `/${locale}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchPage />
    </Suspense>
  );
}
