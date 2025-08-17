import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const errorType = searchParams.get('type') || 'not-found';
  const message = searchParams.get('message') || 'Resource not found';
  const statusCode = parseInt(searchParams.get('status') || '404', 10);

  console.error(`API Error: ${errorType} - ${message} (${statusCode})`);

  switch (errorType) {
    case 'not-found':
      return NextResponse.json(
        {
          error: 'Not Found',
          message: message,
          statusCode: 404,
          notFound: true,
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
        { status: 404 }
      );

    case 'validation':
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: message,
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
        { status: 400 }
      );

    case 'server':
      return NextResponse.json(
        {
          error: 'Server Error',
          message: message,
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
        { status: 500 }
      );

    default:
      return NextResponse.json(
        {
          error: 'Unknown Error',
          message: message,
          statusCode: statusCode,
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
        { status: statusCode }
      );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorType, message, statusCode = 500 } = body;

    console.error(`API Error: ${errorType} - ${message} (${statusCode})`);

    return NextResponse.json(
      {
        error: errorType || 'Unknown Error',
        message: message || 'An error occurred',
        statusCode: statusCode,
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Error in error handler:', error);

    return NextResponse.json(
      {
        error: 'Error Handler Error',
        message: 'Failed to process error request',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
      },
      { status: 500 }
    );
  }
}
