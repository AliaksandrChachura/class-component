'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Search from './Search';
import { useSearchContext } from '../context/SearchContext';
import { baseApi } from '../api/baseApi';
import { useDispatch } from 'react-redux';
import CacheManager from './CacheManager';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const locale = useLocale();
  const { state, setTheme } = useSearchContext();
  const t = useTranslations('navigation');

  const throwError = () => {
    throw new Error('Test error triggered!');
  };

  const handleAboutClick = () => {
    router.push(`/${locale}/about`);
  };
  const handleThemeClick = () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  };

  const handleRefreshClick = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([{ type: 'Characters', id: 'LIST' }]));
  }, [dispatch]);

  return (
    <header className={'header'}>
      <Search />
      <div className="actions-section">
        <CacheManager />
        <button className={'theme-button'} onClick={handleThemeClick}>
          {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="refresh-button" onClick={handleRefreshClick}>
          Refresh
        </button>
        <button className="about-button" onClick={handleAboutClick}>
          {t('about')}
        </button>
        <button className="error-button" onClick={throwError}>
          Throw Error
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
