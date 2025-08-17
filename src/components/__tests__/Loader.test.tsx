import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from '../Loader';

describe('Loader Component', () => {
  describe('Default Rendering', () => {
    it('renders with default props', () => {
      render(<Loader />);

      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveAttribute('aria-label', 'Loading...');

      const spinner = screen
        .getByRole('status')
        .querySelector('.loader-spinner');
      expect(spinner).toBeInTheDocument();

      // Use getAllByText since there are multiple elements with the same text
      const textElements = screen.getAllByText('Loading...');
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toBeInTheDocument();
      expect(visibleText).toHaveClass('loader-text');
    });

    it('applies default CSS classes', () => {
      render(<Loader />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'medium', 'primary');
      expect(container).not.toHaveClass('fullscreen');
    });
  });

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      render(<Loader size="small" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'small', 'primary');
      expect(container).not.toHaveClass('medium', 'large');
    });

    it('renders medium size correctly', () => {
      render(<Loader size="medium" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'medium', 'primary');
      expect(container).not.toHaveClass('small', 'large');
    });

    it('renders large size correctly', () => {
      render(<Loader size="large" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'large', 'primary');
      expect(container).not.toHaveClass('small', 'medium');
    });
  });

  describe('Color Variants', () => {
    it('renders primary color correctly', () => {
      render(<Loader color="primary" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'medium', 'primary');
      expect(container).not.toHaveClass('secondary', 'white');
    });

    it('renders secondary color correctly', () => {
      render(<Loader color="secondary" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'medium', 'secondary');
      expect(container).not.toHaveClass('primary', 'white');
    });

    it('renders white color correctly', () => {
      render(<Loader color="white" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'medium', 'white');
      expect(container).not.toHaveClass('primary', 'secondary');
    });
  });

  describe('Text Customization', () => {
    it('renders custom loading text', () => {
      render(<Loader text="Please wait..." />);

      const textElements = screen.getAllByText('Please wait...');
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toBeInTheDocument();
      expect(visibleText).toHaveClass('loader-text');

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Please wait...');
    });

    it('renders empty text when text prop is empty string', () => {
      render(<Loader text="" />);

      // When text is empty string, only sr-only is rendered (loader-text is not rendered)
      const srText = screen.getByText('', { selector: '.sr-only' });
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');

      // loader-text should not be rendered for empty string
      const loaderText = screen
        .getByRole('status')
        .querySelector('.loader-text');
      expect(loaderText).not.toBeInTheDocument();
    });

    it('renders without text when text prop is null', () => {
      render(<Loader text={null as unknown as string} />);

      // When text is null, it defaults to "Loading..." but renders empty elements
      const srText = screen.getByRole('status').querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveTextContent('');

      // loader-text should not be rendered for null values
      const loaderText = screen
        .getByRole('status')
        .querySelector('.loader-text');
      expect(loaderText).not.toBeInTheDocument();
    });

    it('renders without text when text prop is undefined', () => {
      render(<Loader text={undefined} />);

      // When text is undefined, it defaults to "Loading..." and both elements are rendered
      const textElements = screen.getAllByText('Loading...');
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      const srText = textElements.find((el) =>
        el.classList.contains('sr-only')
      );

      expect(visibleText).toBeInTheDocument();
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Fullscreen Mode', () => {
    it('applies fullscreen class when fullscreen is true', () => {
      render(<Loader fullscreen={true} />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass(
        'loader-container',
        'medium',
        'primary',
        'fullscreen'
      );
    });

    it('does not apply fullscreen class when fullscreen is false', () => {
      render(<Loader fullscreen={false} />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'medium', 'primary');
      expect(container).not.toHaveClass('fullscreen');
    });

    it('defaults to non-fullscreen when fullscreen prop is not provided', () => {
      render(<Loader />);

      const container = screen.getByRole('status');
      expect(container).not.toHaveClass('fullscreen');
    });
  });

  describe('SVG Spinner', () => {
    it('renders SVG spinner with correct attributes', () => {
      render(<Loader />);

      const svg = screen.getByRole('status').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 50 50');

      const circle = svg?.querySelector('circle');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('cx', '25');
      expect(circle).toHaveAttribute('cy', '25');
      expect(circle).toHaveAttribute('r', '20');
      expect(circle).toHaveAttribute('fill', 'none');
      expect(circle).toHaveAttribute('stroke', 'currentColor');
      expect(circle).toHaveAttribute('stroke-width', '4');
      expect(circle).toHaveAttribute('stroke-linecap', 'round');
      expect(circle).toHaveAttribute('stroke-dasharray', '31.416');
      expect(circle).toHaveAttribute('stroke-dashoffset', '31.416');
    });

    it('maintains spinner structure across all size variants', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach((size) => {
        const { container } = render(<Loader size={size} />);
        const svg = container.querySelector('svg');
        const circle = svg?.querySelector('circle');

        expect(svg).toBeInTheDocument();
        expect(circle).toBeInTheDocument();
        expect(circle).toHaveAttribute('cx', '25');
        expect(circle).toHaveAttribute('cy', '25');
        expect(circle).toHaveAttribute('r', '20');

        container.remove();
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct role attribute', () => {
      render(<Loader />);

      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    it('has correct aria-label attribute', () => {
      render(<Loader text="Custom loading text" />);

      const loader = screen.getByRole('status');
      expect(loader).toHaveAttribute('aria-label', 'Custom loading text');
    });

    it('has aria-live attribute on text for screen readers', () => {
      render(<Loader text="Loading data..." />);

      const textElements = screen.getAllByText('Loading data...');
      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toHaveAttribute('aria-live', 'polite');
    });

    it('has screen reader only text', () => {
      render(<Loader text="Loading..." />);

      const srText = screen.getByText('Loading...', { selector: '.sr-only' });
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Component Structure', () => {
    it('has correct DOM hierarchy', () => {
      render(<Loader />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container');

      const content = container.querySelector('.loader-content');
      expect(content).toBeInTheDocument();

      const spinner = content?.querySelector('.loader-spinner');
      expect(spinner).toBeInTheDocument();

      const text = content?.querySelector('.loader-text');
      expect(text).toBeInTheDocument();
    });

    it('maintains consistent structure with different props', () => {
      const { rerender } = render(<Loader size="small" color="secondary" />);

      let container = screen.getByRole('status');
      expect(container).toHaveClass('loader-container', 'small', 'secondary');

      rerender(<Loader size="large" color="white" fullscreen={true} />);

      container = screen.getByRole('status');
      expect(container).toHaveClass(
        'loader-container',
        'large',
        'white',
        'fullscreen'
      );

      // Structure should remain the same
      const content = container.querySelector('.loader-content');
      const spinner = content?.querySelector('.loader-spinner');
      const text = content?.querySelector('.loader-text');

      expect(content).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text gracefully', () => {
      const longText =
        'This is a very long loading message that might exceed normal lengths and should be handled gracefully by the component without breaking the layout or functionality';
      render(<Loader text={longText} />);

      const textElements = screen.getAllByText(longText);
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toBeInTheDocument();
      expect(visibleText).toHaveClass('loader-text');

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', longText);
    });

    it('handles special characters in text', () => {
      const specialText = 'Loading... 🚀 & <script>alert("xss")</script>';
      render(<Loader text={specialText} />);

      const textElements = screen.getAllByText(specialText);
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toBeInTheDocument();

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', specialText);
    });

    it('handles numeric text values', () => {
      render(<Loader text="42" />);

      const textElements = screen.getAllByText('42');
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toBeInTheDocument();
      expect(visibleText).toHaveClass('loader-text');
    });

    it('handles boolean text values', () => {
      render(<Loader text={true as unknown as string} />);

      // Boolean values render empty elements but the elements are present
      const srText = screen.getByRole('status').querySelector('.sr-only');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
      expect(srText).toHaveTextContent('');

      // loader-text is rendered for boolean values but empty
      const loaderText = screen
        .getByRole('status')
        .querySelector('.loader-text');
      expect(loaderText).toBeInTheDocument();
      expect(loaderText).toHaveClass('loader-text');
      expect(loaderText).toHaveTextContent('');
    });
  });

  describe('CSS Class Combinations', () => {
    it('combines multiple size and color classes correctly', () => {
      render(<Loader size="large" color="white" fullscreen={true} />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass(
        'loader-container',
        'large',
        'white',
        'fullscreen'
      );
    });

    it('trims whitespace in class names correctly', () => {
      // This tests the .trim() functionality in the component
      render(<Loader size="small" color="secondary" fullscreen={false} />);

      const container = screen.getByRole('status');
      const classList = container.className.split(' ');

      // Should not have any empty strings or extra whitespace
      expect(classList).not.toContain('');
      expect(classList).not.toContain(' ');
    });

    it('applies all variant classes when all props are provided', () => {
      render(
        <Loader
          size="large"
          color="white"
          fullscreen={true}
          text="Custom text"
        />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveClass(
        'loader-container',
        'large',
        'white',
        'fullscreen'
      );

      const textElements = screen.getAllByText('Custom text');
      expect(textElements).toHaveLength(2); // One visible, one screen reader

      const visibleText = textElements.find((el) =>
        el.classList.contains('loader-text')
      );
      expect(visibleText).toBeInTheDocument();
      expect(visibleText).toHaveClass('loader-text');
    });
  });
});
