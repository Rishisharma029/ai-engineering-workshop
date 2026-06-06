import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;

  try {
    const projRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projRes.rows[0];
    const techStack = project.tech_stack ? JSON.parse(project.tech_stack) : [];
    const mainTech = techStack.slice(0, 3).join(', ');

    const filesCountRes = await query('SELECT COUNT(*) as count FROM file_nodes WHERE project_id = $1', [projectId]);
    const fileCount = filesCountRes.rows[0]?.count || 5;

    // Generate accomplishments
    const points = [
      `Engineered a high-performance codebase architecture using ${mainTech || 'React, Express'}, structuring over ${fileCount} key modules for scalability, maintainability, and clean code principles.`,
      `Integrated dynamic RAG (Retrieval-Augmented Generation) search pipelines on vector stores, lowering code comprehension bottlenecks by providing contextual AI-driven answers within codebases.`,
      `Authored static code validation scripts detecting unused modules, complex nested logic, and potential credential leak vulnerabilities across all core development files.`,
      `Constructed interactive graph visualization interfaces mapping data flows between client components and backend routers to accelerate developer onboarding and documentation times.`,
      `Configured a robust PostgreSQL schema supporting dynamic data fallbacks to SQLite files, assuring seamless local zero-config testing pipelines and immediate developer workspace spins.`
    ];

    res.json({ points });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
