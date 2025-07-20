import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../App';

// Mock React DOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(),
}));

// Mock App component
vi.mock('../../App', () => ({
  default: vi.fn(() => null),
}));

// Mock CSS import
vi.mock('../../styles/index.css', () => ({}));

const mockRender = vi.fn();
const mockCreateRoot = vi.mocked(createRoot);

describe('main.tsx', () => {
  let originalGetElementById: typeof document.getElementById;
  let mockRootElement: HTMLElement;

  beforeEach(() => {
    // Clear module cache to allow fresh imports
    vi.resetModules();

    // Setup mock root element
    mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';

    // Mock createElement
    originalGetElementById = document.getElementById;
    document.getElementById = vi.fn();

    // Setup createRoot mock
    mockCreateRoot.mockReturnValue({
      render: mockRender,
      unmount: vi.fn(),
    } as unknown as ReturnType<typeof createRoot>);

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original getElementById
    document.getElementById = originalGetElementById;
    vi.restoreAllMocks();
  });

  it('throws error when root element is not found', async () => {
    // Mock getElementById to return null
    vi.mocked(document.getElementById).mockReturnValue(null);

    await expect(async () => {
      // Dynamically import main to trigger the code
      await import('../../main.tsx');
    }).rejects.toThrow('Root element not found');

    expect(document.getElementById).toHaveBeenCalledWith('root');
  });

  it('creates root and renders App in StrictMode when root element exists', async () => {
    // Mock getElementById to return mock element
    vi.mocked(document.getElementById).mockReturnValue(mockRootElement);

    // Dynamically import main to trigger the code
    await import('../../main.tsx');

    // Verify createRoot was called with correct element
    expect(createRoot).toHaveBeenCalledWith(mockRootElement);

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Verify the rendered content structure
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(StrictMode);
    expect(renderCall.props.children.type).toBe(App);
  });

  it('calls getElementById with correct selector', async () => {
    // Mock getElementById to return mock element
    vi.mocked(document.getElementById).mockReturnValue(mockRootElement);

    // Dynamically import main to trigger the code
    await import('../../main.tsx');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(document.getElementById).toHaveBeenCalledTimes(1);
  });

  it('renders App component inside StrictMode', async () => {
    // Mock getElementById to return mock element
    vi.mocked(document.getElementById).mockReturnValue(mockRootElement);

    // Dynamically import main to trigger the code
    await import('../../main.tsx');

    // Get the rendered JSX structure
    const renderCall = mockRender.mock.calls[0][0];

    // Verify StrictMode wrapper
    expect(renderCall.type).toBe(StrictMode);

    // Verify App is the child of StrictMode
    const appComponent = renderCall.props.children;
    expect(appComponent.type).toBe(App);
    expect(appComponent.props).toEqual({});
  });
});
