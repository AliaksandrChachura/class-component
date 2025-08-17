import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Search from '../Search';
import { SearchProvider } from '../../context/SearchProvider';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'placeholder') return 'Search characters...';
    if (key === 'searchButton') return 'Search';
    return key;
  },
}));

// Mock useSearch hook with better setup
const mockUseSearch = {
  state: {
    searchTerm: '',
  },
  setSearchTerm: vi.fn(),
};

vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => mockUseSearch,
}));

const renderSearch = () => {
  return render(
    <SearchProvider>
      <Search />
    </SearchProvider>
  );
};

describe('Search Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearch.state.searchTerm = '';
    user = userEvent.setup();
  });

  describe('Rendering', () => {
    it('renders search input and button', () => {
      renderSearch();

      expect(
        screen.getByPlaceholderText('Search characters...')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Search' })
      ).toBeInTheDocument();
    });

    it('updates input value when typing', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText(
        'Search characters...'
      ) as HTMLInputElement;
      await user.type(input, 'Rick');

      expect(input.value).toBe('Rick');
    });

    it('updates input value when state.searchTerm changes', () => {
      mockUseSearch.state.searchTerm = 'Morty';
      renderSearch();

      const input = screen.getByPlaceholderText(
        'Search characters...'
      ) as HTMLInputElement;
      expect(input.value).toBe('Morty');
    });
  });

  describe('Search Functionality', () => {
    it('calls setSearchTerm when search button is clicked', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');
      const button = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'Rick');
      await user.click(button);

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('Rick');
    });

    it('calls setSearchTerm when Enter key is pressed', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');

      await user.type(input, 'Rick');
      await user.keyboard('{Enter}');

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('Rick');
    });

    it('trims whitespace when searching via button', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');
      const button = screen.getByRole('button', { name: 'Search' });

      await user.type(input, '  Rick  ');
      await user.click(button);

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('Rick');
    });

    it('trims whitespace when searching via Enter key', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');

      await user.type(input, '  Rick  ');
      await user.keyboard('{Enter}');

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('Rick');
    });
  });

  describe('Keyboard Handling', () => {
    it('does not call setSearchTerm for other keys', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');

      await user.type(input, 'Rick');
      await user.keyboard('{Tab}');

      expect(mockUseSearch.setSearchTerm).not.toHaveBeenCalled();
    });

    it('handles Space key without triggering search', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');

      await user.type(input, 'Rick');
      await user.keyboard(' ');

      expect(mockUseSearch.setSearchTerm).not.toHaveBeenCalled();
    });

    it('handles Escape key without triggering search', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');

      await user.type(input, 'Rick');
      await user.keyboard('{Escape}');

      expect(mockUseSearch.setSearchTerm).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search term via button', async () => {
      renderSearch();

      const button = screen.getByRole('button', { name: 'Search' });

      await user.click(button);

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('');
    });

    it('handles empty search term via Enter key', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');

      // Focus the input first, then press Enter
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('');
    });

    it('handles search with only whitespace via button', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');
      const button = screen.getByRole('button', { name: 'Search' });

      await user.type(input, '   ');
      await user.click(button);

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('');
    });

    it('handles search with only whitespace via Enter key', async () => {
      renderSearch();

      await user.type(
        screen.getByPlaceholderText('Search characters...'),
        '   '
      );
      await user.keyboard('{Enter}');

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith('');
    });
  });

  describe('Input Validation', () => {
    it('allows special characters in search term', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');
      const button = screen.getByRole('button', { name: 'Search' });

      const specialSearchTerm = 'Rick & Morty <script>alert("xss")</script>';
      await user.type(input, specialSearchTerm);
      await user.click(button);

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith(
        specialSearchTerm
      );
    });

    it('handles very long search terms', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText('Search characters...');
      const button = screen.getByRole('button', { name: 'Search' });

      const longSearchTerm = 'A'.repeat(1000);
      await user.type(input, longSearchTerm);
      await user.click(button);

      expect(mockUseSearch.setSearchTerm).toHaveBeenCalledWith(longSearchTerm);
    });
  });
});
