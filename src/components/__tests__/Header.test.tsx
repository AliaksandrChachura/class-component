import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
  it('renders header with search component', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('header');

    // Check if Search component is rendered
    expect(
      screen.getByPlaceholderText(/search characters/i)
    ).toBeInTheDocument();
  });

  it('renders error button', () => {
    render(<Header />);

    const errorButton = screen.getByRole('button', { name: /throw error/i });
    expect(errorButton).toBeInTheDocument();
    expect(errorButton).toHaveClass('error-button');
  });

  it('error button exists and is functional', () => {
    render(<Header />);

    const errorButton = screen.getByRole('button', { name: /throw error/i });
    // Verify button exists and has correct attributes
    expect(errorButton).toBeInTheDocument();
    expect(errorButton).toHaveClass('error-button');
    expect(errorButton).toHaveTextContent('Throw Error');
    expect(errorButton).not.toBeDisabled();
  });

  it('passes onSearch prop to Search component', () => {
    const mockOnSearch = vi.fn();
    render(<Header onSearch={mockOnSearch} />);

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Rick' } });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith('Rick');
  });

  it('works without onSearch prop', () => {
    expect(() => {
      render(<Header />);
    }).not.toThrow();

    const searchInput = screen.getByPlaceholderText(/search characters/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    expect(() => {
      fireEvent.change(searchInput, { target: { value: 'Rick' } });
      fireEvent.click(searchButton);
    }).not.toThrow();
  });
});
