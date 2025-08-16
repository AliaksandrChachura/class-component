'use client';

import React, { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '../i18n';
import { useState } from 'react';
import '../styles/LanguageSwitcher.scss';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLocaleChange, setPendingLocaleChange] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (pendingLocaleChange && pendingLocaleChange !== locale) {
      const currentPath = window.location.pathname;
      let pathWithoutLocale = '';

      if (currentPath.startsWith(`/${locale}/`)) {
        pathWithoutLocale = currentPath.substring(locale.length + 1);
      } else if (currentPath === `/${locale}`) {
        pathWithoutLocale = '';
      } else {
        pathWithoutLocale = currentPath;
      }

      const newPath = `/${pendingLocaleChange}${pathWithoutLocale}`;
      window.location.href = newPath;
      setPendingLocaleChange(null);
    }
  }, [pendingLocaleChange, locale]);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }

    try {
      setPendingLocaleChange(newLocale);
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
