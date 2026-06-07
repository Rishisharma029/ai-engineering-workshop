import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { searchSimilarChunks } from '../services/rag.js';
import { executeAICompletion } from '../services/providers/aiDispatcher.js';
import { query } from '../config/db.js';

const router = Router();

router.post('/stream', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, messages, provider, selectedFile } = req.body;
  
  if (!projectId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'projectId and messages array are required' });
  }

  const selectedProvider = provider || 'gemini-2.5-pro';
  const lastMessage = messages[messages.length - 1]?.content || '';

  try {
    // 1. Fetch project database metadata
    const projRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projRes.rows[0];

    // 2. Fetch bugs and security warnings
    const bugsRes = await query(
      `SELECT br.type, br.severity, br.description, fn.path 
       FROM bug_reports br 
       LEFT JOIN file_nodes fn ON br.file_node_id = fn.id 
       WHERE br.project_id = $1`,
      [projectId]
    );

    const vulnsRes = await query(
      `SELECT v.type, v.severity, v.description, fn.path 
       FROM vulnerabilities v 
       LEFT JOIN file_nodes fn ON v.file_node_id = fn.id 
       WHERE v.project_id = $1`,
      [projectId]
    );

    // 3. Load active file content if selected
    let selectedFileContent = '';
    if (selectedFile) {
      const fileRes = await query(
        'SELECT content FROM file_nodes WHERE project_id = $1 AND path = $2',
        [projectId, selectedFile]
      );
      if (fileRes.rows.length > 0) {
        selectedFileContent = fileRes.rows[0].content;
      }
    }

    const projectContext = `
Project Name: ${project.name}
Description: ${project.description}
Tech Stack: ${project.tech_stack || '[]'}
Metrics: ${project.metrics || '{}'}

DISCOVERED CODE BUGS:
${bugsRes.rows.map(b => `- [${b.severity}] ${b.type} in ${b.path || 'unknown'}: ${b.description}`).join('\n')}

SECURITY VULNERABILITIES:
${vulnsRes.rows.map(v => `- [${v.severity}] ${v.type} in ${v.path || 'unknown'}: ${v.description}`).join('\n')}

${selectedFile ? `ACTIVE SELECTION FILE CONTENT (${selectedFile}):\n\`\`\`\n${selectedFileContent}\n\`\`\`` : ''}
    `.trim();

    // 4. Query RAG to find relevant code snippets
    const contextChunks = await searchSimilarChunks(parseInt(projectId, 10), lastMessage, 4);
    const referencedFiles = Array.from(new Set(contextChunks.map(c => c.filePath)));
    const contextContent = contextChunks
      .map(c => `[File: ${c.filePath}]\n${c.content}`)
      .join('\n\n---\n\n');

    // 5. Setup SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Write references so UI knows which files are queried
    res.write(`event: references\ndata: ${JSON.stringify(referencedFiles)}\n\n`);

    // 6. Connect to Provider stream
    const systemPrompt = `You are a professional AI software engineering assistant. Use the following codebase context to answer the user's questions:

=== REPOSITORY GENERAL CONTEXT ===
${projectContext}

=== RAG FILE SEARCH CONTEXT ===
${contextContent}

Always answer using professional engineering details. If code changes are proposed, write clean code blocks.`;

    const cleanMessages = messages
      .filter(m => m.content !== '')
      .map(m => ({ role: m.role, content: m.content }));

    const aiRes = await executeAICompletion(selectedProvider, cleanMessages, systemPrompt, { stream: true });

    if (aiRes.stream) {
      aiRes.stream.on('data', (chunk) => {
        res.write(chunk);
      });

      aiRes.stream.on('end', () => {
        res.end();
      });

      aiRes.stream.on('error', (err) => {
        console.error('SSE Stream Error:', err);
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: '\n[Stream Error encountered]' } }] })}\n\n`);
        res.end();
      });

      // Close listener if client cancels connection
      req.on('close', () => {
        if (aiRes.stream) aiRes.stream.destroy();
      });
    } else {
      // Non-streaming fallback response if stream not returned
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: aiRes.text } }] })}\n\n`);
      res.write('event: done\ndata: [DONE]\n\n');
      res.end();
    }

  } catch (error: any) {
    console.error('SSE setup failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
