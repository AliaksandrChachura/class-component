import { NextRequest, NextResponse } from 'next/server';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const name = searchParams.get('name') || '';
    const species = searchParams.get('species') || '';
    const status = searchParams.get('status') || '';

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
      throw new Error(
        `Rick and Morty API responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Search-Type': 'dynamic',
      },
    });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
