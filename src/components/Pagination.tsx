import React from 'react';
import './Pagination.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  isLoading = false,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="pagination" aria-label="Search results pagination">
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-button pagination-button--prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
          aria-label="Go to previous page"
        >
          <span className="pagination-arrow">‹</span>
          Previous
        </button>

        <div className="pagination-pages">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="pagination-dots">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            return (
              <button
                key={pageNumber}
                className={`pagination-page ${
                  pageNumber === currentPage ? 'pagination-page--active' : ''
                }`}
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          className="pagination-button pagination-button--next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          aria-label="Go to next page"
        >
          Next
          <span className="pagination-arrow">›</span>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
