import { Component } from 'react';
import Header from './components/Header';
// import Results from './components/Results';
import ErrorBoundary from './components/ErrorBoundary';

export default class App extends Component {
  render() {
    return (
      <ErrorBoundary>
        <Header />
        {/* <Results /> */}
      </ErrorBoundary>
    );
  }
}

