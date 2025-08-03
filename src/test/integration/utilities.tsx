import { MemoryRouter } from 'react-router-dom';
import { SearchProvider } from '../../context/SearchProvider';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';

export const renderWithRouterAndContext = (
  ui: React.ReactElement,
  initialEntries = ['/']
) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <SearchProvider>{ui}</SearchProvider>
      </MemoryRouter>
    </Provider>
  );
