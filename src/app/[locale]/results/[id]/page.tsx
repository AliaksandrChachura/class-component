import CharacterDetails from '../../../../components/CharacterDetails';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;

  return {
    title:
      locale === 'en'
        ? `Character ${id} - Rick & Morty`
        : `Персонаж ${id} - Рик и Морти`,
    description:
      locale === 'en'
        ? `View details for character ${id}`
        : `Просмотр деталей персонажа ${id}`,
    alternates: {
      canonical: `/${locale}/results/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CharacterDetailsPageRoute() {
  return <CharacterDetails />;
}
