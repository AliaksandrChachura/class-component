import type { Character } from '../types/api';

/**
 * Downloads a CSV file containing character data by sending data to the server
 * @param characters Array of characters to include in the CSV
 */
export async function downloadCharactersCSV(
  characters: Character[]
): Promise<void> {
  try {
    const response = await fetch('/api/csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characters }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to generate CSV`
      );
    }

    const csvContent = await response.text();

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characters_${characters.length}_items.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}

/**
 * Downloads a CSV file containing character data by fetching from the server using character IDs
 * @param characterIds Array of character IDs to fetch and include in the CSV
 */
export async function downloadCharactersCSVByIds(
  characterIds: string[]
): Promise<void> {
  try {
    const idsParam = characterIds.join(',');
    const response = await fetch(
      `/api/csv?ids=${encodeURIComponent(idsParam)}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to generate CSV`
      );
    }

    const csvContent = await response.text();

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characters_${characterIds.length}_items.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}

/**
 * Downloads a CSV file containing character data by fetching from the server using character IDs
 * This version shows a loading state and handles errors gracefully
 * @param characterIds Array of character IDs to fetch and include in the CSV
 * @param onProgress Optional callback for progress updates
 */
export async function downloadCharactersCSVWithProgress(
  characterIds: string[],
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    if (onProgress) onProgress(0);

    const idsParam = characterIds.join(',');
    const response = await fetch(
      `/api/csv?ids=${encodeURIComponent(idsParam)}`,
      {
        method: 'GET',
      }
    );

    if (onProgress) onProgress(50);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: Failed to generate CSV`
      );
    }

    // Get the CSV content from the response
    const csvContent = await response.text();

    if (onProgress) onProgress(75);

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `characters_${characterIds.length}_items.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onProgress) onProgress(100);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}
