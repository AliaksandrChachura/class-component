import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Search from './Search';
import { useSearchContext } from '../context/SearchContext';
import { baseApi } from '../api/baseApi';
import { useDispatch } from 'react-redux';
import CacheManager from './CacheManager';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state, setTheme } = useSearchContext();

  const throwError = () => {
    throw new Error('Test error triggered!');
  };

  const handleAboutClick = () => {
    navigate('/about');
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
          About
        </button>
        <button className="error-button" onClick={throwError}>
          Throw Error
        </button>
      </div>
    </header>
  );
};

export default Header;
