import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pagination from '../Pagination';

const mockOnPageChange = vi.fn();

const renderPagination = (props = {}) => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: mockOnPageChange,
    hasNextPage: true,
    hasPrevPage: false,
    isLoading: false,
    ...props,
  };

  return render(<Pagination {...defaultProps} />);
};

describe('Pagination Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders pagination with page numbers', () => {
      renderPagination({ currentPage: 1, totalPages: 5 });

      // The component shows pages 1, 2, 3, ..., 5 (with ellipsis)
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();

      // Page 4 is hidden by ellipsis when currentPage is 1
      expect(screen.queryByText('4')).not.toBeInTheDocument();
    });

    it('renders pagination info', () => {
      renderPagination({ currentPage: 3, totalPages: 5 });

      expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
    });

    it('highlights current page', () => {
      renderPagination({ currentPage: 3, totalPages: 5 });

      const currentPageButton = screen.getByText('3');
      expect(currentPageButton).toHaveClass('pagination-page--active');
    });
  });

  describe('Navigation Buttons', () => {
    it('calls onPageChange when page number is clicked', () => {
      renderPagination({ currentPage: 1, totalPages: 5 });

      const page2Button = screen.getByText('2');
      fireEvent.click(page2Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('renders previous button when hasPrevPage is true', () => {
      renderPagination({ hasPrevPage: true, currentPage: 2 });

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('‹')).toBeInTheDocument();
    });

    it('renders previous button but disabled when hasPrevPage is false', () => {
      renderPagination({ hasPrevPage: false, currentPage: 1 });

      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toBeDisabled();
    });

    it('renders next button when hasNextPage is true', () => {
      renderPagination({ hasNextPage: true, currentPage: 1 });

      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
    });

    it('renders next button but disabled when hasNextPage is false', () => {
      renderPagination({ hasNextPage: false, currentPage: 5 });

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toBeDisabled();
    });

    it('calls onPageChange with previous page when prev button is clicked', () => {
      renderPagination({ hasPrevPage: true, currentPage: 3 });

      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange with next page when next button is clicked', () => {
      renderPagination({ hasNextPage: true, currentPage: 3 });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('Loading State', () => {
    it('disables pagination when isLoading is true', () => {
      renderPagination({ isLoading: true });

      const pageButtons = screen.getAllByRole('button');
      pageButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('enables pagination when isLoading is false', () => {
      renderPagination({ isLoading: false });

      const pageButtons = screen
        .getAllByRole('button')
        .filter(
          (button) => button.textContent && /^\d+$/.test(button.textContent)
        );
      pageButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles single page correctly', () => {
      renderPagination({ totalPages: 1, currentPage: 1 });

      // Component returns null for single page
      expect(screen.queryByText('1')).not.toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('handles large number of pages correctly', () => {
      renderPagination({ currentPage: 50, totalPages: 100 });

      // Should show current page and surrounding pages with ellipsis
      expect(screen.getByText('48')).toBeInTheDocument();
      expect(screen.getByText('49')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('51')).toBeInTheDocument();
      expect(screen.getByText('52')).toBeInTheDocument();
      // Use getAllByText for multiple ellipsis elements
      expect(screen.getAllByText('...')).toHaveLength(2);
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('applies correct CSS classes to active page', () => {
      renderPagination({ currentPage: 2, totalPages: 5 });

      const activePage = screen.getByText('2');
      const inactivePage = screen.getByText('1');

      expect(activePage).toHaveClass('pagination-page--active');
      expect(inactivePage).not.toHaveClass('pagination-page--active');
    });

    it('handles edge case of current page being 1', () => {
      renderPagination({ currentPage: 1, totalPages: 3 });

      expect(screen.getByText('1')).toHaveClass('pagination-page--active');
      // Previous button is always rendered but disabled when hasPrevPage is false
      expect(screen.getByText('‹')).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
    });

    it('handles edge case of current page being last page', () => {
      renderPagination({ currentPage: 5, totalPages: 5 });

      expect(screen.getByText('5')).toHaveClass('pagination-page--active');
      // Both buttons are always rendered, just disabled when not needed
      expect(screen.getByText('‹')).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
    });
  });

  describe('Page Display Logic', () => {
    it('shows ellipsis when there are many pages', () => {
      renderPagination({ currentPage: 1, totalPages: 10 });

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('shows all pages when total pages is small', () => {
      renderPagination({ currentPage: 2, totalPages: 4 });

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('handles current page in middle range', () => {
      renderPagination({ currentPage: 5, totalPages: 10 });

      expect(screen.getByText('1')).toBeInTheDocument();
      // Use getAllByText for multiple ellipsis elements
      expect(screen.getAllByText('...')).toHaveLength(2);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});
