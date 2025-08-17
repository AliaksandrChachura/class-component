import React from 'react';
import { downloadCharactersCSVByIds } from '../lib/csvDownloader';

interface CSVDownloadButtonProps {
  characterIds: string[];
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function CSVDownloadButton({
  characterIds,
  disabled = false,
  className = '',
  children = 'Download CSV',
}: CSVDownloadButtonProps) {
  const handleDownload = async () => {
    try {
      await downloadCharactersCSVByIds(characterIds);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <button
      className={`csv-download-button ${className}`}
      onClick={handleDownload}
      disabled={disabled || characterIds.length === 0}
      aria-label="Download CSV file"
    >
      {children}
    </button>
  );
}
