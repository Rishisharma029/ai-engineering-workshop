import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { fetchGithubRepository } from '../github.js';

describe('GitHub Ingest Service', () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should fall back to mock repository when invalid or missing URL is supplied', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Not Found' })
    } as any);

    const files = await fetchGithubRepository('https://github.com/invalid/repo');
    expect(files).toBeInstanceOf(Array);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.path === 'package.json')).toBe(true);
  });

  it('should handle malformed URL and return mock codebase list', async () => {
    const files = await fetchGithubRepository('');
    expect(files).toBeInstanceOf(Array);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should successfully fetch, parse, and filter repository files from github api', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init?: any) => {
      // Check auth header if present
      if (url.includes('/repos/owner/repo/git/trees/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tree: [
              { type: 'blob', path: 'src/main.ts', size: 120, url: 'https://api.github.com/blob-url-1' },
              { type: 'blob', path: 'assets/logo.png', size: 500, url: 'https://api.github.com/blob-url-2' }, // should be skipped (png)
              { type: 'tree', path: 'src', url: 'https://api.github.com/tree-url' } // should be skipped (not a blob)
            ]
          })
        } as any);
      }
      
      if (url.includes('/repos/owner/repo')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'develop' })
        } as any);
      }

      if (url.includes('blob-url-1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: Buffer.from('const msg = "hello";', 'utf-8').toString('base64') })
        } as any);
      }

      return Promise.resolve({
        ok: false,
        status: 404
      } as any);
    });

    global.fetch = mockFetch;

    const files = await fetchGithubRepository('https://github.com/owner/repo', 'dummy-token');
    
    // Verify parameters used in fetch
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'token dummy-token'
        })
      })
    );

    expect(files).toBeInstanceOf(Array);
    expect(files.length).toBe(1);
    expect(files[0].path).toBe('src/main.ts');
    expect(files[0].content).toBe('const msg = "hello";');
  });

  it('should fall back to mocks if tree fetch fails', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/repos/owner/repo')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'main' })
        } as any);
      }
      return Promise.resolve({
        ok: false,
        status: 500
      } as any);
    });

    global.fetch = mockFetch;
    const files = await fetchGithubRepository('https://github.com/owner/repo');
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.path === 'package.json')).toBe(true);
  });
});
