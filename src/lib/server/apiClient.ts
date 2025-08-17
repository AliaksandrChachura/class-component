import type {
  CharacterSearchParams,
  Character,
  RickMortyResponse,
} from '../../types/api';

export async function getCharacters(
  params: CharacterSearchParams = {}
): Promise<RickMortyResponse> {
  const { page = 1, name = '' } = params;

  // For server-side calls, we can directly call the Rick and Morty API
  // instead of going through our own API route
  try {
    const apiUrl = new URL('https://rickandmortyapi.com/api/character');
    apiUrl.searchParams.set('page', page.toString());
    if (name) {
      apiUrl.searchParams.set('name', name);
    }

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 60,
        tags: ['characters', `page-${page}`, name ? `search-${name}` : 'all'],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
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
    const response = await fetch(
      `https://rickandmortyapi.com/api/character/${id}`,
      {
        next: {
          revalidate: 300,
          tags: ['character', `id-${id}`],
        },
      }
    );

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
