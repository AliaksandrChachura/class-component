const baseURL = 'https://rickandmortyapi.com/api';

export interface RickMortyResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface CharacterSearchPayload {
  pageNumber: number;
  pageSize: number;
  name?: string;
}

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

  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const data: RickMortyResponse = await response.json();
  return data;
}
