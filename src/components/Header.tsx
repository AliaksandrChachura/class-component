import React from 'react';
import Search from './Search';

const Header: React.FC = () => {
  const throwError = () => {
    throw new Error('Test error triggered!');
  };

  return (
    <header className="header">
      <Search />
      <button className="error-button" onClick={throwError}>
        Throw Error
      </button>
    </header>
  );
};

export default Header;
