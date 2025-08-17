import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notFound } from 'next/navigation';
import {
  isAPIError,
  handleAPIError,
  createAPIError,
  validateAPIResponse,
  handleNotFoundError,
  type APIError,
} from '../apiErrorHandler';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock console.error
const mockConsoleError = vi.fn();
Object.defineProperty(console, 'error', {
  value: mockConsoleError,
  writable: true,
});

describe('apiErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('isAPIError', () => {
    it('returns true for valid API error objects', () => {
      const validError: APIError = {
        error: 'Test Error',
        message: 'Test message',
        statusCode: 500,
      };

      expect(isAPIError(validError)).toBe(true);
    });

    it('returns true for API error with optional fields', () => {
      const validError: APIError = {
        error: 'Test Error',
        message: 'Test message',
        statusCode: 404,
        notFound: true,
        timestamp: '2023-01-01T00:00:00.000Z',
        path: '/test',
      };

      expect(isAPIError(validError)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isAPIError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isAPIError(undefined)).toBe(false);
    });

    it('returns false for primitive types', () => {
      expect(isAPIError('string')).toBe(false);
      expect(isAPIError(123)).toBe(false);
      expect(isAPIError(true)).toBe(false);
    });

    it('returns false for objects missing required fields', () => {
      const invalidError1 = { error: 'Test Error' };
      const invalidError2 = { statusCode: 500 };
      const invalidError3 = { error: 123, statusCode: 500 };
      const invalidError4 = { error: 'Test Error', statusCode: '500' };

      expect(isAPIError(invalidError1)).toBe(false);
      expect(isAPIError(invalidError2)).toBe(false);
      expect(isAPIError(invalidError3)).toBe(false);
      expect(isAPIError(invalidError4)).toBe(false);
    });

    it('returns false for objects with wrong field types', () => {
      const invalidError = {
        error: 123,
        message: 'Test message',
        statusCode: '500',
      };

      expect(isAPIError(invalidError)).toBe(false);
    });
  });

  describe('createAPIError', () => {
    it('creates API error with required fields', () => {
      const error = createAPIError('Test Error', 'Test message', 500);

      expect(error).toEqual({
        error: 'Test Error',
        message: 'Test message',
        statusCode: 500,
        notFound: false,
        timestamp: expect.any(String),
      });
    });

    it('creates API error with notFound flag', () => {
      const error = createAPIError('Test Error', 'Test message', 404, true);

      expect(error).toEqual({
        error: 'Test Error',
        message: 'Test message',
        statusCode: 404,
        notFound: true,
        timestamp: expect.any(String),
      });
    });

    it('generates valid ISO timestamp', () => {
      const error = createAPIError('Test Error', 'Test message', 500);
      if (error.timestamp) {
        const timestamp = new Date(error.timestamp);

        expect(timestamp.getTime()).not.toBeNaN();
        expect(error.timestamp).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        );
      }
    });
  });

  describe('handleAPIError', () => {
    it('calls notFound when error has notFound flag', () => {
      const error = createAPIError('Test Error', 'Test message', 404, true);

      expect(() => handleAPIError(error, 'test context')).toThrow();
      expect(notFound).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'API Error in test context:',
        error
      );
    });

    it('calls notFound when error has 404 status code', () => {
      const error = createAPIError('Test Error', 'Test message', 404);

      expect(() => handleAPIError(error, 'test context')).toThrow();
      expect(notFound).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'API Error in test context:',
        error
      );
    });

    it('throws error for non-404 errors without notFound flag', () => {
      const error = createAPIError('Test Error', 'Test message', 500);

      expect(() => handleAPIError(error, 'test context')).toThrow();
      expect(notFound).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'API Error in test context:',
        error
      );
    });

    it('uses default context when none provided', () => {
      const error = createAPIError('Test Error', 'Test message', 500);

      expect(() => handleAPIError(error)).toThrow();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'API Error in unknown context:',
        error
      );
    });

    it('handles non-API errors by throwing them', () => {
      const regularError = new Error('Regular error');

      expect(() => handleAPIError(regularError, 'test context')).toThrow(
        regularError
      );
      expect(notFound).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'API Error in test context:',
        regularError
      );
    });

    it('handles primitive errors by throwing them', () => {
      const primitiveError = 'String error';

      expect(() => handleAPIError(primitiveError, 'test context')).toThrow(
        primitiveError
      );
      expect(notFound).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'API Error in test context:',
        primitiveError
      );
    });
  });

  describe('validateAPIResponse', () => {
    it('does not throw for valid response with all required fields', () => {
      const validResponse = {
        id: 1,
        name: 'Test',
        status: 'active',
      };

      expect(() =>
        validateAPIResponse(validResponse, ['id', 'name', 'status'])
      ).not.toThrow();
    });

    it('throws error for null response', () => {
      expect(() => validateAPIResponse(null, ['id'])).toThrow();
    });

    it('throws error for undefined response', () => {
      expect(() => validateAPIResponse(undefined, ['id'])).toThrow();
    });

    it('throws error for primitive response', () => {
      expect(() => validateAPIResponse('string', ['id'])).toThrow();
      expect(() => validateAPIResponse(123, ['id'])).toThrow();
      expect(() => validateAPIResponse(true, ['id'])).toThrow();
    });

    it('throws error for missing required fields', () => {
      const response = { id: 1, name: 'Test' };

      expect(() =>
        validateAPIResponse(response, ['id', 'name', 'status'])
      ).toThrow();
    });

    it('throws error with correct error details for missing fields', () => {
      const response = { id: 1 };
      const requiredFields = ['id', 'name', 'status'];

      try {
        validateAPIResponse(response, requiredFields);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        if (isAPIError(error)) {
          expect(error.error).toBe('Validation Error');
          expect(error.message).toBe('Missing required field: name');
          expect(error.statusCode).toBe(500);
        } else {
          expect.fail('Expected APIError to be thrown');
        }
      }
    });

    it('throws error with correct error details for invalid data', () => {
      try {
        validateAPIResponse(null, ['id']);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        if (isAPIError(error)) {
          expect(error.error).toBe('Validation Error');
          expect(error.message).toBe('Invalid response data');
          expect(error.statusCode).toBe(500);
        } else {
          expect.fail('Expected APIError to be thrown');
        }
      }
    });
  });

  describe('handleNotFoundError', () => {
    it('calls notFound with default message', () => {
      expect(() => handleNotFoundError()).toThrow();
      expect(notFound).toHaveBeenCalled();
    });

    it('calls notFound with custom message', () => {
      const customMessage = 'Custom not found message';

      expect(() => handleNotFoundError(customMessage)).toThrow();
      expect(notFound).toHaveBeenCalled();
    });

    it('creates error with correct properties', () => {
      const customMessage = 'Custom not found message';

      try {
        handleNotFoundError(customMessage);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        if (isAPIError(error)) {
          expect(error.error).toBe('Not Found');
          expect(error.message).toBe(customMessage);
          expect(error.statusCode).toBe(404);
          expect(error.notFound).toBe(true);
        } else {
          expect.fail('Expected APIError to be thrown');
        }
      }
    });
  });

  describe('Integration Tests', () => {
    it('handles complete error flow with notFound flag', () => {
      const error = createAPIError(
        'Not Found',
        'Resource not found',
        404,
        true
      );

      expect(() => handleAPIError(error, 'integration test')).toThrow();
      expect(notFound).toHaveBeenCalled();
    });

    it('handles complete error flow with 404 status', () => {
      const error = createAPIError('Not Found', 'Resource not found', 404);

      expect(() => handleAPIError(error, 'integration test')).toThrow();
      expect(notFound).toHaveBeenCalled();
    });

    it('handles validation error flow', () => {
      const invalidResponse = { id: 1 };

      try {
        validateAPIResponse(invalidResponse, ['id', 'name']);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        if (isAPIError(error)) {
          expect(error.error).toBe('Validation Error');
          expect(error.message).toBe('Missing required field: name');
          expect(error.statusCode).toBe(500);
        } else {
          expect.fail('Expected APIError to be thrown');
        }
      }
    });
  });
});
