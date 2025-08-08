import type { RickMortyResponse, Character } from './types';

const baseURL = 'https://rickandmortyapi.com/api';

export async function fetchCharacters(
  searchTerm: string = '',
  pageNumber: number = 1
): Promise<RickMortyResponse> {
  let url = `${baseURL}/character`;
  const params = new URLSearchParams();

  if (searchTerm && searchTerm.trim()) {
    params.append('name', searchTerm.trim());
  }

  if (pageNumber > 1) {
    params.append('page', pageNumber.toString());
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('API request failed');
    }

    if (response.status === 404) {
      throw new Error(response.statusText);
    }

    const data: RickMortyResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

export async function fetchCharacterDetails(
  characterId: number
): Promise<Character> {
  const url = `${baseURL}/character/${characterId}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to fetch character details');
    }

    const character: Character = await response.json();
    return character;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}
