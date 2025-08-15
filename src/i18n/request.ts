import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  console.log('Request config called with locale:', locale);

  // If no locale is provided, default to 'en'
  const resolvedLocale = locale || 'en';

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(resolvedLocale as Locale)) {
    console.log('Invalid locale:', resolvedLocale, 'Valid locales:', locales);
    notFound();
  }

  try {
    let messages;
    if (resolvedLocale === 'en') {
      messages = (await import('../messages/en.json')).default;
    } else if (resolvedLocale === 'ru') {
      messages = (await import('../messages/ru.json')).default;
    } else {
      console.error('Unknown locale:', resolvedLocale);
      notFound();
    }

    console.log('Successfully loaded messages for locale:', resolvedLocale);
    return {
      locale: resolvedLocale,
      messages,
    };
  } catch (error) {
    console.error('Error loading messages for locale:', resolvedLocale, error);
    notFound();
  }
});
