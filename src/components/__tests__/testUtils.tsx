import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { SearchProvider } from '../../context/SearchProvider';
import type { ReactNode } from 'react';
import type { RenderOptions } from '@testing-library/react';

const customRender = (ui: ReactNode, options: RenderOptions) =>
  render(
    <Provider store={store}>
      <SearchProvider>{ui}</SearchProvider>
    </Provider>,
    options
  );

export { screen, fireEvent } from '@testing-library/react';
export { customRender as render };
