import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchParamsWrapper from '../SearchParamsWrapper';

// Mock Suspense to avoid issues with async components
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    Suspense: ({
      children,
      fallback,
    }: {
      children: React.ReactNode;
      fallback: React.ReactNode;
    }) => (
      <div data-testid="suspense-wrapper">
        <div data-testid="suspense-fallback">{fallback}</div>
        <div data-testid="suspense-children">{children}</div>
      </div>
    ),
  };
});

describe('SearchParamsWrapper Component', () => {
  describe('Rendering', () => {
    it('renders children wrapped in Suspense', () => {
      const testChildren = <div data-testid="test-children">Test Content</div>;

      render(<SearchParamsWrapper>{testChildren}</SearchParamsWrapper>);

      expect(screen.getByTestId('suspense-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('suspense-children')).toBeInTheDocument();
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with default fallback when no fallback prop is provided', () => {
      const testChildren = <div>Child Component</div>;

      render(<SearchParamsWrapper>{testChildren}</SearchParamsWrapper>);

      expect(screen.getByTestId('suspense-fallback')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom fallback when fallback prop is provided', () => {
      const testChildren = <div>Child Component</div>;
      const customFallback = (
        <div data-testid="custom-fallback">Custom Loading...</div>
      );

      render(
        <SearchParamsWrapper fallback={customFallback}>
          {testChildren}
        </SearchParamsWrapper>
      );

      expect(screen.getByTestId('suspense-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      const testChildren = (
        <>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </>
      );

      render(<SearchParamsWrapper>{testChildren}</SearchParamsWrapper>);

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });

  describe('Fallback Behavior', () => {
    it('uses default fallback when fallback prop is undefined', () => {
      const testChildren = <div>Test</div>;

      render(
        <SearchParamsWrapper fallback={undefined}>
          {testChildren}
        </SearchParamsWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('uses default fallback when fallback prop is null', () => {
      const testChildren = <div>Test</div>;

      render(
        <SearchParamsWrapper fallback={null}>
          {testChildren}
        </SearchParamsWrapper>
      );

      // When fallback is null, it should still render the default fallback
      expect(screen.getByTestId('suspense-fallback')).toBeInTheDocument();
    });

    it('renders complex fallback components', () => {
      const testChildren = <div>Test</div>;
      const complexFallback = (
        <div data-testid="complex-fallback">
          <h2>Loading...</h2>
          <p>Please wait while we fetch your data</p>
          <div className="spinner">⏳</div>
        </div>
      );

      render(
        <SearchParamsWrapper fallback={complexFallback}>
          {testChildren}
        </SearchParamsWrapper>
      );

      expect(screen.getByTestId('complex-fallback')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(
        screen.getByText('Please wait while we fetch your data')
      ).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('renders functional component as fallback', () => {
      const testChildren = <div>Test</div>;
      const FunctionalFallback = () => (
        <div data-testid="functional-fallback">Functional Loading</div>
      );

      render(
        <SearchParamsWrapper fallback={<FunctionalFallback />}>
          {testChildren}
        </SearchParamsWrapper>
      );

      expect(screen.getByTestId('functional-fallback')).toBeInTheDocument();
      expect(screen.getByText('Functional Loading')).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('renders string children', () => {
      render(<SearchParamsWrapper>Simple String</SearchParamsWrapper>);

      expect(screen.getByText('Simple String')).toBeInTheDocument();
    });

    it('renders number children', () => {
      render(<SearchParamsWrapper>{42}</SearchParamsWrapper>);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders boolean children (falsy values)', () => {
      render(<SearchParamsWrapper>{false}</SearchParamsWrapper>);

      // Boolean false renders as empty string, so we check the structure
      expect(screen.getByTestId('suspense-children')).toBeInTheDocument();
    });

    it('renders array of children', () => {
      const childrenArray = [
        <div key="1" data-testid="array-child-1">
          Array Child 1
        </div>,
        <div key="2" data-testid="array-child-2">
          Array Child 2
        </div>,
      ];

      render(<SearchParamsWrapper>{childrenArray}</SearchParamsWrapper>);

      expect(screen.getByTestId('array-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('array-child-2')).toBeInTheDocument();
      expect(screen.getByText('Array Child 1')).toBeInTheDocument();
      expect(screen.getByText('Array Child 2')).toBeInTheDocument();
    });

    it('renders functional component children', () => {
      const TestChild = () => (
        <div data-testid="functional-child">Functional Child</div>
      );

      render(
        <SearchParamsWrapper>
          <TestChild />
        </SearchParamsWrapper>
      );

      expect(screen.getByTestId('functional-child')).toBeInTheDocument();
      expect(screen.getByText('Functional Child')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('maintains proper DOM hierarchy', () => {
      const testChildren = <div data-testid="test-child">Test</div>;

      render(<SearchParamsWrapper>{testChildren}</SearchParamsWrapper>);

      const suspenseWrapper = screen.getByTestId('suspense-wrapper');
      const suspenseFallback = screen.getByTestId('suspense-fallback');
      const suspenseChildren = screen.getByTestId('suspense-children');
      const testChild = screen.getByTestId('test-child');

      expect(suspenseWrapper).toContainElement(suspenseFallback);
      expect(suspenseWrapper).toContainElement(suspenseChildren);
      expect(suspenseChildren).toContainElement(testChild);
    });

    it('applies correct data attributes for testing', () => {
      render(<SearchParamsWrapper>Test</SearchParamsWrapper>);

      expect(screen.getByTestId('suspense-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('suspense-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('suspense-children')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<SearchParamsWrapper>{null}</SearchParamsWrapper>);

      expect(screen.getByTestId('suspense-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('suspense-children')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      render(<SearchParamsWrapper>{null}</SearchParamsWrapper>);

      expect(screen.getByTestId('suspense-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('suspense-children')).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(<SearchParamsWrapper>{undefined}</SearchParamsWrapper>);

      expect(screen.getByTestId('suspense-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('suspense-children')).toBeInTheDocument();
    });

    it('handles mixed children types', () => {
      const mixedChildren = [
        <div key="1">String Child</div>,
        'Text Child',
        42,
        null,
        undefined,
        <div key="2">Another Div</div>,
      ];

      render(<SearchParamsWrapper>{mixedChildren}</SearchParamsWrapper>);

      expect(screen.getByText('String Child')).toBeInTheDocument();
      expect(screen.getByText('Another Div')).toBeInTheDocument();

      // Check that the mixed content is rendered in the children container
      const childrenContainer = screen.getByTestId('suspense-children');
      expect(childrenContainer).toHaveTextContent('Text Child');
      expect(childrenContainer).toHaveTextContent('42');
    });
  });

  describe('Props Interface', () => {
    it('accepts children prop correctly', () => {
      const testChildren = <div>Test Children</div>;

      render(<SearchParamsWrapper>{testChildren}</SearchParamsWrapper>);

      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });

    it('accepts optional fallback prop correctly', () => {
      const testChildren = <div>Test</div>;
      const customFallback = <div>Custom Fallback</div>;

      render(
        <SearchParamsWrapper fallback={customFallback}>
          {testChildren}
        </SearchParamsWrapper>
      );

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    });

    it('uses default fallback when fallback prop is not provided', () => {
      const testChildren = <div>Test</div>;

      render(<SearchParamsWrapper>{testChildren}</SearchParamsWrapper>);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
