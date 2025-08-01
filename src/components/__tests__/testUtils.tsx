import { render } from '@testing-library/react';
import { SearchProvider } from '../../context/SearchProvider';
import type { ReactNode } from 'react';
import type { RenderOptions } from '@testing-library/react';

const customRender = (ui: ReactNode, options: RenderOptions) =>
  render(<SearchProvider>{ui}</SearchProvider>, options);

export { screen, fireEvent } from '@testing-library/react';
export { customRender as render };
