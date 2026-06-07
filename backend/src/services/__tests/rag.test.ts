import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { chunkFileContent, cosineSimilarity, indexFileNode, searchSimilarChunks } from '../rag.js';
import { query, closeDatabase, initializeDatabase } from '../../config/db.js';

describe('RAG Service', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should chunk content properly', () => {
    const text = 'Line one text content.\nLine two text content.\nLine three text content.\nLine four text content.\nLine five.';
    const chunks = chunkFileContent(text, 30, 5);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toBeDefined();
  });

  it('should compute cosine similarity', () => {
    const vecA = [1, 0, 1];
    const vecB = [1, 0, 1];
    const vecC = [0, 1, 0];

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
    expect(cosineSimilarity(vecA, [1, 0])).toBe(0); // Diff length
  });

  it('should index file nodes and retrieve similar chunks', async () => {
    // Insert mock project
    const projResult = await query("INSERT INTO projects (name, description) VALUES ('RAG Test Project', 'Testing RAG')");
    const projectId = projResult.insertId!;

    // Insert mock file node
    const nodeResult = await query(
      "INSERT INTO file_nodes (project_id, path, name, type, size, content) VALUES ($1, 'src/test.txt', 'test.txt', 'file', 100, 'Important developer guidelines content.')",
      [projectId]
    );
    const fileNodeId = nodeResult.insertId!;

    // Run indexing
    await indexFileNode(fileNodeId, 'src/test.txt', 'Important developer guidelines content.');

    // Search
    const searchResults = await searchSimilarChunks(projectId, 'developer guidelines');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].filePath).toBe('src/test.txt');
    expect(searchResults[0].content).toContain('developer guidelines');
  });
});
