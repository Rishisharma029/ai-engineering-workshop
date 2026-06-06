import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/:projectId/search-everywhere', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const projectId = req.params.projectId;
  const q = (req.query.q as string || '').trim().toLowerCase();

  if (!q) {
    return res.json({
      files: [],
      functions: [],
      endpoints: [],
      components: [],
      vulnerabilities: [],
      dependencies: [],
      questions: [],
      resume: [],
      nodes: []
    });
  }

  try {
    // 1. Fetch file nodes
    const filesRes = await query(
      'SELECT id, path, name, content, language FROM file_nodes WHERE project_id = $1',
      [projectId]
    );

    // 2. Fetch vulnerabilities
    const vulnsRes = await query(
      `SELECT v.id, v.type, v.severity, v.description, v.line, fn.path as file_path 
       FROM vulnerabilities v 
       LEFT JOIN file_nodes fn ON v.file_node_id = fn.id 
       WHERE v.project_id = $1`,
      [projectId]
    );

    // 3. Fetch project details for metadata fields
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    const project = projectRes.rows[0] || {};
    
    // Parse V4 fields
    const v4Data = project.v4_analysis ? JSON.parse(project.v4_analysis) : null;
    const depsIntel = project.dependencies_intel ? JSON.parse(project.dependencies_intel) : [];
    const interviewQuestions = v4Data?.interviewQuestions || [];
    const resumeDetails = v4Data?.resumeData || {};

    const files: any[] = [];
    const functions: any[] = [];
    const endpoints: any[] = [];
    const components: any[] = [];
    const vulnerabilities: any[] = [];
    const dependencies: any[] = [];
    const questions: any[] = [];
    const resume: any[] = [];
    const nodes: any[] = [];

    // Filter vulnerabilities
    for (const v of vulnsRes.rows) {
      if (
        v.type.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        (v.file_path && v.file_path.toLowerCase().includes(q))
      ) {
        vulnerabilities.push({
          id: v.id,
          name: v.type,
          description: v.description,
          severity: v.severity,
          line: v.line,
          path: v.file_path || 'Global',
          type: 'vulnerability'
        });
      }
    }

    // Filter dependencies
    for (const dep of depsIntel) {
      if (dep.name.toLowerCase().includes(q) || (dep.recommendation && dep.recommendation.toLowerCase().includes(q))) {
        dependencies.push({
          name: dep.name,
          status: dep.status,
          version: dep.version,
          recommendation: dep.recommendation,
          type: 'dependency'
        });
      }
    }

    // Filter interview questions
    for (const qst of interviewQuestions) {
      if (qst.question.toLowerCase().includes(q) || qst.expected.toLowerCase().includes(q)) {
        questions.push({
          category: qst.category,
          question: qst.question,
          expected: qst.expected,
          type: 'question'
        });
      }
    }

    // Filter resume items
    const talkingPoints = resumeDetails.talkingPoints || [];
    for (const tp of talkingPoints) {
      if (tp.toLowerCase().includes(q)) {
        resume.push({
          content: tp,
          category: 'Talking Point',
          type: 'resume'
        });
      }
    }

    const starStories = resumeDetails.starStories || [];
    for (const star of starStories) {
      if (
        (star.situation && star.situation.toLowerCase().includes(q)) ||
        (star.task && star.task.toLowerCase().includes(q)) ||
        (star.action && star.action.toLowerCase().includes(q)) ||
        (star.result && star.result.toLowerCase().includes(q))
      ) {
        resume.push({
          content: `${star.situation} -> ${star.action} -> ${star.result}`,
          category: 'STAR Story',
          type: 'resume'
        });
      }
    }

    // Filter files
    for (const file of filesRes.rows) {
      const filePath = file.path || '';
      const fileName = file.name || '';
      const content = file.content || '';

      const isPathMatch = filePath.toLowerCase().includes(q) || fileName.toLowerCase().includes(q);

      // A. Files check
      if (isPathMatch) {
        files.push({
          id: file.id,
          name: fileName,
          path: filePath,
          type: 'file'
        });
      }

      // B. Components check
      const isComponentFile = 
        fileName.endsWith('.jsx') || 
        fileName.endsWith('.tsx') || 
        (fileName.endsWith('.js') && content.includes('import React'));

      if (isComponentFile && (isPathMatch || fileName.toLowerCase().includes(q))) {
        components.push({
          id: file.id,
          name: fileName.replace(/\.[^/.]+$/, ""),
          path: filePath,
          type: 'component'
        });
      }

      if (content) {
        const lines = content.split('\n');
        
        // C. Functions search: regex search on each line
        const funcRegex = /(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)?\s*=>|class\s+([a-zA-Z0-9_$]+))/;
        
        lines.forEach((lineText: string, idx: number) => {
          const match = lineText.match(funcRegex);
          if (match) {
            const funcName = match[1] || match[2] || match[3];
            if (funcName && funcName.toLowerCase().includes(q)) {
              functions.push({
                name: funcName,
                path: filePath,
                line: idx + 1,
                snippet: lineText.trim(),
                type: 'function'
              });
            }
          }
        });

        // D. Endpoints search
        const endpointRegex = /(?:app|router|express\(\))\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]+)['"`]/i;

        lines.forEach((lineText: string, idx: number) => {
          const match = lineText.match(endpointRegex);
          if (match) {
            const method = match[1].toUpperCase();
            const route = match[2];
            if (route.toLowerCase().includes(q) || method.toLowerCase().includes(q)) {
              endpoints.push({
                method,
                route,
                path: filePath,
                line: idx + 1,
                snippet: lineText.trim(),
                type: 'endpoint'
              });
            }
          }
        });
      }
    }

    res.json({
      files: files.slice(0, 10),
      functions: functions.slice(0, 10),
      endpoints: endpoints.slice(0, 10),
      components: components.slice(0, 10),
      vulnerabilities: vulnerabilities.slice(0, 10),
      dependencies: dependencies.slice(0, 10),
      questions: questions.slice(0, 10),
      resume: resume.slice(0, 10),
      nodes: nodes.slice(0, 10)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
