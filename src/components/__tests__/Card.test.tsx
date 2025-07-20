import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  const mockProps = {
    name: 'Test Character',
    description: 'Test description for character',
  };

  it('renders card with name and description', () => {
    render(<Card {...mockProps} />);

    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(
      screen.getByText('Test description for character')
    ).toBeInTheDocument();
  });

  it('renders with correct HTML structure', () => {
    render(<Card {...mockProps} />);

    const cardElement = screen.getByText('Test Character').closest('.card');
    expect(cardElement).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Character');
  });

  it('handles empty strings gracefully', () => {
    render(<Card name="" description="" />);

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

    render(<Card {...specialProps} />);

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

    render(<Card {...longProps} />);

    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
  });
});
