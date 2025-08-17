import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CacheManager from '../CacheManager';

// Mock the useCharacterCache hook
const mockGetCacheStats = vi.fn();
const mockClearAllCache = vi.fn();
const mockClearExpiredCache = vi.fn();

vi.mock('../../hooks/useCharacterCache', () => ({
  useCharacterCache: () => ({
    getCacheStats: mockGetCacheStats,
    clearAllCache: mockClearAllCache,
    clearExpiredCache: mockClearExpiredCache,
  }),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Mock setInterval and clearInterval
const mockSetInterval = vi.fn();
const mockClearInterval = vi.fn();
Object.defineProperty(global, 'setInterval', {
  value: mockSetInterval,
  writable: true,
});
Object.defineProperty(global, 'clearInterval', {
  value: mockClearInterval,
  writable: true,
});

describe('CacheManager Component', () => {
  const mockCacheStats = {
    totalEntries: 10,
    validEntries: 8,
    expiredEntries: 2,
    cacheSize: '2.5 MB',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCacheStats.mockReturnValue(mockCacheStats);
    mockSetInterval.mockReturnValue(123); // Mock interval ID
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const openCachePanel = () => {
    const toggleButton = screen.getByText(/💾/);
    fireEvent.click(toggleButton);
  };

  describe('Rendering', () => {
    it('renders cache manager toggle button', () => {
      render(<CacheManager />);

      const toggleButton = screen.getByText(/💾/);
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass('cache-manager-toggle');
      expect(toggleButton).toHaveAttribute('title', 'Cache Manager');
    });

    it('displays cache icon and valid entries count', () => {
      render(<CacheManager />);

      const toggleButton = screen.getByText(/💾/);
      expect(toggleButton).toHaveTextContent('💾 8');
    });

    it('shows 0 entries when not mounted', async () => {
      mockGetCacheStats.mockReturnValue({ ...mockCacheStats, validEntries: 0 });

      render(<CacheManager />);

      const toggleButton = screen.getByText(/💾/);
      expect(toggleButton).toHaveTextContent('💾 0');
    });

    it('does not render cache panel initially', () => {
      render(<CacheManager />);

      expect(
        screen.queryByText('Character Cache Manager')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Total Entries:')).not.toBeInTheDocument();
    });
  });

  describe('Panel Toggle', () => {
    it('shows cache panel when toggle button is clicked', () => {
      render(<CacheManager />);

      openCachePanel();

      expect(screen.getByText('Character Cache Manager')).toBeInTheDocument();
      expect(screen.getByText('Total Entries:')).toBeInTheDocument();
    });

    it('hides cache panel when close button is clicked', () => {
      render(<CacheManager />);

      openCachePanel();

      expect(screen.getByText('Character Cache Manager')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', {
        name: /close cache manager/i,
      });
      fireEvent.click(closeButton);

      expect(
        screen.queryByText('Character Cache Manager')
      ).not.toBeInTheDocument();
    });

    it('toggles panel visibility on multiple clicks', () => {
      render(<CacheManager />);

      const toggleButton = screen.getByText(/💾/);

      // First click - show panel
      fireEvent.click(toggleButton);
      expect(screen.getByText('Character Cache Manager')).toBeInTheDocument();

      // Second click - hide panel
      fireEvent.click(toggleButton);
      expect(
        screen.queryByText('Character Cache Manager')
      ).not.toBeInTheDocument();

      // Third click - show panel again
      fireEvent.click(toggleButton);
      expect(screen.getByText('Character Cache Manager')).toBeInTheDocument();
    });
  });

  describe('Cache Statistics Display', () => {
    it('displays all cache statistics when panel is open', () => {
      render(<CacheManager />);

      openCachePanel();

      expect(screen.getByText('Total Entries:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      expect(screen.getByText('Valid Entries:')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();

      expect(screen.getByText('Expired Entries:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      expect(screen.getByText('Cache Size:')).toBeInTheDocument();
      expect(screen.getByText('2.5 MB')).toBeInTheDocument();
    });

    it('applies correct CSS classes to stat values', () => {
      render(<CacheManager />);

      openCachePanel();

      const validEntriesValue = screen.getByText('8');
      expect(validEntriesValue).toHaveClass('stat-value', 'valid');

      const expiredEntriesValue = screen.getByText('2');
      expect(expiredEntriesValue).toHaveClass('stat-value', 'expired');
    });
  });

  describe('Cache Actions', () => {
    it('renders clear expired and clear all buttons', () => {
      render(<CacheManager />);

      openCachePanel();

      expect(
        screen.getByRole('button', { name: /clear expired/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear all/i })
      ).toBeInTheDocument();
    });

    it('disables clear expired button when no expired entries', () => {
      mockGetCacheStats.mockReturnValue({
        ...mockCacheStats,
        expiredEntries: 0,
      });

      render(<CacheManager />);

      openCachePanel();

      const clearExpiredButton = screen.getByRole('button', {
        name: /clear expired/i,
      });
      expect(clearExpiredButton).toBeDisabled();
    });

    it('disables clear all button when no entries', () => {
      mockGetCacheStats.mockReturnValue({ ...mockCacheStats, totalEntries: 0 });

      render(<CacheManager />);

      openCachePanel();

      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearAllButton).toBeDisabled();
    });

    it('calls clearExpiredCache when clear expired button is clicked', () => {
      render(<CacheManager />);

      openCachePanel();

      const clearExpiredButton = screen.getByRole('button', {
        name: /clear expired/i,
      });
      fireEvent.click(clearExpiredButton);

      expect(mockClearExpiredCache).toHaveBeenCalledTimes(1);
      expect(mockGetCacheStats).toHaveBeenCalledTimes(2); // Initial + after clear
    });

    it('calls clearAllCache with confirmation when clear all button is clicked', () => {
      mockConfirm.mockReturnValue(true);

      render(<CacheManager />);

      openCachePanel();

      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      fireEvent.click(clearAllButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all cached character data?'
      );
      expect(mockClearAllCache).toHaveBeenCalledTimes(1);
      expect(mockGetCacheStats).toHaveBeenCalledTimes(2); // Initial + after clear
    });

    it('does not call clearAllCache when confirmation is cancelled', () => {
      mockConfirm.mockReturnValue(false);

      render(<CacheManager />);

      openCachePanel();

      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      fireEvent.click(clearAllButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all cached character data?'
      );
      expect(mockClearAllCache).not.toHaveBeenCalled();
    });
  });

  describe('Cache Information', () => {
    it('displays cache information text', () => {
      render(<CacheManager />);

      openCachePanel();

      expect(
        screen.getByText(/Character details are cached for 24 hours/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Expired entries are automatically cleaned up/)
      ).toBeInTheDocument();
    });
  });

  describe('Auto-refresh Functionality', () => {
    it('sets up interval to refresh cache stats every 5 seconds', () => {
      render(<CacheManager />);

      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('cleans up interval on unmount', () => {
      const { unmount } = render(<CacheManager />);

      unmount();

      expect(mockClearInterval).toHaveBeenCalledWith(123);
    });

    it('updates cache stats when interval fires', async () => {
      const newStats = { ...mockCacheStats, validEntries: 5 };
      mockGetCacheStats
        .mockReturnValueOnce(mockCacheStats)
        .mockReturnValue(newStats);

      render(<CacheManager />);

      // Initial render
      expect(screen.getByText('💾 8')).toBeInTheDocument();

      // Simulate interval firing
      const intervalCallback = mockSetInterval.mock.calls[0][0];
      act(() => {
        intervalCallback();
      });

      // Stats should be updated
      await waitFor(() => {
        expect(screen.getByText('💾 5')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty cache stats gracefully', () => {
      mockGetCacheStats.mockReturnValue({
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        cacheSize: '0 B',
      });

      render(<CacheManager />);

      openCachePanel();

      expect(screen.getByText('Total Entries:')).toBeInTheDocument();
      expect(screen.getByText('Cache Size:')).toBeInTheDocument();
      expect(screen.getByText('0 B')).toBeInTheDocument();

      // Check that all stats show 0 by looking at the specific stat items
      const totalEntriesValue =
        screen.getByText('Total Entries:').nextElementSibling;
      const validEntriesValue =
        screen.getByText('Valid Entries:').nextElementSibling;
      const expiredEntriesValue =
        screen.getByText('Expired Entries:').nextElementSibling;

      expect(totalEntriesValue).toHaveTextContent('0');
      expect(validEntriesValue).toHaveTextContent('0');
      expect(expiredEntriesValue).toHaveTextContent('0');
    });

    it('handles large cache sizes', () => {
      mockGetCacheStats.mockReturnValue({
        ...mockCacheStats,
        cacheSize: '1.2 GB',
      });

      render(<CacheManager />);

      openCachePanel();

      expect(screen.getByText('1.2 GB')).toBeInTheDocument();
    });
  });
});
