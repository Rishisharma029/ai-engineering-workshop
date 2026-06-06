import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia since it is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver which is used by Recharts
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock HTMLElement.scrollIntoView which is missing in JSDOM
window.HTMLElement.prototype.scrollIntoView = function () {};

const mockFetchFn = (url: string) => {
  console.log("MOCK FETCH CALLED FOR URL:", url);
  if (url.includes('/api/visualize/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        nodes: [
          { id: 'client', label: 'Client (UI)', type: 'frontend', details: 'Vite Entry' },
          { id: 'server-api', label: 'Express API Server', type: 'backend', details: 'server.ts' }
        ],
        edges: [
          { from: 'client', to: 'server-api', label: 'HTTP API / SSE' }
        ]
      })
    });
  }

  if (url.includes('/vulnerabilities')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, type: 'SQL Injection', severity: 'HIGH', description: 'Query concatenation', line: 10, secret_snippet: '', file_path: 'db.js' }
      ])
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  });
};

const mockFetch = vi.fn(mockFetchFn);

global.fetch = mockFetch as any;
window.fetch = mockFetch as any;
globalThis.fetch = mockFetch as any;
vi.stubGlobal('fetch', mockFetch);
