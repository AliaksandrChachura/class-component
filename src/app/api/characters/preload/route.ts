import { NextResponse } from 'next/server';

const RICK_MORTY_API_BASE = 'https://rickandmortyapi.com/api';

export async function GET() {
  try {
    const preloadPromises = [
      fetch(`${RICK_MORTY_API_BASE}/character?page=1`),
      fetch(`${RICK_MORTY_API_BASE}/character?page=1&name=Rick`),
      fetch(`${RICK_MORTY_API_BASE}/character?page=1&name=Morty`),
    ];

    const results = await Promise.allSettled(preloadPromises);

    const preloadResults = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value.ok) {
        return { success: true, index };
      } else {
        return {
          success: false,
          index,
          error: result.status === 'rejected' ? result.reason : 'Failed',
        };
      }
    });

    return NextResponse.json(
      {
        message: 'Preload completed',
        results: preloadResults,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error during preload:', error);

    return NextResponse.json(
      {
        message: 'Preload failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  }
}
