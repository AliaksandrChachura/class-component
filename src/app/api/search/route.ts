import { NextRequest, NextResponse } from 'next/server';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const name = searchParams.get('name') || '';
    const species = searchParams.get('species') || '';
    const status = searchParams.get('status') || '';

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

    const apiUrl = new URL(`${RICK_MORTY_API_BASE}/character`);
    apiUrl.searchParams.set('page', page);
    if (name) {
      apiUrl.searchParams.set('name', name);
    }
    if (species) {
      apiUrl.searchParams.set('species', species);
    }
    if (status) {
      apiUrl.searchParams.set('status', status);
    }

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 30,
        tags: ['search', `page-${page}`, name ? `name-${name}` : 'all'],
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
          error: 'Invalid search results',
          message: 'The API returned invalid search data',
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Search-Type': 'dynamic',
      },
    });
  } catch (error) {
    console.error('Error fetching search results:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch search results',
          message: error.message,
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Unknown error occurred',
        message: 'An unexpected error occurred while searching',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
