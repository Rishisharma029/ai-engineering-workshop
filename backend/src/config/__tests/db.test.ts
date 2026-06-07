import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';

// Mock pg module globally for this test file
vi.mock('pg', () => {
  const mockQuery = vi.fn().mockImplementation((sql: string) => {
    if (sql.includes('information_schema.columns')) {
      return Promise.resolve({
        rows: [
          { column_name: 'id' },
          { column_name: 'name' },
          { column_name: 'v4_analysis' }
        ],
        rowCount: 3
      });
    }
    return Promise.resolve({
      rows: [{ version: 'PostgreSQL 14' }],
      rowCount: 1
    });
  });
  const mockEnd = vi.fn().mockResolvedValue(undefined);
  return {
    default: {
      Pool: vi.fn().mockImplementation(() => ({
        query: mockQuery,
        end: mockEnd
      }))
    }
  };
});

import { query, closeDatabase, initializeDatabase } from '../db.js';

describe('DB Config & Driver', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should translate PostgreSQL parameter syntax to SQLite', async () => {
    const res = await query('SELECT * FROM users WHERE email = $1 AND role = $2 LIMIT 1', ['rishi.sharma@example.com', 'LEAD']);
    expect(res).toBeDefined();
    expect(res.rows).toBeInstanceOf(Array);
  });

  it('should handle raw SELECT queries and return a row set', async () => {
    const res = await query('PRAGMA table_info(users)');
    expect(res.rows.length).toBeGreaterThan(0);
    expect(res.rows[0].name).toBeDefined();
  });
});

describe('DB Config PostgreSQL Mode', () => {
  it('should use PG pool when DATABASE_URL is defined', async () => {
    // Save original env
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';

    vi.resetModules();
    const { query: pgQuery, initializeDatabase: pgInit, closeDatabase: pgClose } = await import('../db.js');

    // Run initialization in PG mode
    await pgInit();

    // Query check
    const res = await pgQuery('SELECT version()');
    expect(res.rows[0].version).toBe('PostgreSQL 14');

    await pgClose();

    // Restore env and clean up
    process.env.DATABASE_URL = originalUrl;
    vi.resetModules();
  });
});
