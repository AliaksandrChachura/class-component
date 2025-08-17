import { NextRequest, NextResponse } from 'next/server';
import type { RickMortyResponse } from '../../../types/api';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

const CHARACTERS_CACHE = new Map<string, RickMortyResponse>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const name = searchParams.get('name') || '';

    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid page number',
          message: 'Page must be a positive number',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

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
      if (response.status === 404) {
        return NextResponse.json(
          {
            info: {
              count: 0,
              pages: 0,
              next: null,
              prev: null,
            },
            results: [],
            message: 'No characters found matching your search criteria',
            statusCode: 200,
          },
          { status: 200 }
        );
      }

      const errorData = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Rick and Morty API responded with status: ${response.status} - ${errorData}`
      );
    }

    const data = await response.json();

    if (!data || !data.info || !Array.isArray(data.results)) {
      return NextResponse.json(
        {
          error: 'Invalid characters data',
          message: 'The API returned invalid characters data',
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    CHARACTERS_CACHE.set(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching characters:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch characters',
          message: error.message,
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Unknown error occurred',
        message: 'An unexpected error occurred while fetching characters',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
