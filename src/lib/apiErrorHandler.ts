import { notFound } from 'next/navigation';

export interface APIError {
  error: string;
  message: string;
  statusCode: number;
  notFound?: boolean;
  timestamp?: string;
  path?: string;
}

export function isAPIError(data: unknown): data is APIError {
  return (
    data !== null &&
    typeof data === 'object' &&
    'error' in data &&
    'statusCode' in data &&
    typeof (data as Record<string, unknown>).error === 'string' &&
    typeof (data as Record<string, unknown>).statusCode === 'number'
  );
}

export function handleAPIError(error: unknown, context?: string): never {
  console.error(`API Error in ${context || 'unknown context'}:`, error);

  // If it's already an API error with a notFound flag, trigger the not-found page
  if (isAPIError(error) && error.notFound) {
    notFound();
  }

  // If it's a 404 error, trigger the not-found page
  if (isAPIError(error) && error.statusCode === 404) {
    notFound();
  }

  // For other errors, throw them to be handled by error boundaries
  throw error;
}

export function createAPIError(
  errorType: string,
  message: string,
  statusCode: number,
  notFound: boolean = false
): APIError {
  return {
    error: errorType,
    message,
    statusCode,
    notFound,
    timestamp: new Date().toISOString(),
  };
}

export function validateAPIResponse(
  data: unknown,
  requiredFields: string[]
): void {
  if (!data || typeof data !== 'object') {
    throw createAPIError('Validation Error', 'Invalid response data', 500);
  }

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw createAPIError(
        'Validation Error',
        `Missing required field: ${field}`,
        500
      );
    }
  }
}

export function handleNotFoundError(
  message: string = 'Resource not found'
): never {
  const error = createAPIError('Not Found', message, 404, true);
  handleAPIError(error);
}
