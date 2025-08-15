import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '../../i18n';
import '../../styles/index.scss';
import Providers from '../providers';
import LocaleProvider from '../../components/LocaleProvider';
import { metadata } from '../metadata';

export { metadata };

export function generateStaticParams() {
  return ['en', 'ru'].map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Get messages manually to ensure proper locale handling
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
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LocaleProvider>
        <Providers>{children}</Providers>
      </LocaleProvider>
    </NextIntlClientProvider>
  );
}
