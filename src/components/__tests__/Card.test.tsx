import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from './testUtils';
import Card from '../Card';
import { SearchProvider } from '../../context/SearchProvider';

describe('Card Component', () => {
  const mockProps = {
    name: 'Test Character',
    description: 'Test description for character',
  };

  it('renders card with name and description', () => {
    render(<Card {...mockProps} />, { wrapper: SearchProvider });

    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(
      screen.getByText('Test description for character')
    ).toBeInTheDocument();
  });

  it('renders with correct HTML structure', () => {
    render(<Card {...mockProps} />, { wrapper: SearchProvider });

    const cardElement = screen.getByText('Test Character').closest('.card');
    expect(cardElement).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Character');
  });

  it('handles empty strings gracefully', () => {
    render(<Card name="" description="" />, { wrapper: SearchProvider });

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('');

    const paragraph = screen.getByText('', { selector: 'p' });
    expect(paragraph).toBeInTheDocument();
  });

  it('renders special characters correctly', () => {
    const specialProps = {
      name: 'Rick & Morty™',
      description: 'Contains special chars: <>&"\'',
    };

    render(<Card {...specialProps} />, { wrapper: SearchProvider });

    expect(screen.getByText('Rick & Morty™')).toBeInTheDocument();
    expect(
      screen.getByText('Contains special chars: <>&"\'')
    ).toBeInTheDocument();
  });

  it('renders long text content', () => {
    const longProps = {
      name: 'A'.repeat(100),
      description: 'B'.repeat(500),
    };

    render(<Card {...longProps} />, { wrapper: SearchProvider });

    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const mockOnClick = vi.fn();
    render(<Card {...mockProps} onClick={mockOnClick} />, {
      wrapper: SearchProvider,
    });

    const cardElement = screen.getByText('Test Character').closest('.card');
    if (cardElement) {
      fireEvent.click(cardElement);
    }

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const mockOnClick = vi.fn();
    render(<Card {...mockProps} onClick={mockOnClick} />, {
      wrapper: SearchProvider,
    });

    const cardElement = screen.getByText('Test Character').closest('.card');
    if (cardElement) {
      fireEvent.keyDown(cardElement, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(cardElement, { key: ' ' });
    }
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders with image when provided', () => {
    const propsWithImage = {
      ...mockProps,
      image: 'https://example.com/image.jpg',
    };

    render(<Card {...propsWithImage} />, { wrapper: SearchProvider });

    const image = screen.getByAltText('Test Character');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('does not call onClick when none is provided', () => {
    render(<Card {...mockProps} />, { wrapper: SearchProvider });

    const cardElement = screen.getByText('Test Character').closest('.card');
    expect(() => {
      if (cardElement) {
        fireEvent.click(cardElement);
      }
    }).not.toThrow();
  });
});
