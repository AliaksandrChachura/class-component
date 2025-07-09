import { Component } from 'react';
import Header from './components/Header';
import Results from './components/Results';
import ErrorBoundary from './components/ErrorBoundary';
import React from 'react';

interface State {
  searchTerm: string;
}

export default class App extends Component<{}, State> {
  private resultsRef = React.createRef<Results>();

  constructor(props: {}) {
    super(props);
    this.state = {
      searchTerm: localStorage.getItem('searchTerm') || ''
    };
  }

  handleSearch = (term: string) => {
    this.setState({ searchTerm: term });
    localStorage.setItem('searchTerm', term);
    if (this.resultsRef.current) {
      this.resultsRef.current.updateSearchTerm(term);
    }
  };

  render() {
    return (
      <ErrorBoundary>
        <Header onSearch={this.handleSearch} />
        <Results ref={this.resultsRef} />
      </ErrorBoundary>
    );
  }
}

