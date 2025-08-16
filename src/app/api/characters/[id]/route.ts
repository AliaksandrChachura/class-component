import { NextRequest, NextResponse } from 'next/server';
import type { Character } from '../../../../types/api';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

const CHARACTER_CACHE = new Map<string, Character>();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cacheKey = `character_${id}`;
    if (CHARACTER_CACHE.has(cacheKey)) {
      return NextResponse.json(CHARACTER_CACHE.get(cacheKey), {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      });
    }

    const response = await fetch(`${RICK_MORTY_API_BASE}/character/${id}`, {
      next: {
        revalidate: 300,
        tags: ['character', `id-${id}`],
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Character not found' },
          { status: 404 }
        );
      }
      throw new Error(
        `Rick and Morty API responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    CHARACTER_CACHE.set(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching character details:', error);

    const fallbackCharacter = {
      id: parseInt(await params.then((p) => p.id), 10),
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

    return NextResponse.json(fallbackCharacter, {
      status: 500,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'ERROR',
      },
    });
  }
}
