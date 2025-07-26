import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../App';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(),
}));

vi.mock('../../App', () => ({
  default: vi.fn(() => null),
}));

vi.mock('../../styles/index.css', () => ({}));

describe('Main Entry Point', () => {
  let mockRootElement: HTMLElement;
  let mockCreateRoot: ReturnType<typeof vi.fn>;
  let mockRender: ReturnType<typeof vi.fn>;
  let originalGetElementById: typeof document.getElementById;

  beforeEach(() => {
    vi.resetModules();

    mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';

    mockRender = vi.fn();
    mockCreateRoot = vi.fn(() => ({
      render: mockRender,
    }));

    vi.mocked(createRoot).mockImplementation(mockCreateRoot);

    vi.clearAllMocks();

    originalGetElementById = document.getElementById;
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('throws error when root element is not found', async () => {
    document.getElementById = vi.fn().mockReturnValue(null);

    await expect(async () => {
      await import('../../main');
    }).rejects.toThrow('Root element not found');
  });

  it('creates root and renders app when root element exists', async () => {
    document.getElementById = vi.fn().mockReturnValue(mockRootElement);

    await import('../../main');

    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);

    expect(mockRender).toHaveBeenCalledTimes(1);

    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(StrictMode);
    expect(renderCall.props.children.type).toBe(App);
  });

  it('uses correct root element selector', async () => {
    document.getElementById = vi.fn().mockReturnValue(mockRootElement);

    await import('../../main');

    expect(document.getElementById).toHaveBeenCalledWith('root');
  });

  it('renders App component inside StrictMode', async () => {
    document.getElementById = vi.fn().mockReturnValue(mockRootElement);

    await import('../../main');

    const renderCall = mockRender.mock.calls[0][0];

    expect(renderCall.type).toBe(StrictMode);

    expect(renderCall.props.children.type).toBe(App);
  });
});
