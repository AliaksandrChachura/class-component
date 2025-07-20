import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from '../Loader';

describe('Loader Component', () => {
  it('renders with default props', () => {
    render(<Loader />);

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-label', 'Loading...');

    expect(screen.getAllByText('Loading...')).toHaveLength(2); // Visible and sr-only versions
  });

  it('renders with custom text', () => {
    const customText = 'Loading characters...';
    render(<Loader text={customText} />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-label', customText);

    expect(screen.getAllByText(customText)).toHaveLength(2); // Visible and sr-only versions
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Loader size="small" />);
    let container = screen.getByRole('status');
    expect(container).toHaveClass('small');

    rerender(<Loader size="medium" />);
    container = screen.getByRole('status');
    expect(container).toHaveClass('medium');

    rerender(<Loader size="large" />);
    container = screen.getByRole('status');
    expect(container).toHaveClass('large');
  });

  it('applies color classes correctly', () => {
    const { rerender } = render(<Loader color="primary" />);
    let container = screen.getByRole('status');
    expect(container).toHaveClass('primary');

    rerender(<Loader color="secondary" />);
    container = screen.getByRole('status');
    expect(container).toHaveClass('secondary');

    rerender(<Loader color="white" />);
    container = screen.getByRole('status');
    expect(container).toHaveClass('white');
  });

  it('applies fullscreen class when fullscreen is true', () => {
    render(<Loader fullscreen={true} />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass('fullscreen');
  });

  it('does not apply fullscreen class when fullscreen is false', () => {
    render(<Loader fullscreen={false} />);

    const container = screen.getByRole('status');
    expect(container).not.toHaveClass('fullscreen');
  });

  describe('spinner variants', () => {
    it('renders spinner variant (default)', () => {
      render(<Loader variant="spinner" />);

      const spinner = document.querySelector('.loader-spinner');
      expect(spinner).toBeInTheDocument();

      const svg = spinner?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders dots variant', () => {
      render(<Loader variant="dots" />);

      const dots = document.querySelector('.loader-dots');
      expect(dots).toBeInTheDocument();

      const dotElements = document.querySelectorAll('.dot');
      expect(dotElements).toHaveLength(3);
    });

    it('renders pulse variant', () => {
      render(<Loader variant="pulse" />);

      const pulse = document.querySelector('.loader-pulse');
      expect(pulse).toBeInTheDocument();

      const rings = document.querySelectorAll('.pulse-ring');
      expect(rings).toHaveLength(3);
    });

    it('renders bars variant', () => {
      render(<Loader variant="bars" />);

      const bars = document.querySelector('.loader-bars');
      expect(bars).toBeInTheDocument();

      const barElements = document.querySelectorAll('.bar');
      expect(barElements).toHaveLength(5);
    });
  });

  it('has accessibility attributes', () => {
    const text = 'Loading data...';
    render(<Loader text={text} />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-label', text);

    const liveRegion = document.querySelector('.loader-text');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    const srOnly = document.querySelector('.sr-only');
    expect(srOnly).toBeInTheDocument();
    expect(srOnly).toHaveTextContent(text);
  });

  it('renders text when provided', () => {
    render(<Loader text="Custom loading text" />);

    const textElement = document.querySelector('.loader-text');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveTextContent('Custom loading text');
  });

  it('does not render text element when text is empty', () => {
    render(<Loader text="" />);

    const textElement = document.querySelector('.loader-text');
    expect(textElement).not.toBeInTheDocument();
  });

  it('combines all classes correctly', () => {
    render(
      <Loader
        size="large"
        color="secondary"
        fullscreen={true}
        text="Loading..."
      />
    );

    const container = screen.getByRole('status');
    expect(container).toHaveClass(
      'loader-container',
      'large',
      'secondary',
      'fullscreen'
    );
  });

  it('handles undefined props gracefully', () => {
    expect(() => {
      render(<Loader size={undefined} color={undefined} />);
    }).not.toThrow();
  });
});
