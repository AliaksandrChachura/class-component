import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '../../i18n';
import '../../styles/index.scss';
import Providers from '../providers';
import LocaleProvider from '../../components/LocaleProvider';
import type { Metadata } from 'next';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    title: locale === 'en' ? 'Rick & Morty' : 'Рик и Морти',
    description: locale === 'en' ? 'Search characters' : 'Поиск персонажей',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ru: '/ru',
      },
    },
    openGraph: {
      title: locale === 'en' ? 'Rick & Morty' : 'Рик и Морти',
      description: locale === 'en' ? 'Search characters' : 'Поиск персонажей',
      locale: locale,
      alternateLocale: locale === 'en' ? 'ru' : 'en',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  let messages;
  try {
    if (locale === 'en') {
      messages = (await import('../../messages/en.json')).default;
    } else if (locale === 'ru') {
      messages = (await import('../../messages/ru.json')).default;
    } else {
      notFound();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LocaleProvider>
            <Providers>{children}</Providers>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
