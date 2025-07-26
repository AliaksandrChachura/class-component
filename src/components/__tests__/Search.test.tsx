import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '../Search';
import { SearchProvider } from '../../context/SearchProvider';

const renderWithProvider = (
  component: React.ReactElement,
  initialStorage?: Record<string, string>
) => {
  if (initialStorage) {
    Object.entries(initialStorage).forEach(([key, value]) => {
      vi.spyOn(localStorage, 'getItem').mockImplementation((storageKey) => {
        return storageKey === key ? value : null;
      });
    });
  }
  return render(<SearchProvider>{component}</SearchProvider>);
};

describe('Search Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders search input and button', () => {
    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('starts with empty term when no localStorage value', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    expect(input).toHaveValue('');
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);

    await user.type(input, 'Rick');

    expect(input).toHaveValue('Rick');
  });

  it('calls onSearch with trimmed value when search button clicked', () => {
    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '  Rick  ' } });
    fireEvent.click(button);

    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', '"Rick"');
  });

  it('saves search term to localStorage when searching', () => {
    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'Morty' } });
    fireEvent.click(button);

    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', '"Morty"');
  });

  it('works without onSearch prop', () => {
    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    expect(() => {
      fireEvent.change(input, { target: { value: 'Rick' } });
      fireEvent.click(button);
    }).not.toThrow();
  });

  it('handles empty search term correctly', () => {
    renderWithProvider(<Search />);

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', '""');
  });

  it('trims whitespace from search term', () => {
    renderWithProvider(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);

    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', '""');
  });

  it('has correct container class', () => {
    renderWithProvider(<Search />);

    const container = screen
      .getByPlaceholderText(/search characters/i)
      .closest('.search');
    expect(container).toBeInTheDocument();
  });
});
