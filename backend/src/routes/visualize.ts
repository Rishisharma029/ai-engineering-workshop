import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { getLanguageByExtension } from '../services/analyzer.js';

const router = Router();

router.get('/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;

  try {
    // Check if project exists
    const projRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Retrieve file list to compute node connections dynamically
    const filesRes = await query(
      'SELECT id, path, name, size FROM file_nodes WHERE project_id = $1',
      [projectId]
    );

    const files = filesRes.rows;

    const nodes: any[] = [
      { id: 'client-ui', label: 'Client UI (Entry)', type: 'frontend', details: 'Web browser SPA' }
    ];
    const edges: any[] = [];

    const feComponents: string[] = [];
    const apiRoutes: string[] = [];
    const models: string[] = [];
    const services: string[] = [];

    files.forEach(f => {
      const pathLower = f.path.toLowerCase();
      if (pathLower.includes('components/') || pathLower.includes('pages/') || pathLower.includes('views/')) {
        feComponents.push(f.name);
      } else if (pathLower.includes('routes/') || pathLower.includes('controllers/') || pathLower.includes('api/')) {
        apiRoutes.push(f.name);
      } else if (pathLower.includes('models/') || pathLower.includes('schemas/') || pathLower.includes('db/')) {
        models.push(f.name);
      } else if (pathLower.includes('services/') || pathLower.includes('utils/')) {
        services.push(f.name);
      }
    });

    // Node: Frontend Views
    if (feComponents.length > 0) {
      nodes.push({
        id: 'fe-views',
        label: 'React Components',
        type: 'frontend',
        details: `${feComponents.slice(0, 3).join(', ')}${feComponents.length > 3 ? '...' : ''}`
      });
      edges.push({ from: 'client-ui', to: 'fe-views', label: 'Renders' });
    }

    // Node: Backend Gateway Router
    nodes.push({
      id: 'be-server',
      label: 'Express Gateway',
      type: 'backend',
      details: 'server.ts API Listener'
    });
    edges.push({ from: 'client-ui', to: 'be-server', label: 'Fetch / HTTP' });

    // Node: Routes Controllers
    if (apiRoutes.length > 0) {
      nodes.push({
        id: 'be-controllers',
        label: 'API Controllers',
        type: 'router',
        details: apiRoutes.slice(0, 3).join(', ')
      });
      edges.push({ from: 'be-server', to: 'be-controllers' });
    }

    // Node: Services / Middleware
    if (services.length > 0) {
      nodes.push({
        id: 'be-services',
        label: 'Services Layer',
        type: 'service',
        details: services.slice(0, 2).join(', ')
      });
      if (apiRoutes.length > 0) {
        edges.push({ from: 'be-controllers', to: 'be-services' });
      } else {
        edges.push({ from: 'be-server', to: 'be-services' });
      }
    }

    // Node: DB Schema Connection
    if (models.length > 0) {
      nodes.push({
        id: 'db-models',
        label: 'SQL Data Models',
        type: 'database',
        details: models.slice(0, 3).join(', ')
      });
      if (services.length > 0) {
        edges.push({ from: 'be-services', to: 'db-models' });
      } else {
        edges.push({ from: 'be-server', to: 'db-models' });
      }
    } else {
      nodes.push({
        id: 'db-sql',
        label: 'Database Schema',
        type: 'database',
        details: 'SQLite / PostgreSQL persistence'
      });
      edges.push({ from: 'be-server', to: 'db-sql', label: 'Queries' });
    }

    res.json({ nodes, edges });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
