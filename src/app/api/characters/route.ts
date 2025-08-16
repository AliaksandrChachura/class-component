import { NextRequest, NextResponse } from 'next/server';
import type { RickMortyResponse } from '../../../types/api';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

const CHARACTERS_CACHE = new Map<string, RickMortyResponse>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const name = searchParams.get('name') || '';

    const cacheKey = `characters_${page}_${name}`;

    if (CHARACTERS_CACHE.has(cacheKey)) {
      return NextResponse.json(CHARACTERS_CACHE.get(cacheKey), {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    const apiUrl = new URL(`${RICK_MORTY_API_BASE}/character`);
    apiUrl.searchParams.set('page', page);
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
      throw new Error(
        `Rick and Morty API responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    CHARACTERS_CACHE.set(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching characters:', error);

    const fallbackResponse = {
      info: {
        count: 0,
        pages: 0,
        next: null,
        prev: null,
      },
      results: [],
    };

    return NextResponse.json(fallbackResponse, {
      status: 500,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'ERROR',
      },
    });
  }
}
