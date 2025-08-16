import type {
  CharacterSearchParams,
  Character,
  RickMortyResponse,
} from '../../types/api';

export async function getCharacters(
  params: CharacterSearchParams = {}
): Promise<RickMortyResponse> {
  const { page = 1, name = '' } = params;

  let apiUrl = '/api/characters';
  const searchParams = new URLSearchParams();
  searchParams.set('page', page.toString());
  if (name) {
    searchParams.set('name', name);
  }
  if (searchParams.toString()) {
    apiUrl += `?${searchParams.toString()}`;
  }

  try {
    const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${apiUrl}`;

    const response = await fetch(fullUrl, {
      next: {
        revalidate: 60,
        tags: ['characters', `page-${page}`, name ? `search-${name}` : 'all'],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch characters: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching characters:', error);

    return {
      info: {
        count: 0,
        pages: 0,
        next: null,
        prev: null,
      },
      results: [],
    };
  }
}

export async function getCharacterById(id: string): Promise<Character> {
  try {
    const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/characters/${id}`, {
      next: {
        revalidate: 300,
        tags: ['character', `id-${id}`],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Character not found');
      }
      throw new Error(`Failed to fetch character: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching character by ID:', error);

    return {
      id: parseInt(id, 10),
      name: 'Unknown Character',
      status: 'unknown',
      species: 'unknown',
      gender: 'unknown',
      origin: {
        name: 'Unknown',
        url: '',
      },
      location: {
        name: 'Unknown',
        url: '',
      },
      image: '',
      episode: [],
      url: '',
      created: new Date().toISOString(),
    };
  }
}
