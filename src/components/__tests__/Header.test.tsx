import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { SearchProvider } from '../../context/SearchProvider';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<SearchProvider>{component}</SearchProvider>);
};

describe('Header Component', () => {
  it('renders header with search component', () => {
    renderWithProvider(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('header');

    expect(
      screen.getByPlaceholderText(/search characters/i)
    ).toBeInTheDocument();
  });

  it('renders error button', () => {
    renderWithProvider(<Header />);

    const errorButton = screen.getByRole('button', { name: /throw error/i });
    expect(errorButton).toBeInTheDocument();
    expect(errorButton).toHaveClass('error-button');
  });

  it('error button exists and is functional', () => {
    renderWithProvider(<Header />);

    const errorButton = screen.getByRole('button', { name: /throw error/i });
    expect(errorButton).toBeInTheDocument();
    expect(errorButton).toHaveClass('error-button');
    expect(errorButton).toHaveTextContent('Throw Error');
    expect(errorButton).not.toBeDisabled();
  });

  it('passes onSearch prop to Search component', () => {
    renderWithProvider(<Header />);

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Rick' } });
    fireEvent.click(searchButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', '"Rick"');
  });

  it('works without onSearch prop', () => {
    expect(() => {
      renderWithProvider(<Header />);
    }).not.toThrow();

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    expect(() => {
      fireEvent.change(searchInput, { target: { value: 'Rick' } });
      fireEvent.click(searchButton);
    }).not.toThrow();
  });
});
