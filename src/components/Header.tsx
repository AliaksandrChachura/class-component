import React from 'react';
import { useNavigate } from 'react-router-dom';
import Search from './Search';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const throwError = () => {
    throw new Error('Test error triggered!');
  };

  const handleAboutClick = () => {
    navigate('/about');
  };

  return (
    <header className="header">
      <Search />
      <div className="actions-section">
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
