import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import AdmZip from 'adm-zip';
import { app } from '../../server.js';
import { query } from '../../config/db.js';

// Mock the GitHub fetching service to prevent external API calls during testing
vi.mock('../../services/github.js', () => {
  return {
    fetchGithubRepository: vi.fn().mockResolvedValue([
      { path: 'index.js', content: 'console.log("imported github code");', size: 35 },
      { path: 'package.json', content: '{"dependencies":{}}', size: 20 }
    ])
  };
});

describe('Root Level API Alias Routes Integration', () => {
  let projectId: number;

  beforeAll(async () => {
    // Ensure table structure exists (server.ts runs initializeDatabase at start)
    // Clean up any test projects
    await query("DELETE FROM projects WHERE name = 'Test-Zip-Project'");
  });

  it('1. should upload a ZIP file, execute static analysis, and return project payload', async () => {
    // Dynamically create a small zip file in memory containing mock code files
    const zip = new AdmZip();
    zip.addFile('index.js', Buffer.from('const x = 1;\ntry { eval("x"); } catch(e) {}', 'utf8'));
    zip.addFile('auth.js', Buffer.from('const stripe_key = "sk_test_51Ckey";\n', 'utf8'));
    zip.addFile('package.json', Buffer.from('{"dependencies": {"react": "^19.0.0"}}', 'utf8'));
    zip.addFile('README.md', Buffer.from('# Test Zip Project\nThis is a readme', 'utf8'));
    
    const zipBuffer = zip.toBuffer();

    const response = await request(app)
      .post('/upload')
      .attach('file', zipBuffer, 'Test-Zip-Project.zip')
      .field('name', 'Test-Zip-Project')
      .field('description', 'Test zip description');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'Test-Zip-Project');
    expect(response.body).toHaveProperty('metrics');
    
    projectId = response.body.id;
  });

  it('2. should connect to a GitHub repo URL and parse codebase using mock fetcher', async () => {
    const response = await request(app)
      .post('/github')
      .send({
        repoUrl: 'https://github.com/rishi-sharma/test-repo',
        name: 'GitHub-Test-Project',
        description: 'Imported from Git'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('metrics');
  });

  it('3. should execute a non-streaming chat with the AI assistant about the project', async () => {
    const response = await request(app)
      .post('/chat')
      .send({
        projectId,
        messages: [
          { role: 'user', content: 'What libraries are used in this project?' }
        ],
        provider: 'gemini-2.5-flash'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(typeof response.body.response).toBe('string');
  });

  it('4. should retrieve the project analysis summary', async () => {
    const responseQuery = await request(app)
      .get('/analysis')
      .query({ projectId });

    expect(responseQuery.status).toBe(200);
    expect(responseQuery.body).toHaveProperty('id', projectId);
    expect(responseQuery.body).toHaveProperty('name', 'Test-Zip-Project');
    expect(responseQuery.body).toHaveProperty('metrics');
    
    const responseParam = await request(app)
      .get(`/analysis/${projectId}`);
    expect(responseParam.status).toBe(200);
    expect(responseParam.body.id).toBe(projectId);
  });

  it('5. should fetch security audit vulnerabilities log', async () => {
    const responseQuery = await request(app)
      .get('/security')
      .query({ projectId });

    expect(responseQuery.status).toBe(200);
    expect(responseQuery.body).toHaveProperty('vulnerabilities');
    expect(Array.isArray(responseQuery.body.vulnerabilities)).toBe(true);

    const responseParam = await request(app)
      .get(`/security/${projectId}`);
    expect(responseParam.status).toBe(200);
    expect(Array.isArray(responseParam.body.vulnerabilities)).toBe(true);
  });

  it('6. should retrieve viva / interview readiness Q&A', async () => {
    const responseQuery = await request(app)
      .get('/interview')
      .query({ projectId });

    expect(responseQuery.status).toBe(200);
    expect(responseQuery.body).toHaveProperty('interview_prep');
    expect(Array.isArray(responseQuery.body.interview_prep)).toBe(true);

    const responseParam = await request(app)
      .get(`/interview/${projectId}`);
    expect(responseParam.status).toBe(200);
    expect(Array.isArray(responseParam.body.interview_prep)).toBe(true);
  });
});
