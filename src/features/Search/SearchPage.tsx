import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import SearchStatus from '../../components/SearchStatus';
import Results from '../../components/Results';
import './SearchPage.scss';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailsOpen = /\/results\/\d+/i.test(location.pathname);

  const handleCharacterSelect = (characterId: number) => {
    navigate(`/results/${characterId}`);
  };

  return (
    <div className="search-page">
      <Header />
      <div className={`search-layout ${isDetailsOpen ? 'split-view' : ''}`}>
        <div className="search-content">
          <SearchStatus />
          <Results onCharacterSelect={handleCharacterSelect} />
        </div>
        {isDetailsOpen && (
          <div className="details-content">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
