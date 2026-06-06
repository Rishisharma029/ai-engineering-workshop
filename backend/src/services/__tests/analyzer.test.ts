import { describe, it, expect } from 'vitest';
import { getLanguageByExtension, analyzeCodebase } from '../analyzer.js';

describe('Analyzer Language Mapping', () => {
  it('should map extensions to correct language names', () => {
    expect(getLanguageByExtension('server.js')).toBe('JavaScript');
    expect(getLanguageByExtension('App.tsx')).toBe('React TypeScript');
    expect(getLanguageByExtension('main.py')).toBe('Python');
    expect(getLanguageByExtension('main.rs')).toBe('Rust');
    expect(getLanguageByExtension('README.md')).toBe('Markdown');
    expect(getLanguageByExtension('image.png')).toBeNull();
  });
});

describe('Analyzer Codebase Scanner', () => {
  it('should parse project dependencies and detect framework components', () => {
    const mockFiles = [
      {
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            "react": "^19.0.0",
            "express": "^4.19.2",
            "typescript": "^5.4.3"
          }
        }),
        size: 200
      },
      {
        path: 'src/server.ts',
        content: `
          import express from 'express';
          const app = express();
          app.get('/api/users', (req, res) => {
            res.json([]);
          });
        `,
        size: 300
      }
    ];

    const result = analyzeCodebase(mockFiles);
    expect(result.techStack).toContain('React');
    expect(result.techStack).toContain('Express.js');
    expect(result.languages).toContain('TypeScript');
  });

  it('should flag hardcoded credentials as critical vulnerabilities', () => {
    const mockFiles = [
      {
        path: 'src/config.js',
        content: `
          const aws_access_key_id = "AKIAIOSFODNN7EXAMPLE";
          const stripe_key = 'sk_test_51Cs2f42sDfsdFSEwF123';
        `,
        size: 150
      }
    ];

    const result = analyzeCodebase(mockFiles);
    expect(result.vulnerabilities.length).toBeGreaterThan(0);
    const secretVuln = result.vulnerabilities.find(v => v.type === 'Hardcoded Secret / Token');
    expect(secretVuln).toBeDefined();
    expect(secretVuln?.severity).toBe('CRITICAL');
  });

  it('should identify SQL injection risks', () => {
    const mockFiles = [
      {
        path: 'src/db.js',
        content: `
          const query = "SELECT * FROM users WHERE name = '" + userName + "'";
          db.execute(query);
        `,
        size: 100
      }
    ];

    const result = analyzeCodebase(mockFiles);
    const sqlVuln = result.vulnerabilities.find(v => v.type === 'SQL Injection Risk');
    expect(sqlVuln).toBeDefined();
    expect(sqlVuln?.severity).toBe('HIGH');
  });

  it('should capture XSS threats', () => {
    const mockFiles = [
      {
        path: 'src/View.tsx',
        content: `
          return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
        `,
        size: 120
      }
    ];

    const result = analyzeCodebase(mockFiles);
    const xssVuln = result.vulnerabilities.find(v => v.type === 'Cross-Site Scripting (XSS)');
    expect(xssVuln).toBeDefined();
    expect(xssVuln?.severity).toBe('HIGH');
  });

  it('should identify code bugs such as empty catches and console log debuggers', () => {
    const mockFiles = [
      {
        path: 'src/helper.ts',
        content: `
          try {
            doWork();
          } catch (e) { }
          
          if (x === 1) { }
          
          console.log("Debugging helpers");
        `,
        size: 150
      }
    ];

    const result = analyzeCodebase(mockFiles);
    const catchBug = result.bugs.find(b => b.type === 'Empty Catch Block');
    const logBug = result.bugs.find(b => b.type === 'Leftover Debug Logger');
    const ifBug = result.bugs.find(b => b.type === 'Empty Conditional Statement');

    expect(catchBug).toBeDefined();
    expect(logBug).toBeDefined();
    expect(ifBug).toBeDefined();
  });

  it('should flag overly large files as bugs', () => {
    // Generate code file with more than 300 lines
    const largeContent = Array(350).fill('const x = 1;').join('\n');
    const mockFiles = [
      {
        path: 'src/large.js',
        content: largeContent,
        size: 5000
      }
    ];

    const result = analyzeCodebase(mockFiles);
    const largeBug = result.bugs.find(b => b.type === 'Overly Large File');
    expect(largeBug).toBeDefined();
    expect(largeBug?.severity).toBe('MEDIUM');
  });

  it('should compute appropriate scores based on defects', () => {
    const cleanFiles = [
      {
        path: 'README.md',
        content: '# Cool Workspace\nThis is a readme file documentation.',
        size: 100
      },
      {
        path: 'src/index.js',
        content: '// This is index\nconst a = 1;',
        size: 50
      }
    ];

    const result = analyzeCodebase(cleanFiles);
    expect(result.metrics.overall).toBeGreaterThanOrEqual(50);
    expect(result.metrics.security).toBe(100);
  });

  it('should generate JSON summaries and mock lists', () => {
    const mockFiles = [
      { path: 'README.md', content: 'docs', size: 10 },
      { path: 'src/main.ts', content: 'app', size: 10 }
    ];
    const result = analyzeCodebase(mockFiles);
    
    expect(JSON.parse(result.executiveSummary)).toBeDefined();
    expect(JSON.parse(result.insights)).toBeDefined();
    expect(JSON.parse(result.heatmap)).toBeDefined();
    expect(JSON.parse(result.interviewPrep)).toBeDefined();
    expect(JSON.parse(result.resumeData)).toBeDefined();
    expect(JSON.parse(result.timeline)).toBeDefined();
    expect(JSON.parse(result.dependenciesIntel)).toBeDefined();
    expect(JSON.parse(result.v4_analysis!)).toBeDefined();
  });
});
