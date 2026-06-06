import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Retrieve full project summary
router.get('/:projectId/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projectRes.rows[0];

    // Count bugs
    const bugsCountRes = await query(
      'SELECT severity, COUNT(*) as count FROM bug_reports WHERE project_id = $1 GROUP BY severity',
      [projectId]
    );

    // Count security findings
    const vulnCountRes = await query(
      'SELECT severity, COUNT(*) as count FROM vulnerabilities WHERE project_id = $1 GROUP BY severity',
      [projectId]
    );

    const counts = {
      bugs: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      vulns: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    };

    bugsCountRes.rows.forEach(r => {
      const sev = r.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      if (counts.bugs[sev] !== undefined) {
        counts.bugs[sev] = parseInt(r.count, 10) || 0;
      }
    });

    vulnCountRes.rows.forEach(r => {
      const sev = r.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      if (counts.vulns[sev] !== undefined) {
        counts.vulns[sev] = parseInt(r.count, 10) || 0;
      }
    });

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      repo_url: project.repo_url,
      tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : [],
      metrics: project.metrics ? JSON.parse(project.metrics) : null,
      summaryCounts: counts,
      updated_at: project.updated_at
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve bugs for a project
router.get('/:projectId/bugs', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const bugsRes = await query(
      `SELECT br.*, fn.path as file_path 
       FROM bug_reports br 
       LEFT JOIN file_nodes fn ON br.file_node_id = fn.id 
       WHERE br.project_id = $1 
       ORDER BY CASE br.severity 
         WHEN 'CRITICAL' THEN 1 
         WHEN 'HIGH' THEN 2 
         WHEN 'MEDIUM' THEN 3 
         WHEN 'LOW' THEN 4 
       END`,
      [projectId]
    );
    res.json(bugsRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve vulnerabilities for a project
router.get('/:projectId/vulnerabilities', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;
  try {
    const vulnsRes = await query(
      `SELECT v.*, fn.path as file_path 
       FROM vulnerabilities v 
       LEFT JOIN file_nodes fn ON v.file_node_id = fn.id 
       WHERE v.project_id = $1 
       ORDER BY CASE v.severity 
         WHEN 'CRITICAL' THEN 1 
         WHEN 'HIGH' THEN 2 
         WHEN 'MEDIUM' THEN 3 
         WHEN 'LOW' THEN 4 
       END`,
      [projectId]
    );
    res.json(vulnsRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
