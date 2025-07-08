import { Component } from 'react';
import Search from './Search';

export default class Header extends Component {
  throwError = () => {
    throw new Error("Test error triggered!");
  };

  render() {
    return (
      <header>
        <Search />
        <button onClick={this.throwError}>Throw Error</button>
      </header>
    );
  }
}