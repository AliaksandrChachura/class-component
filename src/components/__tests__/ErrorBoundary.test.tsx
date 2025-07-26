import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from 'react';
import ErrorBoundary from '../ErrorBoundary';

class ThrowError extends Component<{ shouldThrow?: boolean }> {
  render() {
    if (this.props.shouldThrow) {
      throw new Error('Test error message');
    }
    return <div>No error</div>;
  }
}

const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

const mockOpen = vi.fn();
window.open = mockOpen;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onError prop when error occurs', () => {
    const mockOnError = vi.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(
      screen.queryByText('Oops! Something went wrong')
    ).not.toBeInTheDocument();
  });

  it('shows retry button and handles retry', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);

    expect(screen.getByText(/retry attempt/i)).toBeInTheDocument();
  });

  it('shows reload button and handles reload', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', {
      name: /reload the page/i,
    });
    expect(reloadButton).toBeInTheDocument();

    fireEvent.click(reloadButton);
    expect(mockReload).toHaveBeenCalled();
  });

  it('shows report issue button and handles report', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reportButton = screen.getByRole('button', {
      name: /report this issue/i,
    });
    expect(reportButton).toBeInTheDocument();

    fireEvent.click(reportButton);
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:support@example.com')
    );
  });

  it('has retry functionality', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
  });

  it('logs error details to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('shows retry count when retries have been attempted', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/retry attempt/i)).not.toBeInTheDocument();
  });

  it('renders error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
