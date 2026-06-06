import { Router, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeCodebase } from '../services/analyzer.js';
import { indexFileNode } from '../services/rag.js';
import { fetchGithubRepository } from '../services/github.js';
import { executeAICompletion } from '../services/providers/aiDispatcher.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. POST /upload - Upload ZIP project
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const projectName = req.body.name || req.file.originalname.replace('.zip', '');
  const projectDesc = req.body.description || 'Uploaded zip repository archive';

  try {
    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries();
    
    const files: { path: string; content: string; size: number }[] = [];

    zipEntries.forEach(entry => {
      if (
        entry.isDirectory || 
        entry.entryName.includes('node_modules/') || 
        entry.entryName.includes('.git/') || 
        entry.entryName.includes('dist/') ||
        entry.entryName.includes('build/') ||
        entry.entryName.includes('.next/')
      ) {
        return;
      }

      try {
        const content = entry.getData().toString('utf8');
        files.push({
          path: entry.entryName,
          content,
          size: entry.header.size
        });
      } catch (err) {
        // Skip binaries
      }
    });

    if (files.length === 0) {
      return res.status(400).json({ error: 'No readable text files found in the zip archive' });
    }

    const analysis = analyzeCodebase(files);

    const insertResult = await query(
      `INSERT INTO projects (name, description, type, folder_structure, tech_stack, metrics, executive_summary, insights, heatmap, interview_prep, resume_data, timeline, dependencies_intel, v4_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        projectName,
        projectDesc,
        'ZIP',
        JSON.stringify(analysis.folderStructure),
        JSON.stringify(analysis.techStack),
        JSON.stringify(analysis.metrics),
        analysis.executiveSummary,
        analysis.insights,
        analysis.heatmap,
        analysis.interviewPrep,
        analysis.resumeData,
        analysis.timeline,
        analysis.dependenciesIntel,
        analysis.v4_analysis
      ]
    );

    let projectId: number;
    if (insertResult.insertId) {
      projectId = insertResult.insertId;
    } else {
      const getProj = await query('SELECT id FROM projects WHERE name = $1 ORDER BY created_at DESC LIMIT 1', [projectName]);
      projectId = getProj.rows[0].id;
    }

    // Save File Nodes
    for (const file of files) {
      const extension = file.path.split('.').pop() || '';
      const nodeRes = await query(
        `INSERT INTO file_nodes (project_id, path, name, type, size, content, language)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          projectId,
          file.path,
          file.path.split('/').pop() || '',
          'FILE',
          file.size,
          file.content,
          extension
        ]
      );

      let fileNodeId: number;
      if (nodeRes.insertId) {
        fileNodeId = nodeRes.insertId;
      } else {
        const getFile = await query('SELECT id FROM file_nodes WHERE project_id = $1 AND path = $2', [projectId, file.path]);
        fileNodeId = getFile.rows[0].id;
      }

      // Background indexing for RAG
      indexFileNode(fileNodeId, file.path, file.content).catch(err => {
        console.error(`Error indexing file ${file.path}:`, err);
      });
    }

    res.status(201).json({
      id: projectId,
      name: projectName,
      metrics: analysis.metrics,
      v4_analysis: analysis.v4_analysis ? JSON.parse(analysis.v4_analysis) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /github - Connect GitHub Repo
router.post('/github', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { repoUrl, name, description, token } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: 'GitHub repository URL is required' });
  }

  const projectName = name || repoUrl.split('/').pop()?.replace('.git', '') || 'GitHub Repo';
  const projectDesc = description || `Imported repository: ${repoUrl}`;

  try {
    const files = await fetchGithubRepository(repoUrl, token);
    const analysis = analyzeCodebase(files);

    const insertResult = await query(
      `INSERT INTO projects (name, description, type, repo_url, folder_structure, tech_stack, metrics, executive_summary, insights, heatmap, interview_prep, resume_data, timeline, dependencies_intel, v4_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        projectName,
        projectDesc,
        'GITHUB',
        repoUrl,
        JSON.stringify(analysis.folderStructure),
        JSON.stringify(analysis.techStack),
        JSON.stringify(analysis.metrics),
        analysis.executiveSummary,
        analysis.insights,
        analysis.heatmap,
        analysis.interviewPrep,
        analysis.resumeData,
        analysis.timeline,
        analysis.dependenciesIntel,
        analysis.v4_analysis
      ]
    );

    let projectId: number;
    if (insertResult.insertId) {
      projectId = insertResult.insertId;
    } else {
      const getProj = await query('SELECT id FROM projects WHERE name = $1 ORDER BY created_at DESC LIMIT 1', [projectName]);
      projectId = getProj.rows[0].id;
    }

    res.status(201).json({
      id: projectId,
      name: projectName,
      metrics: analysis.metrics
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /chat - AI Chat response (either streams or returns direct JSON)
router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, messages, provider } = req.body;
  if (!projectId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'projectId and messages array are required' });
  }

  const selectedProvider = provider || 'gemini-2.5-pro';
  const lastMessage = messages[messages.length - 1]?.content || '';

  try {
    const projRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projRes.rows[0];

    const systemPrompt = `You are a professional AI software engineering assistant. Use the following codebase context to answer the user's questions:
    
    Project Name: ${project.name}
    Description: ${project.description}
    Tech Stack: ${project.tech_stack || '[]'}
    Metrics: ${project.metrics || '{}'}
    `;

    const cleanMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const aiRes = await executeAICompletion(selectedProvider, cleanMessages, systemPrompt, { stream: false });

    res.json({ response: aiRes.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to fetch project ID from query params or fetch the most recent project
async function getProjectId(req: AuthenticatedRequest): Promise<number> {
  const queryId = req.query.projectId || req.params.projectId;
  if (queryId) {
    return parseInt(queryId as string, 10);
  }
  const lastProjectRes = await query('SELECT id FROM projects ORDER BY created_at DESC LIMIT 1');
  if (lastProjectRes.rows.length === 0) {
    throw new Error('No projects found. Please upload a project first.');
  }
  return lastProjectRes.rows[0].id;
}

// 4. GET /analysis - Retrieve analysis summary
router.get('/analysis', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = await getProjectId(req);
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : [],
      metrics: project.metrics ? JSON.parse(project.metrics) : null,
      v4_analysis: project.v4_analysis ? JSON.parse(project.v4_analysis) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /analysis/:projectId - Retrieve analysis summary by param
router.get('/analysis/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : [],
      metrics: project.metrics ? JSON.parse(project.metrics) : null,
      v4_analysis: project.v4_analysis ? JSON.parse(project.v4_analysis) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /security - Retrieve security findings
router.get('/security', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = await getProjectId(req);
    const vulnsRes = await query(
      `SELECT v.*, fn.path as file_path 
       FROM vulnerabilities v 
       LEFT JOIN file_nodes fn ON v.file_node_id = fn.id 
       WHERE v.project_id = $1`, 
      [projectId]
    );
    res.json({
      projectId,
      vulnerabilities: vulnsRes.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /security/:projectId - Retrieve security findings by param
router.get('/security/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const vulnsRes = await query(
      `SELECT v.*, fn.path as file_path 
       FROM vulnerabilities v 
       LEFT JOIN file_nodes fn ON v.file_node_id = fn.id 
       WHERE v.project_id = $1`, 
      [projectId]
    );
    res.json({
      projectId,
      vulnerabilities: vulnsRes.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /interview - Retrieve interview prep questions
router.get('/interview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = await getProjectId(req);
    const projectRes = await query('SELECT interview_prep FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];
    const interviewPrep = project.interview_prep ? JSON.parse(project.interview_prep) : [];
    res.json({
      projectId,
      interview_prep: interviewPrep
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /interview/:projectId - Retrieve interview prep by param
router.get('/interview/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const projectRes = await query('SELECT interview_prep FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];
    const interviewPrep = project.interview_prep ? JSON.parse(project.interview_prep) : [];
    res.json({
      projectId,
      interview_prep: interviewPrep
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
