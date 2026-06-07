interface GitHubFileInfo {
  path: string;
  content: string;
  size: number;
}

export async function fetchGithubRepository(repoUrl: string, token?: string): Promise<GitHubFileInfo[]> {
  // Parse repoUrl to extract owner and repo name
  // Format could be: https://github.com/owner/repo or owner/repo
  let owner = '';
  let repo = '';

  try {
    const cleaned = repoUrl.replace('https://github.com/', '').replace('.git', '');
    const parts = cleaned.split('/');
    owner = parts[0];
    repo = parts[1];
  } catch (e) {
    // If invalid, fallback to mocks
    return getMockGithubRepo();
  }

  if (!owner || !repo) {
    return getMockGithubRepo();
  }

  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Get default branch info
    const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoInfoRes.ok) {
      throw new Error(`Repo fetch failed: ${repoInfoRes.status}`);
    }
    const repoInfo = await repoInfoRes.json();
    const branch = repoInfo.default_branch || 'main';

    // Retrieve git tree recursively
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
    if (!treeRes.ok) {
      throw new Error(`Tree fetch failed: ${treeRes.status}`);
    }
    const treeData = await treeRes.json();

    const files: GitHubFileInfo[] = [];
    const limit = 25; // Limit imports to first 25 code files to avoid rate limiting & memory overload
    let count = 0;

    for (const item of treeData.tree) {
      if (item.type === 'blob' && count < limit) {
        // Skip binaries
        const ext = item.path.split('.').pop()?.toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'zip', 'tar', 'gz', 'mp3', 'mp4', 'woff', 'woff2', 'ttf'].includes(ext || '')) {
          continue;
        }

        // Fetch file content
        const fileRes = await fetch(item.url, { headers });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          // Content is usually base64 encoded
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          files.push({
            path: item.path,
            content,
            size: item.size || content.length
          });
          count++;
        }
      }
    }

    return files.length > 0 ? files : getMockGithubRepo();
  } catch (error) {
    console.warn(`GitHub Ingest failed (${error}), loading sample workspace.`, error);
    return getMockGithubRepo();
  }
}

function getMockGithubRepo(): GitHubFileInfo[] {
  return [
    {
      path: 'package.json',
      size: 450,
      content: `{
  "name": "developer-dashboard",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.5",
    "react": "^19.0.0"
  }
}`
    },
    {
      path: 'README.md',
      size: 320,
      content: `# Developer Dashboard\n\nThis is a sample project imported from GitHub to demonstrate codebase chat, bug reports, and refactoring helpers.`
    },
    {
      path: 'server.js',
      size: 1500,
      content: `const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(express.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin') {
    const token = jwt.sign({ user: 'admin' }, SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Auth failed' });
  }
});

// Large function mock
function processStatistics(data) {
  let output = [];
  for(let i=0; i<data.length; i++) {
    // line 20
    // line 21
    // line 22
    // line 23
  }
  return output;
}

app.listen(3000, () => {
  console.log('App running on port 3000');
});`
    },
    {
      path: 'src/App.jsx',
      size: 1100,
      content: `import React, { useState } from 'react';

export default function App() {
  const [data, setData] = useState([]);

  const loadData = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(res => {
        setData(res);
      })
      .catch(err => {
        // empty catch statement here
      });
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold">Workspace App</h1>
      <button onClick={loadData} className="px-4 py-2 mt-4 bg-blue-500 rounded">
        Load
      </button>
      <div dangerouslySetInnerHTML={{ __html: '<div>Rendered</div>' }} />
    </div>
  );
}`
    }
  ];
}
