import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CSVDownloadButton from '../CSVDownloadButton';

// Mock the CSV download functionality
vi.mock('../../lib/csvDownloader', () => ({
  downloadCharactersCSVByIds: vi.fn(),
}));

const mockCharacterIds = ['1', '2', '3'];

const renderCSVButton = (props = {}) => {
  return render(
    <CSVDownloadButton characterIds={mockCharacterIds} {...props} />
  );
};

describe('CSVDownloadButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders download button with correct text', () => {
      renderCSVButton();

      expect(
        screen.getByRole('button', { name: 'Download CSV file' })
      ).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).toHaveClass('csv-download-button');
    });

    it('has correct button type', () => {
      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      // HTML buttons without explicit type attribute default to type="submit" in forms,
      // but since this is a standalone button, it should not have a type attribute
      expect(button).not.toHaveAttribute('type');
    });

    it('handles custom children prop', () => {
      renderCSVButton({ children: 'Custom Text' });

      expect(
        screen.getByRole('button', { name: 'Download CSV file' })
      ).toBeInTheDocument();
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });

    it('handles custom className', () => {
      renderCSVButton({ className: 'custom-class' });

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).toHaveClass('csv-download-button custom-class');
    });

    it('has correct accessibility attributes', () => {
      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).toHaveAttribute('aria-label', 'Download CSV file');
    });
  });

  describe('Functionality', () => {
    it('calls downloadCharactersCSVByIds when button is clicked', async () => {
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );
      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      fireEvent.click(button);

      expect(downloadCharactersCSVByIds).toHaveBeenCalledWith(mockCharacterIds);
    });

    it('handles empty characterIds array', async () => {
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );
      renderCSVButton({ characterIds: [] });

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(downloadCharactersCSVByIds).not.toHaveBeenCalled();
    });

    it('handles disabled prop', () => {
      renderCSVButton({ disabled: true });

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).toBeDisabled();
    });

    it('renders button as clickable element when not disabled', () => {
      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles single character ID', async () => {
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );
      renderCSVButton({ characterIds: ['1'] });

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(downloadCharactersCSVByIds).toHaveBeenCalledWith(['1']);
    });

    it('handles very long character IDs array', async () => {
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );
      const longCharacterIds = Array.from({ length: 100 }, (_, i) =>
        i.toString()
      );
      renderCSVButton({ characterIds: longCharacterIds });

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(downloadCharactersCSVByIds).toHaveBeenCalledWith(longCharacterIds);
    });

    it('handles special characters in character IDs', async () => {
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );
      const specialCharacterIds = ['id-1', 'id_2', 'id.3', 'id@4'];
      renderCSVButton({ characterIds: specialCharacterIds });

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(downloadCharactersCSVByIds).toHaveBeenCalledWith(
        specialCharacterIds
      );
    });
  });

  describe('Error Handling', () => {
    it('handles download function errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );

      // Mock the function to throw an error
      vi.mocked(downloadCharactersCSVByIds).mockRejectedValueOnce(
        new Error('Download failed')
      );

      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      fireEvent.click(button);

      // Wait for the async operation to complete
      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error downloading CSV:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('maintains button state during download', async () => {
      const { downloadCharactersCSVByIds } = await import(
        '../../lib/csvDownloader'
      );
      let resolveDownload: () => void;
      const downloadPromise = new Promise<void>((resolve) => {
        resolveDownload = resolve;
      });

      vi.mocked(downloadCharactersCSVByIds).mockReturnValueOnce(
        downloadPromise
      );

      renderCSVButton();

      const button = screen.getByRole('button', { name: 'Download CSV file' });
      fireEvent.click(button);

      // Button should remain enabled during download
      expect(button).not.toBeDisabled();

      // Resolve the download
      if (resolveDownload) {
        resolveDownload();
      }
      await downloadPromise;
    });
  });
});
