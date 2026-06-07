import { query } from '../config/db.js';
import { generateEmbedding } from '../config/ai.js';

export interface Chunk {
  fileNodeId: number;
  filePath: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

// Simple chunker that splits file content into segments of approx 1000 characters
export function chunkFileContent(content: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
  if (!content) return [];
  const chunks: string[] = [];
  let index = 0;

  while (index < content.length) {
    let end = index + maxChunkSize;
    if (end > content.length) {
      end = content.length;
    } else {
      // Find a clean newline or space separator to split on, searching from index
      const searchStart = Math.max(index, end - 50);
      const nextSpace = content.indexOf('\n', searchStart);
      if (nextSpace !== -1 && nextSpace < end + 50 && nextSpace > index) {
        end = nextSpace + 1;
      }
    }
    chunks.push(content.substring(index, end).trim());
    
    // Shift index forward by chunk size minus overlap
    if (end === content.length) {
      break;
    }
    const nextIndex = end - overlap;
    if (nextIndex <= index) {
      index = end; // Force advance if overlap would cause infinite loop or regression
    } else {
      index = nextIndex;
    }
  }

  return chunks.filter(c => c.length > 10);
}

// Compute cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Process and Index a project file
export async function indexFileNode(fileNodeId: number, filePath: string, content: string): Promise<void> {
  const chunks = chunkFileContent(content);
  if (chunks.length === 0) return;

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const vector = await generateEmbedding(chunkText);
    const vectorJson = JSON.stringify(vector);

    // Save in database
    await query(
      `INSERT INTO file_embeddings (file_node_id, chunk_index, content, embedding)
       VALUES ($1, $2, $3, $4)`,
      [fileNodeId, i, chunkText, vectorJson]
    );
  }
}

export interface SearchResult {
  filePath: string;
  content: string;
  similarity: number;
}

// Query the RAG index
export async function searchSimilarChunks(projectId: number, queryText: string, limit: number = 5): Promise<SearchResult[]> {
  const queryVector = await generateEmbedding(queryText);

  // Retrieve all chunks associated with this project
  const dbResult = await query(
    `SELECT fe.content, fe.embedding, fn.path as file_path
     FROM file_embeddings fe
     JOIN file_nodes fn ON fe.file_node_id = fn.id
     WHERE fn.project_id = $1`,
    [projectId]
  );

  const results: SearchResult[] = [];

  for (const row of dbResult.rows) {
    try {
      const chunkVector: number[] = JSON.parse(row.embedding);
      const similarity = cosineSimilarity(queryVector, chunkVector);
      
      results.push({
        filePath: row.file_path,
        content: row.content,
        similarity
      });
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, limit);
}
