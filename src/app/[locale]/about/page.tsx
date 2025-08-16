import AboutPage from '../../../features/About/AboutPage';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'en' ? 'About - Rick & Morty' : 'О нас - Рик и Морти',
    description:
      locale === 'en'
        ? 'Learn more about the Rick & Morty character search application'
        : 'Узнайте больше о приложении для поиска персонажей Рик и Морти',
    alternates: {
      canonical: `/${locale}/about`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AboutPageRoute() {
  return <AboutPage />;
}
