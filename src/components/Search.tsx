import React, { Component } from 'react';

interface Props {
  onSearch?: (term: string) => void;
}

interface State {
  term: string;
}

export default class Search extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const savedTerm = localStorage.getItem('searchTerm') || '';
    this.state = { term: savedTerm };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ term: e.target.value });
  };

  handleSearch = () => {
    const trimmed = this.state.term.trim();
    console.log(trimmed);
    localStorage.setItem('searchTerm', trimmed);
    this.props.onSearch?.(trimmed);
  };

  render() {
    return (
      <div className="search">
        <input
          value={this.state.term}
          onChange={this.handleChange}
          placeholder="Search characters (e.g. Rick, Morty)..."
        />
        <button onClick={this.handleSearch}>Search</button>
      </div>
    );
  }
}
