import pg from 'pg';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read configurations
const dbUrl = process.env.DATABASE_URL;
const isPg = !!dbUrl;

let pgPool: pg.Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;

if (isPg) {
  console.log('Database: Using PostgreSQL');
  pgPool = new pg.Pool({ connectionString: dbUrl });
} else {
  console.log('Database: Using local SQLite (fallback mode)');
  const dbPath = path.resolve(__dirname, '../../workspace.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

// Translate PostgreSQL parameters ($1, $2...) to SQLite (?)
function translateSql(sql: string): string {
  if (isPg) return sql;
  // Replace $1, $2 etc with ?
  return sql.replace(/\$\d+/g, '?');
}

export interface QueryResult {
  rows: any[];
  rowCount: number;
  insertId?: number;
}

export async function query(sql: string, params: any[] = []): Promise<QueryResult> {
  const translated = translateSql(sql);

  if (isPg && pgPool) {
    const res = await pgPool.query(translated, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount || 0
    };
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      // Determine if it is a SELECT or modifying query
      const isSelect = sql.trim().toLowerCase().startsWith('select') || sql.trim().toLowerCase().startsWith('pragma');
      
      if (isSelect) {
        sqliteDb!.all(translated, params, (err, rows) => {
          if (err) return reject(err);
          resolve({
            rows: rows || [],
            rowCount: rows ? rows.length : 0
          });
        });
      } else {
        sqliteDb!.run(translated, params, function (err) {
          if (err) return reject(err);
          resolve({
            rows: [],
            rowCount: this.changes,
            insertId: this.lastID
          });
        });
      }
    });
  } else {
    throw new Error('No database connection available');
  }
}

// Auto-run schema creations
export async function initializeDatabase() {
  console.log('Initializing database schema...');
  
  const createUsersTable = isPg
    ? `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'DEVELOPER',
        avatar_url TEXT,
        github_id VARCHAR(100),
        github_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'DEVELOPER',
        avatar_url TEXT,
        github_id TEXT,
        github_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

  const createProjectsTable = isPg
    ? `CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'ZIP',
        repo_url TEXT,
        default_branch VARCHAR(100),
        folder_structure TEXT,
        tech_stack TEXT,
        metrics TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'ZIP',
        repo_url TEXT,
        default_branch TEXT,
        folder_structure TEXT,
        tech_stack TEXT,
        metrics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

  const createFileNodesTable = isPg
    ? `CREATE TABLE IF NOT EXISTS file_nodes (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        path TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        size INTEGER,
        content TEXT,
        language VARCHAR(100),
        hash VARCHAR(64)
      )`
    : `CREATE TABLE IF NOT EXISTS file_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER,
        content TEXT,
        language TEXT,
        hash TEXT
      )`;

  const createFileEmbeddingsTable = isPg
    ? `CREATE TABLE IF NOT EXISTS file_embeddings (
        id SERIAL PRIMARY KEY,
        file_node_id INTEGER NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT NOT NULL
      )`
    : `CREATE TABLE IF NOT EXISTS file_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_node_id INTEGER NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT NOT NULL
      )`;

  const createBugReportsTable = isPg
    ? `CREATE TABLE IF NOT EXISTS bug_reports (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        file_node_id INTEGER,
        type VARCHAR(255),
        severity VARCHAR(50) DEFAULT 'MEDIUM',
        line INTEGER,
        description TEXT NOT NULL,
        code_snippet TEXT,
        suggested_fix TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS bug_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        file_node_id INTEGER,
        type TEXT,
        severity TEXT DEFAULT 'MEDIUM',
        line INTEGER,
        description TEXT NOT NULL,
        code_snippet TEXT,
        suggested_fix TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

  const createVulnerabilitiesTable = isPg
    ? `CREATE TABLE IF NOT EXISTS vulnerabilities (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        file_node_id INTEGER,
        type VARCHAR(255),
        severity VARCHAR(50) DEFAULT 'MEDIUM',
        description TEXT NOT NULL,
        line INTEGER,
        secret_snippet TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS vulnerabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        file_node_id INTEGER,
        type TEXT,
        severity TEXT DEFAULT 'MEDIUM',
        description TEXT NOT NULL,
        line INTEGER,
        secret_snippet TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

  const createDocumentsTable = isPg
    ? `CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

  const createTeamMembersTable = isPg
    ? `CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role VARCHAR(50) DEFAULT 'DEVELOPER'
      )`
    : `CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'DEVELOPER'
      )`;

  try {
    await query(createUsersTable);
    await query(createProjectsTable);
    await query(createFileNodesTable);
    await query(createFileEmbeddingsTable);
    await query(createBugReportsTable);
    await query(createVulnerabilitiesTable);
    await query(createDocumentsTable);
    await query(createTeamMembersTable);

    // Safe Column Migrations check for projects table
    console.log('Database: Checking and running column migrations...');
    const targetCols = [
      'executive_summary',
      'insights',
      'heatmap',
      'interview_prep',
      'resume_data',
      'timeline',
      'dependencies_intel',
      'v4_analysis'
    ];

    if (isPg) {
      const colCheck = await query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'projects'`
      );
      const existing = colCheck.rows.map(r => r.column_name.toLowerCase());
      for (const col of targetCols) {
        if (!existing.includes(col.toLowerCase())) {
          console.log(`Migration: Altering projects table - Adding ${col} column`);
          await query(`ALTER TABLE projects ADD COLUMN ${col} TEXT`);
        }
      }
    } else {
      const colCheck = await query('PRAGMA table_info(projects)');
      const existing = colCheck.rows.map(r => r.name.toLowerCase());
      for (const col of targetCols) {
        if (!existing.includes(col.toLowerCase())) {
          console.log(`Migration: Altering projects table - Adding ${col} column`);
          await query(`ALTER TABLE projects ADD COLUMN ${col} TEXT`);
        }
      }
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
  }
}
