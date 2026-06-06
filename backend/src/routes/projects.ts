import { Router, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeCodebase } from '../services/analyzer.js';
import { indexFileNode } from '../services/rag.js';
import { fetchGithubRepository } from '../services/github.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Retrieve all projects
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectsRes = await query('SELECT * FROM projects ORDER BY created_at DESC');
    
    // Parse json columns
    const projects = projectsRes.rows.map(p => ({
      ...p,
      folder_structure: p.folder_structure ? JSON.parse(p.folder_structure) : null,
      tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : [],
      metrics: p.metrics ? JSON.parse(p.metrics) : null,
      executive_summary: p.executive_summary ? JSON.parse(p.executive_summary) : null,
      insights: p.insights ? JSON.parse(p.insights) : null,
      heatmap: p.heatmap ? JSON.parse(p.heatmap) : null,
      interview_prep: p.interview_prep ? JSON.parse(p.interview_prep) : null,
      resume_data: p.resume_data ? JSON.parse(p.resume_data) : null,
      timeline: p.timeline ? JSON.parse(p.timeline) : null,
      dependencies_intel: p.dependencies_intel ? JSON.parse(p.dependencies_intel) : null,
      v4_analysis: p.v4_analysis ? JSON.parse(p.v4_analysis) : null
    }));

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single project's details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];
    res.json({
      ...project,
      folder_structure: project.folder_structure ? JSON.parse(project.folder_structure) : null,
      tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : [],
      metrics: project.metrics ? JSON.parse(project.metrics) : null,
      executive_summary: project.executive_summary ? JSON.parse(project.executive_summary) : null,
      insights: project.insights ? JSON.parse(project.insights) : null,
      heatmap: project.heatmap ? JSON.parse(project.heatmap) : null,
      interview_prep: project.interview_prep ? JSON.parse(project.interview_prep) : null,
      resume_data: project.resume_data ? JSON.parse(project.resume_data) : null,
      timeline: project.timeline ? JSON.parse(project.timeline) : null,
      dependencies_intel: project.dependencies_intel ? JSON.parse(project.dependencies_intel) : null,
      v4_analysis: project.v4_analysis ? JSON.parse(project.v4_analysis) : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload ZIP Project
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
      // Skip directories and common ignored paths (node_modules, git, dist, build)
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

    // Run analyzer
    const analysis = analyzeCodebase(files);

    // Save project
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

    // Get the newly inserted project ID
    let projectId: number;
    if (insertResult.insertId) {
      projectId = insertResult.insertId;
    } else {
      const getProj = await query('SELECT id FROM projects WHERE name = $1 ORDER BY created_at DESC LIMIT 1', [projectName]);
      projectId = getProj.rows[0].id;
    }

    // Save File Nodes & index vectors in background
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

      // Background Indexing for RAG (non-blocking)
      indexFileNode(fileNodeId, file.path, file.content).catch(err => {
        console.error(`Error indexing file ${file.path}:`, err);
      });
    }

    // Save Bugs & Vulnerabilities
    for (const bug of analysis.bugs) {
      const fnRes = await query('SELECT id FROM file_nodes WHERE project_id = $1 AND path = $2', [projectId, bug.filePath]);
      const fileNodeId = fnRes.rows[0]?.id || null;

      await query(
        `INSERT INTO bug_reports (project_id, file_node_id, type, severity, line, description, code_snippet, suggested_fix)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [projectId, fileNodeId, bug.type, bug.severity, bug.line, bug.description, bug.codeSnippet, bug.suggestedFix]
      );
    }

    for (const vuln of analysis.vulnerabilities) {
      const fnRes = await query('SELECT id FROM file_nodes WHERE project_id = $1 AND path = $2', [projectId, vuln.filePath]);
      const fileNodeId = fnRes.rows[0]?.id || null;

      await query(
        `INSERT INTO vulnerabilities (project_id, file_node_id, type, severity, description, line, secret_snippet)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [projectId, fileNodeId, vuln.type, vuln.severity, vuln.description, vuln.line, vuln.secretSnippet]
      );
    }

    res.status(201).json({
      id: projectId,
      name: projectName,
      description: projectDesc,
      type: 'ZIP',
      folder_structure: analysis.folderStructure,
      tech_stack: analysis.techStack,
      metrics: analysis.metrics,
      executive_summary: analysis.executiveSummary ? JSON.parse(analysis.executiveSummary) : null,
      insights: analysis.insights ? JSON.parse(analysis.insights) : null,
      heatmap: analysis.heatmap ? JSON.parse(analysis.heatmap) : null,
      interview_prep: analysis.interviewPrep ? JSON.parse(analysis.interviewPrep) : null,
      resume_data: analysis.resumeData ? JSON.parse(analysis.resumeData) : null,
      timeline: analysis.timeline ? JSON.parse(analysis.timeline) : null,
      dependencies_intel: analysis.dependenciesIntel ? JSON.parse(analysis.dependenciesIntel) : null,
      v4_analysis: analysis.v4_analysis ? JSON.parse(analysis.v4_analysis) : null
    });
  } catch (error: any) {
    console.error('ZIP Process error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import GitHub Repository
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

      // Background Indexing for RAG
      indexFileNode(fileNodeId, file.path, file.content).catch(err => {
        console.error(`Error indexing Github file ${file.path}:`, err);
      });
    }

    // Save Bugs & Vulnerabilities
    for (const bug of analysis.bugs) {
      const fnRes = await query('SELECT id FROM file_nodes WHERE project_id = $1 AND path = $2', [projectId, bug.filePath]);
      const fileNodeId = fnRes.rows[0]?.id || null;

      await query(
        `INSERT INTO bug_reports (project_id, file_node_id, type, severity, line, description, code_snippet, suggested_fix)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [projectId, fileNodeId, bug.type, bug.severity, bug.line, bug.description, bug.codeSnippet, bug.suggestedFix]
      );
    }

    for (const vuln of analysis.vulnerabilities) {
      const fnRes = await query('SELECT id FROM file_nodes WHERE project_id = $1 AND path = $2', [projectId, vuln.filePath]);
      const fileNodeId = fnRes.rows[0]?.id || null;

      await query(
        `INSERT INTO vulnerabilities (project_id, file_node_id, type, severity, description, line, secret_snippet)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [projectId, fileNodeId, vuln.type, vuln.severity, vuln.description, vuln.line, vuln.secretSnippet]
      );
    }

    res.status(201).json({
      id: projectId,
      name: projectName,
      description: projectDesc,
      type: 'GITHUB',
      repo_url: repoUrl,
      folder_structure: analysis.folderStructure,
      tech_stack: analysis.techStack,
      metrics: analysis.metrics,
      executive_summary: analysis.executiveSummary ? JSON.parse(analysis.executiveSummary) : null,
      insights: analysis.insights ? JSON.parse(analysis.insights) : null,
      heatmap: analysis.heatmap ? JSON.parse(analysis.heatmap) : null,
      interview_prep: analysis.interviewPrep ? JSON.parse(analysis.interviewPrep) : null,
      resume_data: analysis.resumeData ? JSON.parse(analysis.resumeData) : null,
      timeline: analysis.timeline ? JSON.parse(analysis.timeline) : null,
      dependencies_intel: analysis.dependenciesIntel ? JSON.parse(analysis.dependenciesIntel) : null,
      v4_analysis: analysis.v4_analysis ? JSON.parse(analysis.v4_analysis) : null
    });
  } catch (error: any) {
    console.error('Github Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a project
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    // Get file node ids to clean up embeddings
    const filesRes = await query('SELECT id FROM file_nodes WHERE project_id = $1', [projectId]);
    const fileIds = filesRes.rows.map(f => f.id);

    if (fileIds.length > 0) {
      const placeholders = fileIds.map((_, i) => `$${i + 1}`).join(',');
      await query(`DELETE FROM file_embeddings WHERE file_node_id IN (${placeholders})`, fileIds);
    }

    await query('DELETE FROM file_nodes WHERE project_id = $1', [projectId]);
    await query('DELETE FROM bug_reports WHERE project_id = $1', [projectId]);
    await query('DELETE FROM vulnerabilities WHERE project_id = $1', [projectId]);
    await query('DELETE FROM documents WHERE project_id = $1', [projectId]);
    await query('DELETE FROM projects WHERE id = $1', [projectId]);

    res.json({ success: true, message: 'Project and all associated artifacts deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve specific file contents
router.get('/:projectId/files/content', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { path } = req.query;
  const projectId = req.params.projectId;
  if (!path) return res.status(400).json({ error: 'File path is required' });

  try {
    const fileRes = await query('SELECT content FROM file_nodes WHERE project_id = $1 AND path = $2', [projectId, path]);
    if (fileRes.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ content: fileRes.rows[0].content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
