import { MemoryRouter } from 'react-router-dom';
import { SearchProvider } from '../../context/SearchProvider';
import { render } from '@testing-library/react';

export const renderWithRouterAndContext = (
  ui: React.ReactElement,
  initialEntries = ['/']
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <SearchProvider>{ui}</SearchProvider>
    </MemoryRouter>
  );
