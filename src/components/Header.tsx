import React from 'react';
import Search from './Search';

const Header: React.FC = () => {
  const throwError = () => {
    throw new Error('Test error triggered!');
  };

  return (
    <header className="header">
      <Search />
      <div className="actions-section">
        <button className="about-button">About</button>
        <button className="error-button" onClick={throwError}>
          Throw Error
        </button>
      </div>
    </header>
  );
};

export default Header;
