import { Router, Response } from 'express';
import { query } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { executeAICompletion } from '../services/providers/aiDispatcher.js';

const router = Router();

// Retrieve all generated documentation for a project
router.get('/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docs = await query('SELECT * FROM documents WHERE project_id = $1 ORDER BY created_at DESC', [req.params.projectId]);
    res.json(docs.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate or regenerate documentation
router.post('/:projectId/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;
  const { docType } = req.body; // README, API, INSTALL, ARCH, DEV, CONTRIB
  
  if (!docType) return res.status(400).json({ error: 'docType is required' });

  try {
    // Check project tech stack
    const projRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projRes.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const project = projRes.rows[0];
    const techStack = project.tech_stack;

    // Get sample file structures to feed to AI
    const filesRes = await query('SELECT path, name, language FROM file_nodes WHERE project_id = $1 LIMIT 15', [projectId]);
    const filesSummary = filesRes.rows.map(f => `- ${f.path} (${f.language})`).join('\n');

    let title = '';
    let prompt = '';

    switch (docType) {
      case 'README':
        title = 'README.md';
        prompt = `Generate a modern, beautiful README.md for a project named "${project.name}" with description "${project.description}". 
        Tech Stack: ${techStack}. 
        Files available in the codebase:\n${filesSummary}\n
        Provide sections: Introduction, Quick Start, Features, Project Structure, and License.`;
        break;
      case 'API':
        title = 'API_DOCUMENTATION.md';
        prompt = `Generate detailed REST API Reference documentation for project "${project.name}".
        Tech Stack: ${techStack}.
        Files available in the codebase:\n${filesSummary}\n
        Draft endpoints for Auth, Projects, and AI analysis. Use clean table formats and curl examples.`;
        break;
      case 'INSTALL':
        title = 'INSTALLATION_GUIDE.md';
        prompt = `Generate a comprehensive Installation Guide for project "${project.name}".
        Tech Stack: ${techStack}.
        Include prerequisites, cloning, environment variable settings, dependency installation, and running the development server.`;
        break;
      case 'ARCH':
        title = 'ARCHITECTURE.md';
        prompt = `Generate high-level Software Architecture Documentation for project "${project.name}".
        Explain the layers: frontend representation, API gateway backend, database layout, and AI vector database integration.`;
        break;
      case 'DEV':
        title = 'DEVELOPER_GUIDE.md';
        prompt = `Generate a Developer Guide for project "${project.name}".
        Outline coding style standards, directory design conventions, git branching model, and testing requirements.`;
        break;
      case 'CONTRIB':
        title = 'CONTRIBUTING.md';
        prompt = `Generate a Contributing Guide. Outline steps for raising issues, submitting pull requests, writing commits, and setting up workspace reviews.`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid docType' });
    }

    const selectedProvider = req.body.provider || 'gemini-2.5-pro';
    let markdown = '';
    let metrics = null;
    
    const systemMsg = "You are a senior technical writer. Generate highly-detailed, production-ready markdown documentation. Keep explanations professional, use clean styling, markdown tables, code highlights, and alerts.";
    const aiRes = await executeAICompletion(selectedProvider, [{ role: 'user', content: prompt }], systemMsg);
    
    markdown = aiRes.text;
    metrics = aiRes.metrics;

    // Save/Overwrite document in DB
    const existingDoc = await query(
      'SELECT id, version FROM documents WHERE project_id = $1 AND type = $2',
      [projectId, docType]
    );

    if (existingDoc.rows.length > 0) {
      const nextVer = (existingDoc.rows[0].version || 1) + 1;
      await query(
        `UPDATE documents 
         SET content = $1, version = $2, title = $3
         WHERE id = $4`,
        [markdown, nextVer, title, existingDoc.rows[0].id]
      );
    } else {
      await query(
        `INSERT INTO documents (project_id, title, type, content, version)
         VALUES ($1, $2, $3, $4, 1)`,
        [projectId, title, docType, markdown]
      );
    }

    res.json({
      title,
      type: docType,
      content: markdown,
      metrics
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getMockMarkdown(type: string, name: string, desc: string, stack: string, files: string): string {
  const stackParsed = JSON.parse(stack).join(', ');
  
  if (type === 'README') {
    return `# 🚀 ${name} - AI Engineering Workspace

${desc}

Built with a premium modern stack including **${stackParsed}**.

---

## 🛠️ Features
- **Semantic Codebase Chat:** Asynchronous RAG architecture indexing local directories.
- **Repository Analysis:** Static complexity and security metrics cards.
- **Bug Engine:** Catches dead code patterns and credential leaks instantly.
- **Refactoring Sandbox:** Compare cleaner/secure versions side-by-side.

## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/example/${name.toLowerCase().replace(/\s+/g, '-')}.git

# Install packages
npm install

# Start development server
npm run dev
\`\`\`

## 📂 File Architecture
Below are the mapped files parsed in the repository:
${files}

---
*Generated by AI Engineering Workspace — Made by Rishi Sharma. All rights reserved.*`;
  }

  if (type === 'API') {
    return `# 🌐 REST API Reference - ${name}

This guide lists the available backend HTTP controllers.

## 🔐 Authentication Router
### Login Account
- **Route:** \`POST /api/auth/login\`
- **Request Body:**
\`\`\`json
{
  "email": "rishi.sharma@example.com",
  "password": "password123"
}
\`\`\`
- **Response Shape (200 OK):**
\`\`\`json
{
  "token": "eyJhbGciOi...",
  "user": { "name": "Rishi Sharma", "role": "LEAD" }
}
\`\`\`

---

## 📂 Projects Router
### Upload Workspace Repository
- **Route:** \`POST /api/projects/upload\`
- **Payload:** \`multipart/form-data\` containing ZIP file upload.
- **Response (201 Created):** Mapped repository metrics and analysis.

---
*Generated by AI Engineering Workspace — Made by Rishi Sharma. All rights reserved.*`;
  }

  // Fallback for others
  return `# 📖 ${type} - ${name}

This is a simulated **${type}** document generated for **${name}**.

### Context Summary
- **Primary stack:** ${stackParsed}
- **Description:** ${desc}

Provide an \`OPENAI_API_KEY\` in your environment variables to compile complete, dynamic summaries reflecting your code lines directly.

---
*Generated by AI Engineering Workspace — Made by Rishi Sharma. All rights reserved.*`;
}

export default router;
