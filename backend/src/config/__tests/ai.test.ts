import { describe, it, expect, vi, afterEach } from 'vitest';
import { isMockMode, generateEmbedding, chatCompletion, chatCompletionStream } from '../ai.js';
import { Readable } from 'stream';

describe('AI Config & Helpers', () => {
  it('should run in mock mode by default when API key is missing', () => {
    expect(isMockMode()).toBe(true);
  });

  it('should generate a 1536-dimensional mock embedding vector', async () => {
    const vector = await generateEmbedding('hello world');
    expect(vector).toBeInstanceOf(Array);
    expect(vector.length).toBe(1536);
  });

  it('should generate simulated chat completion responses', async () => {
    const response = await chatCompletion('system test message', 'readme info query');
    expect(response).toContain('# Generated Documentation');

    const basicResponse = await chatCompletion('system', 'generic prompt');
    expect(basicResponse).toContain('simulated AI response');
  });

  it('should stream mock chat responses as Readable stream', async () => {
    const stream = await chatCompletionStream([{ role: 'user', content: 'bug' }]);
    expect(stream).toBeInstanceOf(Readable);
    stream.destroy();
  });
});

describe('AI Config Real Mode Integration', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should run in real mode when API key is present and handle happy paths', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'sk-test-key-12345';
    
    vi.resetModules();
    const { isMockMode: realIsMockMode, generateEmbedding: realGenerateEmbedding, chatCompletion: realChatCompletion, chatCompletionStream: realChatCompletionStream } = await import('../ai.js');
    
    expect(realIsMockMode()).toBe(false);

    // Mock fetch for generateEmbedding
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/embeddings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ embedding: [0.5, -0.5] }] })
        });
      }
      if (url.includes('/chat/completions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: 'real response content' } }] })
        });
      }
      return Promise.resolve({ ok: false });
    });
    global.fetch = mockFetch as any;

    // Test generateEmbedding happy path
    const vector = await realGenerateEmbedding('test');
    expect(vector).toEqual([0.5, -0.5]);

    // Test chatCompletion happy path
    const text = await realChatCompletion('system context', 'prompt message');
    expect(text).toBe('real response content');

    // Restore keys and cache
    process.env.OPENAI_API_KEY = originalKey;
    vi.resetModules();
  });

  it('should handle API failure fallbacks in real mode', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'sk-test-key-12345';
    
    vi.resetModules();
    const { generateEmbedding: realGenerateEmbedding, chatCompletion: realChatCompletion, chatCompletionStream: realChatCompletionStream } = await import('../ai.js');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Rate Limit Exceeded'
    });
    global.fetch = mockFetch as any;

    // Test generateEmbedding failure path
    const vector = await realGenerateEmbedding('test');
    expect(vector.length).toBe(1536);

    // Test chatCompletion failure path
    const text = await realChatCompletion('system', 'prompt');
    expect(text).toBe('Error generating response from OpenAI API.');

    // Test chatCompletionStream failure path
    const stream = await realChatCompletionStream([{ role: 'user', content: 'test' }]);
    expect(stream).toBeInstanceOf(Readable);
    stream.destroy();

    process.env.OPENAI_API_KEY = originalKey;
    vi.resetModules();
  });

  it('should stream real chat completions when API call succeeds', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'sk-test-key-12345';
    
    vi.resetModules();
    const { chatCompletionStream: realChatCompletionStream } = await import('../ai.js');

    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices": [{"delta": {"content": "streaming text"}}]}') })
        .mockResolvedValueOnce({ done: true })
    };
    const mockWebStream = {
      getReader: () => mockReader
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockWebStream
    });
    global.fetch = mockFetch as any;

    const stream = await realChatCompletionStream([{ role: 'user', content: 'hello' }]);
    expect(stream).toBeInstanceOf(Readable);
    
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk.toString());
    }
    expect(chunks.join('')).toContain('streaming text');

    process.env.OPENAI_API_KEY = originalKey;
    vi.resetModules();
  });
});
