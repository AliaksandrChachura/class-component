import { NextRequest, NextResponse } from 'next/server';
import {
  handleNotFoundError,
  createAPIError,
  validateAPIResponse,
} from '../../../../lib/apiErrorHandler';
import type { Character } from '../../../../types/api';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

const CHARACTER_CACHE = new Map<string, Character>();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return NextResponse.json(
        createAPIError(
          'Invalid character ID',
          'Character ID must be a positive number',
          400
        ),
        { status: 400 }
      );
    }

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
        handleNotFoundError(`Character with ID ${id} does not exist`);
      }

      const errorData = await response.text().catch(() => 'Unknown error');
      throw createAPIError(
        'API Error',
        `Rick and Morty API responded with status: ${response.status} - ${errorData}`,
        response.status
      );
    }

    const data = await response.json();

    validateAPIResponse(data, ['id', 'name']);

    CHARACTER_CACHE.set(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching character details:', error);

    if (
      error instanceof Error &&
      error.message.includes('NEXT_HTTP_ERROR_FALLBACK;404')
    ) {
      handleNotFoundError('Character not found');
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    if (error instanceof Error) {
      return NextResponse.json(
        createAPIError('Failed to fetch character', error.message, 500),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createAPIError(
        'Unknown error occurred',
        'An unexpected error occurred while fetching character data',
        500
      ),
      { status: 500 }
    );
  }
}
