import 'vitest';
import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

declare module 'vitest' {
  interface Assertion<T = unknown>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}

  interface JestAssertion<T = unknown>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}
