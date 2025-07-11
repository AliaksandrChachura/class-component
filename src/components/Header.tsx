import { Component } from 'react';
import Search from './Search';

interface Props {
  onSearch?: (term: string) => void;
}

export default class Header extends Component<Props> {
  throwError = () => {
    throw new Error('Test error triggered!');
  };

  render() {
    return (
      <header className="header">
        <Search onSearch={this.props.onSearch} />
        <button className="error-button" onClick={this.throwError}>
          Throw Error
        </button>
      </header>
    );
  }
}
