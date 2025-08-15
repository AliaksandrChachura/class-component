'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '../i18n';
import { useState } from 'react';
import '../styles/LanguageSwitcher.scss';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    // Prevent double-click by checking if already changing
    if (newLocale === locale) {
      return;
    }
    console.log('newLocale', newLocale);

    try {
      // Extract the path without locale more safely
      let pathWithoutLocale = '';

      // Check if the current pathname starts with the current locale
      if (pathname.startsWith(`/${locale}/`)) {
        pathWithoutLocale = pathname.substring(locale.length + 1);
      } else if (pathname === `/${locale}`) {
        pathWithoutLocale = '';
      } else {
        // If no locale prefix found, use the entire pathname
        pathWithoutLocale = pathname;
      }

      // Build the new path
      const newPath = `/${newLocale}${pathWithoutLocale}`;

      // Navigate to the new locale
      router.push(newPath);
      setIsOpen(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguageName = () => {
    switch (locale) {
      case 'en':
        return 'English';
      case 'ru':
        return 'Русский';
      default:
        return 'English';
    }
  };

  // Debug logging
  console.log('LanguageSwitcher render:', {
    locale,
    pathname,
    isOpen,
    locales,
  });

  return (
    <div className="language-switcher">
      <button
        className="language-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language')}
      >
        <span className="language-switcher__current">
          {getCurrentLanguageName()}
        </span>
        <svg
          className={`language-switcher__arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          {locales.map((lang) => {
            const isActive = locale === lang;
            console.log('Button render:', { lang, locale, isActive });
            return (
              <button
                key={lang}
                className={`language-switcher__option ${isActive ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang)}
              >
                {lang === 'en' ? 'English' : 'Русский'}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
