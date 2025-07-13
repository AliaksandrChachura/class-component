import { Component, type ErrorInfo } from 'react';
import Header from './components/Header';
import Results from './components/Results';
import ErrorBoundary from './components/ErrorBoundary';
import React from 'react';

interface State {
  searchTerm: string;
}

export default class App extends Component<Record<string, unknown>, State> {
  private resultsRef = React.createRef<Results>();

  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      searchTerm: localStorage.getItem('searchTerm') || '',
    };
  }

  handleSearch = (term: string) => {
    this.setState({ searchTerm: term });
    localStorage.setItem('searchTerm', term);
    if (this.resultsRef.current) {
      this.resultsRef.current.updateSearchTerm(term);
    }
  };

  handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  };

  render() {
    return (
      <ErrorBoundary onError={this.handleError} fallback={<div>Error</div>}>
        <Header onSearch={this.handleSearch} />
        <Results ref={this.resultsRef} />
      </ErrorBoundary>
    );
  }
}
