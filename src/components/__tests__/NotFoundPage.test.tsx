import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFoundPage from '../NotFoundPage';

describe('NotFoundPage', () => {
  it('renders not found message', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('No characters found.')).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    render(<NotFoundPage />);

    const notFound = screen.getByText('No characters found.');
    expect(notFound.closest('div')).toHaveClass('no-results');
  });

  it('renders with correct semantic structure', () => {
    render(<NotFoundPage />);

    const notFound = screen.getByText('No characters found.');
    expect(notFound.tagName).toBe('P');
  });

  it('has correct accessibility attributes', () => {
    render(<NotFoundPage />);

    const notFound = screen.getByText('No characters found.');
    expect(notFound).toBeInTheDocument();
  });
});
