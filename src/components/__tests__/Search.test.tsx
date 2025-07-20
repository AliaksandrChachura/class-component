import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '../Search';

describe('Search Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders search input and button', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('loads saved search term from localStorage on mount', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue('saved term');

    render(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    expect(input).toHaveValue('saved term');
    expect(localStorage.getItem).toHaveBeenCalledWith('searchTerm');
  });

  it('starts with empty term when no localStorage value', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

    render(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    expect(input).toHaveValue('');
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);

    await user.type(input, 'Rick');

    expect(input).toHaveValue('Rick');
  });

  it('calls onSearch with trimmed value when search button clicked', () => {
    const mockOnSearch = vi.fn();
    render(<Search onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '  Rick  ' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Rick');
    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', 'Rick');
  });

  it('saves search term to localStorage when searching', () => {
    const mockOnSearch = vi.fn();
    render(<Search onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'Morty' } });
    fireEvent.click(button);

    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', 'Morty');
  });

  it('works without onSearch prop', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    expect(() => {
      fireEvent.change(input, { target: { value: 'Rick' } });
      fireEvent.click(button);
    }).not.toThrow();
  });

  it('handles empty search term correctly', () => {
    const mockOnSearch = vi.fn();
    render(<Search onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('');
    expect(localStorage.setItem).toHaveBeenCalledWith('searchTerm', '');
  });

  it('trims whitespace from search term', () => {
    const mockOnSearch = vi.fn();
    render(<Search onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search characters/i);
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('has correct container class', () => {
    render(<Search />);

    const container = screen
      .getByPlaceholderText(/search characters/i)
      .closest('.search');
    expect(container).toBeInTheDocument();
  });
});
