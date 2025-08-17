import { NextRequest, NextResponse } from 'next/server';
import type { Character } from '../../../types/api';

export async function POST(request: NextRequest) {
  try {
    const { characters } = await request.json();

    if (!characters || !Array.isArray(characters)) {
      return NextResponse.json(
        { error: 'Invalid data', message: 'Characters array is required' },
        { status: 400 }
      );
    }

    const csvHeaders = [
      'ID',
      'Name',
      'Status',
      'Species',
      'Gender',
      'Origin',
      'Location',
      'Image URL',
      'Episodes Count',
      'Created Date',
    ].join(',');

    const csvRows = characters.map((character: Character) =>
      [
        character.id,
        `"${character.name.replace(/"/g, '""')}"`, // Escape quotes in names
        character.status,
        character.species,
        character.gender,
        `"${character.origin.name.replace(/"/g, '""')}"`,
        `"${character.location.name.replace(/"/g, '""')}"`,
        character.image,
        character.episode.length,
        character.created,
      ].join(',')
    );

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Create response with CSV content
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="characters_${characters.length}_items.csv"`,
        'Cache-Control': 'no-cache',
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating CSV:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate CSV',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json(
        { error: 'Missing IDs', message: 'Character IDs are required' },
        { status: 400 }
      );
    }

    const characterIds = ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (characterIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid IDs',
          message: 'At least one character ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch character data from Rick and Morty API
    const characters: Character[] = [];
    const failedIds: string[] = [];

    for (const id of characterIds) {
      try {
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/${id}`
        );

        if (response.ok) {
          const character = await response.json();
          characters.push(character);
        } else if (response.status === 404) {
          console.warn(`Character with ID ${id} not found`);
          failedIds.push(id);
        } else {
          console.error(
            `Failed to fetch character ${id}: HTTP ${response.status}`
          );
          failedIds.push(id);
        }
      } catch (error) {
        console.error(`Error fetching character ${id}:`, error);
        failedIds.push(id);
      }
    }

    if (characters.length === 0) {
      let errorMessage = 'Could not fetch any character data';
      if (failedIds.length > 0) {
        errorMessage = `Failed to fetch characters with IDs: ${failedIds.join(', ')}`;
      }

      return NextResponse.json(
        {
          error: 'No characters found',
          message: errorMessage,
          failedIds,
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // If some characters failed but we have some successful ones, log a warning
    if (failedIds.length > 0) {
      console.warn(
        `Successfully fetched ${characters.length} characters, failed to fetch: ${failedIds.join(', ')}`
      );
    }

    // Generate CSV content
    const csvHeaders = [
      'ID',
      'Name',
      'Status',
      'Species',
      'Gender',
      'Origin',
      'Location',
      'Image URL',
      'Episodes Count',
      'Created Date',
    ].join(',');

    const csvRows = characters.map((character: Character) =>
      [
        character.id,
        `"${character.name.replace(/"/g, '""')}"`, // Escape quotes in names
        character.status,
        character.species,
        character.gender,
        `"${character.origin.name.replace(/"/g, '""')}"`,
        `"${character.location.name.replace(/"/g, '""')}"`,
        character.image,
        character.episode.length,
        character.created,
      ].join(',')
    );

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="characters_${characters.length}_items.csv"`,
        'Cache-Control': 'no-cache',
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating CSV:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate CSV',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
