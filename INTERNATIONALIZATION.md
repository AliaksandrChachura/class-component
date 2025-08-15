# Internationalization Implementation

This document describes how internationalization (i18n) has been implemented in the application using `next-intl` for Next.js App Router.

## Overview

The application now supports multiple languages with a client-side language switcher. Users can switch between English and Russian languages, and the URL structure automatically includes the locale prefix.

## Supported Languages

- **English (en)** - Default language
- **Russian (ru)** - Secondary language

## Implementation Details

### 1. Dependencies

- `next-intl` - Core internationalization library for Next.js

### 2. Configuration Files

#### `next.config.mjs`

- Updated to include the `next-intl` plugin
- Enables internationalization support

#### `src/i18n/request.ts`

- Defines supported locales (`en`, `ru`)
- Sets default locale (`en`)
- Configures message loading for each locale

#### `src/middleware.ts`

- Handles locale routing
- Redirects requests to appropriate locale paths
- Matches internationalized routes

### 3. File Structure

```
src/
├── app/
│   ├── [locale]/           # Locale-specific routes
│   │   ├── layout.tsx      # Locale-specific layout
│   │   ├── page.tsx        # Home page
│   │   ├── about/
│   │   │   └── page.tsx    # About page
│   │   └── results/
│   │       ├── page.tsx    # Results page
│   │       └── [id]/
│   │           └── page.tsx # Character details page
│   └── page.tsx            # Root page (redirects to default locale)
├── i18n/
│   ├── index.ts            # Exports types and constants
│   └── request.ts          # i18n configuration
├── messages/
│   ├── en.json             # English translations
│   └── ru.json             # Russian translations
└── components/
    └── LanguageSwitcher.tsx # Language switcher component
```

### 4. URL Structure

- **English**: `/en`, `/en/about`, `/en/results/123`
- **Russian**: `/ru`, `/ru/about`, `/ru/results/123`
- **Root**: `/` (redirects to `/en`)

### 5. Components Updated

#### Header Component

- Added language switcher
- Updated navigation to use locale-aware paths
- Internationalized button text

#### Search Component

- Internationalized placeholder text
- Internationalized button text

#### SearchPage Component

- Internationalized page title
- Updated navigation to use locale-aware paths

#### AboutPage Component

- Internationalized content
- Updated navigation to use locale-aware paths

### 6. Language Switcher

The `LanguageSwitcher` component provides:

- Dropdown menu with language options
- Visual indication of current language
- Smooth navigation between locales
- Maintains current page when switching languages

### 7. Translation Files

#### `src/messages/en.json`

- Contains all English text strings
- Organized by component/feature

#### `src/messages/ru.json`

- Contains all Russian text strings
- Maintains same structure as English file

## Usage

### Adding New Translations

1. Add new keys to both `en.json` and `ru.json` files
2. Use the `useTranslations` hook in components:

```tsx
import { useTranslations } from 'next-intl';

const MyComponent = () => {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
};
```

### Adding New Locales

1. Add the new locale to the `locales` array in `src/i18n/request.ts`
2. Create a new translation file in `src/messages/`
3. Update the language switcher component

### Navigation with Locales

Always use locale-aware navigation:

```tsx
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const MyComponent = () => {
  const locale = useLocale();
  const router = useRouter();

  const handleNavigation = () => {
    router.push(`/${locale}/about`);
  };
};
```

## Benefits

1. **User Experience**: Users can use the application in their preferred language
2. **SEO**: Locale-specific URLs improve search engine optimization
3. **Accessibility**: Better accessibility for non-English speakers
4. **Scalability**: Easy to add more languages in the future
5. **Maintainability**: Centralized translation management

## Testing

The implementation includes tests for the language switcher component to ensure proper functionality.

## Future Enhancements

- Add more languages
- Implement locale detection based on user's browser language
- Add RTL (right-to-left) language support
- Implement translation memory/caching
- Add locale-specific formatting for dates, numbers, and currencies
