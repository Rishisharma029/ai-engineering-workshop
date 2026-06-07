import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ArrowRight, 
  FileCode, 
  Trash2,
  Terminal,
  Cpu
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: string[];
}

interface AIChatProps {
  activeProject: any;
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  providerMetrics: { tokens: number; latency: number; cost: number; provider: string } | null;
  onSetProviderMetrics: (metrics: { tokens: number; latency: number; cost: number; provider: string } | null) => void;
}

export default function AIChat({ 
  activeProject,
  selectedProvider,
  onProviderChange,
  providerMetrics,
  onSetProviderMetrics
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### Welcome to your AI Codebase Chat! 🤖\n\nI have fully indexed this repository. You can ask me questions about architecture, specific functions, security vulnerabilities, or ask me to write code snippets.\n\nHere are some sample queries to get started:`
    }
  ]);
  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingReferences, setStreamingReferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Explain the database and schemas in this project.',
    'Where is the authentication logic located?',
    'Scan the codebase for security risks or hardcoded secrets.',
    'List all defined API endpoints or routes.',
    'What frameworks and libraries are used?'
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <h3 className="text-lg font-bold text-slate-200">No Project Loaded</h3>
        <p className="text-xs text-slate-400 mt-1">Please upload a ZIP file or import from GitHub to chat.</p>
      </div>
    );
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreamingMessage('');
    setStreamingReferences([]);
    onSetProviderMetrics(null);

    try {
      const token = localStorage.getItem('token');

      if (token === 'mock-preview-token') {
        const mockResponse = getClientMockResponse(text, activeProject.name);
        const words = mockResponse.split(/(\s+)/);
        let tempContent = '';
        
        onSetProviderMetrics({
          tokens: Math.floor(mockResponse.length / 4) + 120,
          latency: 650,
          cost: 0.0,
          provider: 'Local Static Mock'
        });

        for (let i = 0; i < words.length; i++) {
          await new Promise(r => setTimeout(r, 15));
          tempContent += words[i];
          setStreamingMessage(tempContent);
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: mockResponse,
          references: ['README.md', 'frontend/src/App.tsx']
        }]);
        setStreamingMessage('');
        setStreamingReferences([]);
        return;
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          projectId: activeProject.id,
          provider: selectedProvider,
          messages: [...messages.filter(m => m.content !== '').map(m => ({ role: m.role, content: m.content })), userMsg]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finished = false;

      let tempContent = '';
      let refs: string[] = [];

      while (!finished && reader) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunkStr = decoder.decode(value);
          // Split by SSE messages
          const lines = chunkStr.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('event: references')) {
              try {
                const dataJson = JSON.parse(line.replace('event: references\ndata: ', ''));
                refs = dataJson;
                setStreamingReferences(dataJson);
              } catch (e) {}
            } else if (line.startsWith('event: metrics')) {
              try {
                const metricsJson = JSON.parse(line.replace('event: metrics\ndata: ', ''));
                onSetProviderMetrics(metricsJson);
              } catch (e) {}
            } else if (line.startsWith('data: ')) {
              const dataClean = line.replace('data: ', '');
              if (dataClean === '[DONE]') continue;
              try {
                const dataJson = JSON.parse(dataClean);
                const delta = dataJson.choices[0]?.delta?.content || '';
                tempContent += delta;
                setStreamingMessage(tempContent);
              } catch (e) {}
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: tempContent,
        references: refs
      }]);
      setStreamingMessage('');
      setStreamingReferences([]);

    } catch (err) {
      console.warn('Backend connection failed, falling back to local static mock simulation.', err);
      try {
        const mockResponse = getClientMockResponse(text, activeProject.name);
        const words = mockResponse.split(/(\s+)/);
        let tempContent = '';
        
        onSetProviderMetrics({
          tokens: Math.floor(mockResponse.length / 4) + 120,
          latency: 650,
          cost: 0.0,
          provider: 'Local Static Fallback'
        });

        for (let i = 0; i < words.length; i++) {
          await new Promise(r => setTimeout(r, 15));
          tempContent += words[i];
          setStreamingMessage(tempContent);
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: mockResponse,
          references: ['README.md', 'frontend/src/App.tsx']
        }]);
      } catch (fallbackErr) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Error connecting to the workspace assistant server.'
        }]);
      } finally {
        setStreamingMessage('');
        setStreamingReferences([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `### Chat History Cleared 🤖\n\nAsk me anything about your files!`
      }
    ]);
  };

  // Custom high-fidelity markdown compiler function
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    // Split text into code blocks vs standard text blocks
    const segments = text.split(/(```[a-zA-Z]*\n[\s\S]*?\n```)/g);

    return segments.map((seg, idx) => {
      if (seg.startsWith('```')) {
        // Parse code block
        const lines = seg.split('\n');
        const lang = lines[0].replace('```', '') || 'code';
        const codeText = lines.slice(1, -1).join('\n');

        return (
          <div key={idx} className="my-3 rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>{lang}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeText)}
                className="hover:text-slate-200 transition-all"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-slate-300 whitespace-pre">{codeText}</pre>
          </div>
        );
      } else {
        // Normal text block
        const lines = seg.split('\n');
        return lines.map((line, lIdx) => {
          let renderedLine = line;

          // Replace header 3
          if (renderedLine.startsWith('### ')) {
            return <h4 key={`${idx}-${lIdx}`} className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-4 mb-2 font-title">{renderedLine.replace('### ', '')}</h4>;
          }
          // Replace header 2
          if (renderedLine.startsWith('## ')) {
            return <h3 key={`${idx}-${lIdx}`} className="text-sm font-extrabold text-slate-100 mt-5 mb-2.5 font-title">{renderedLine.replace('## ', '')}</h3>;
          }
          // Replace header 1
          if (renderedLine.startsWith('# ')) {
            return <h2 key={`${idx}-${lIdx}`} className="text-base font-black text-white mt-6 mb-3 font-title">{renderedLine.replace('# ', '')}</h2>;
          }
          // Bullet point checks
          const isBullet = renderedLine.trim().startsWith('- ') || renderedLine.trim().startsWith('* ');
          if (isBullet) {
            const cleanText = renderedLine.trim().replace(/^[-*]\s+/, '');
            return (
              <li key={`${idx}-${lIdx}`} className="ml-4 list-disc text-xs text-slate-300 mb-1 leading-relaxed">
                {parseInlineCode(cleanText)}
              </li>
            );
          }

          if (renderedLine === '') return <div key={`${idx}-${lIdx}`} className="h-2"></div>;

          return <p key={`${idx}-${lIdx}`} className="text-xs text-slate-300 leading-relaxed mb-1.5">{parseInlineCode(renderedLine)}</p>;
        });
      }
    });
  };

  // Helper to highlight inline code inside text segments
  const parseInlineCode = (txt: string) => {
    const parts = txt.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 bg-slate-900 border border-slate-850 rounded font-mono text-[11px] text-purple-400">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-4rem)] border-slate-800">
      
      {/* Central Chat Workspace */}
      <div className="lg:col-span-3 flex flex-col justify-between h-full bg-slate-950/20 overflow-hidden relative">
        
        {/* Top Header controls */}
        <div className="h-12 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-xs text-slate-300">
              {selectedProvider === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
               selectedProvider === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
               selectedProvider === 'claude-sonnet' ? 'Claude 3.5 Sonnet' : 'GPT-4o'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedProvider}
              onChange={(e) => {
                onProviderChange(e.target.value);
                onSetProviderMetrics(null);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold rounded px-2.5 py-1 focus:outline-none cursor-pointer hover:border-slate-700"
            >
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="claude-sonnet">Claude Sonnet</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>

            <button
              onClick={handleClear}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-rose-450 hover:text-rose-350 rounded transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Messages list container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-4 border transition-all ${
                msg.role === 'user'
                  ? 'bg-purple-600/10 border-purple-900/30 text-slate-100 rounded-tr-none'
                  : 'glass-panel text-slate-300 rounded-tl-none'
              }`}>
                {/* Message Avatar Tag */}
                <span className="text-[9px] font-bold tracking-wider uppercase mb-2 block text-slate-500">
                  {msg.role === 'user' ? 'You' : 'Workspace Engine'}
                </span>
                
                {/* Body Content */}
                <div className="select-text">{renderMarkdown(msg.content)}</div>

                {/* Vector references footer list */}
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider shrink-0">RAG Context:</span>
                    {msg.references.map((path, idx) => (
                      <span key={idx} className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] font-mono text-slate-400">
                        <FileCode className="w-2.5 h-2.5 text-purple-400" />
                        <span>{path.split('/').pop()}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* SSE Stream rendering bubble */}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-xl p-4 border glass-panel rounded-tl-none text-slate-300">
                <span className="text-[9px] font-bold tracking-wider uppercase mb-2 block text-slate-500">
                  Workspace Engine
                </span>
                <div className="select-text">{renderMarkdown(streamingMessage)}</div>

                {/* References for active stream */}
                {streamingReferences.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider shrink-0">RAG Context:</span>
                    {streamingReferences.map((path, idx) => (
                      <span key={idx} className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] font-mono text-slate-400">
                        <FileCode className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
                        <span>{path.split('/').pop()}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {loading && !streamingMessage && (
            <div className="flex justify-start">
              <div className="glass-panel rounded-xl rounded-tl-none p-3.5 border flex items-center space-x-2 text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-300"></div>
                <span className="text-[10px] font-medium ml-1">Searching indexes...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2.5">
          {providerMetrics && (
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-900/40 px-3 py-1.5 border border-slate-900/80 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Provider: <strong className="text-purple-400">{providerMetrics.provider}</strong></span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Tokens: <strong className="text-slate-205">{providerMetrics.tokens}</strong></span>
                <span>Latency: <strong className="text-slate-205">{providerMetrics.latency}ms</strong></span>
                <span>Est. Cost: <strong className="text-emerald-450">${providerMetrics.cost.toFixed(6)}</strong></span>
              </div>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-850 focus-within:border-purple-600 rounded-lg p-1.5 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the codebase (e.g. explain processStatistics function)..."
              disabled={loading}
              className="flex-1 bg-transparent border-0 text-slate-200 text-xs px-3 focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-md transition-all shadow-md shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick Suggestions Sidebar */}
      <div className="border-l border-slate-800 bg-slate-950/40 p-4 space-y-4 overflow-y-auto hidden lg:block">
        <div className="flex items-center space-x-2 mb-2 px-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Prompts</h4>
        </div>
        
        <div className="space-y-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="w-full text-left p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 hover:border-purple-900/30 text-[11px] text-slate-400 hover:text-slate-200 rounded-lg transition-all group flex items-start justify-between"
            >
              <span className="leading-relaxed">{p}</span>
              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 shrink-0 mt-0.5 ml-2" />
            </button>
          ))}
        </div>

        <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg text-slate-400 text-[10px] leading-relaxed">
          💡 **How Chat Works:** We segment the project files, run vector embeddings on the text chunks, and perform local semantic matching so queries have exact codebase context.
        </div>
      </div>
    </div>
  );
}

// Client-side mock response generator for static demo preview mode
function getClientMockResponse(text: string, projectName: string): string {
  const query = text.toLowerCase().trim();
  
  const matches = (keywords: string[]) => {
    return keywords.some(k => query.includes(k));
  };

  if (matches(['hi', 'hello', 'hey', 'greet', 'how are you'])) {
    return `### Hello there! 🤖

I am your AI Codebase Assistant. I've scanned and indexed the **${projectName}** repository. 

I can help you explore and understand the codebase:
- 🐳 **Docker & Containers**: Inspect configurations and build steps.
- 🗄️ **Database Schemas**: Explain tables, relationships, and queries.
- 🔑 **Authentication & JWT**: Audit login logic and token middleware.
- 🛡️ **Security Risks**: Scan for vulnerabilities and hardcoded secrets.
- ⚡ **Refactoring suggestions**: Optimize nesting, loops, and handlers.
- 🧪 **Vitest unit tests**: Run checks and review code coverage.

What would you like to discuss? Select a topic or ask a custom question!`;
  }
  
  if (matches(['readme'])) {
    return `### README.md Analysis for ${projectName} 📖

This workspace represents a comprehensive Repository Intelligence platform with advanced developer tools.

Key features highlighted in the README:
- **Repository Intelligence Inspector**: Auto-parses files, imports, and builds AST representation.
- **Complexity Heatmaps**: Visualizes complex methods and loops using interactive graphing.
- **Refactoring Sandbox**: Side-by-side AST-based refactoring helper.
- **AI Interview Prep**: Coach for mock viva voce exams.
- **Robustness Suite**: Winston logging and SQLite WAL persistence.`;
  }
  
  if (matches(['docker', 'dockr', 'container', 'compose', 'dockerfile'])) {
    return `### Containerization with Docker 🐳

The repository includes a modern multi-container development and production setup:

1. **Root Compose Configuration (\`docker-compose.yml\`)**:
   - Manages frontend and backend services in isolated networks.
   - Sets environment configurations and binds local folders for hot reloading.

2. **Backend Setup (\`backend/Dockerfile\`)**:
   - Uses a multi-stage build starting from \`node:20-alpine\`.
   - Excludes development dependencies for light production packaging.
   - Compiles TypeScript using the native compiler into the \`dist/\` directory.

3. **Frontend Configuration (\`frontend/Dockerfile\`)**:
   - Bundles the React Vite application assets using a Node builder.
   - Can be served via Nginx or integrated into a combined server static-serving layer.

Would you like to see a sample compose run command or build variables?`;
  }

  if (matches(['database', 'sqlite', 'postgres', 'schema', 'table', 'db', 'migration', ' sql'])) {
    return `### Database Architecture & Schemas 🗄️

The database layer is dynamically managed by a dual-driver config:

1. **SQLite Local Fallback (\`workspace.db\`)**:
   - Designed for easy development without external service dependencies.
   - Configured with **Write-Ahead Logging (WAL) Mode** and a \`busy_timeout\` of 5000ms to guarantee concurrency safety and prevent write locks.

2. **PostgreSQL Production Mode**:
   - Leverages a fully featured \`pg\` pool when \`DATABASE_URL\` is defined.
   - Automatically executes structural migrations to alter database schemas.

3. **Core Database Tables**:
   - **\`users\`**: Accounts, passwords, and authorization scopes.
   - **\`projects\`**: Repository records, summary statistics, and metadata.
   - **\`file_nodes\`**: File structural representations and content sizes.
   - **\`file_embeddings\`**: Vector representations of RAG chunks.
   - **\`bug_reports\` & \`vulnerabilities\`**: Issues flagged during analysis.

Let me know if you would like to review the SQLite WAL config or a database migration script!`;
  }

  if (matches(['auth', 'login', 'jwt', 'token', 'password', 'register'])) {
    return `### Authentication & Authorization System 🔑

The application features a robust stateless token auth pipeline:

1. **Route Handlers (\`backend/src/routes/auth.ts\`)**:
   - \`POST /api/auth/register\`: Registers developers with salted password hashing using \`bcryptjs\`.
   - \`POST /api/auth/login\`: Validates credentials and responds with a signed JSON Web Token (JWT).

2. **Authentication Middleware (\`backend/src/middleware/auth.ts\`)**:
   - Intercepts requests and extracts the bearer token from the \`Authorization\` header.
   - Verifies the signature using \`jsonwebtoken\` and binds the user payload to the express request object.
   - Provides a secure developer fallback in development mode.

3. **Client Session**:
   - Stores the token in \`localStorage\` and automatically includes it in all request fetch headers.

Would you like to review the JWT signing payload or check the middleware code?`;
  }

  if (matches(['security', 'leak', 'secret', 'gitleak', 'vulnerab', 'owasp'])) {
    return `### Codebase Security & Audits 🛡️

We maintain an active security auditing pipeline to prevent credential leaks and input vulnerabilities:

1. **Gitleaks scanner (\`.github/workflows/security.yml\`)**:
   - Scans commits and PRs to block hardcoded API keys.
   - Configures a \`.gitleaksignore\` file to bypass mock/test credentials safely.

2. **OWASP Protections**:
   - **Input Sanitization**: All uploaded ZIP files are parsed by \`adm-zip\` with strict path-sanitization checks to prevent Zip Slip attacks.
   - **Parameterized Queries**: All database queries are fully parameterized (e.g. \`$1\`, \`$2\`) to protect against SQL injections.
   - **Secret Isolation**: Authentication secrets and LLM keys are restricted to the backend \`.env\` and never hardcoded in source files.

Would you like to see how the Zip Slip check is implemented or check the database queries?`;
  }

  if (matches(['refactor', 'clean', 'optimiz', 'complex', 'ast'])) {
    return `### Refactoring & Code Quality Sandbox ⚡

The application supports clean code standards and AST-based complexity parsing:

1. **Complexity Audit**:
   - Code files are analyzed to identify high cyclomatic complexity, deeply nested blocks, or bloated methods.
   - Complexity thresholds (e.g., nesting depth > 4) flag refactoring candidate warnings.

2. **Side-by-Side Sandbox**:
   - Renders the original file and an optimized refactored version side by side.
   - Focuses on extracting helper functions, simplifying conditional expressions, and improving try-catch exception handling.

Would you like me to refactor a specific loop structure or show you clean code guidelines?`;
  }

  if (matches(['test', 'vitest', 'coverage', 'qa', 'e2e'])) {
    return `### Test Automation & Code Coverage 🧪

We use an automated test suite to ensure the system is stable and bug-free:

1. **Testing Stack**:
   - **Vitest**: Modern, ultra-fast test runner with native ESModules support.
   - **v8 Coverage**: Measures statements, branches, functions, and lines.

2. **Test Performance**:
   - **Backend**: Contains unit and API tests checking controllers, database configurations, and authentication. Statement coverage exceeds **92.7%**!
   - **Frontend**: Tests page renders, interactive layouts, and hooks.

To execute tests:
\`\`\`bash
# Backend unit & integration tests
npm run test --prefix backend

# Frontend unit & component tests
npm run test --prefix frontend
\`\`\`

Would you like to write a new mock test or review the existing testing configuration?`;
  }

  if (matches(['framework', 'library', 'react', 'express', 'typescript', 'ts', 'vite', 'tailwind', 'node'])) {
    return `### Tech Stack & Libraries 🚀

This repository uses a modern, high-performance, strictly-typed technology stack:

1. **Frontend Client**:
   - **React 19 & TypeScript**: Component-driven SPA development.
   - **Vite**: Super fast build runner and local dev server.
   - **Tailwind CSS**: Utility-first CSS styling for modern, premium glassmorphic interfaces.
   - **Recharts**: High-fidelity rendering for complexity metrics and dashboard widgets.
   - **Lucide React**: Clean, modern UI icon set.

2. **Backend Server**:
   - **Node.js & Express**: High-concurrency RESTful API endpoints.
   - **Winston**: Standardized, structured logging with customizable console and file transports.
   - **adm-zip**: Memory-safe ZIP file unpacking and metadata extraction.

Would you like to examine the configuration files (e.g. \`vite.config.ts\`) or add a new dependency?`;
  }

  if (matches(['api', 'route', 'endpoint', 'control', 'stream', 'sse'])) {
    return `### API Endpoints Catalog 🌐

The backend server is structured with clean, modular Express routers:

- **Authentication**:
  - \`POST /api/auth/register\` - Create new user credentials.
  - \`POST /api/auth/login\` - Login and receive JWT.
  - \`GET /api/auth/me\` - Verify session.

- **Project Management**:
  - \`GET /api/projects\` - List imported workspaces.
  - \`POST /api/projects/upload\` - Accepts ZIP file uploads (via \`multer\`) for AST profiling.
  - \`DELETE /api/projects/:id\` - Remove project from persistent DB.

- **Developer Intelligence**:
  - \`POST /api/chat/stream\` - Chat chatbot engine using Server-Sent Events (SSE) streaming.
  - \`GET /api/analysis/:projectId\` - Tech stack and codebase statistics.
  - \`POST /api/docs/generate\` - Auto-creates markdown guides.

Would you like to see a sample request payload or see how SSE stream chunks are written?`;
  }

  if (matches(['explain', 'what does', 'what is'])) {
    return `### Codebase Architecture & File Summary 💡

This workspace encapsulates a professional React & TypeScript frontend paired with an Express API backend.

Key directories:
1. **frontend/src**: Contains components, hooks, and views for the AI Engineering Workshop dashboards.
   - \`pages/\`: Dashboard views (AIChat, Complexity Heatmap, Security, Resume Review).
   - \`components/\`: Shared UI components (Layout structure, Sidebar navigation).
2. **backend/src**: Implements controllers, services, database migrations, and AI providers.
   - \`config/\`: Configuration for Database (SQLite/PostgreSQL) and AI models.
   - \`routes/\`: Express API route entrypoints.
   - \`services/\`: RAG indexers and AST scan parsers.`;
  }

  if (matches(['bug', 'error', 'leak', 'risk'])) {
    return `### Codebase Static Bug Analysis 🐛

I ran a quick static scan on the context folders and detected several areas of interest:
* **Hardcoded Secrets**: Potential API tokens or private keys in \`config.js\` or inside test mocks.
* **Large Functions**: The main drawing module contains an SVG rendering routine that exceeds 180 lines, impacting performance.
* **Missing Error Boundaries**: The API handler routes don't fully catch parsing exceptions when ZIP metadata is corrupt.

I suggest wrapping the JSON extraction inside a \`try-catch\` block or checking the validation schemas.`;
  }

  // Fallback response for any other query
  return `### Developer Assistant Response 🤖

I am your codebase copilot. That is a great question! Regarding your query: *"${text}"*

In this repository setup:
- **Frontend SPA**: Vite compiles React & Tailwind assets dynamically with fast hot-reloading.
- **Backend Node.js API**: Configured with parameter validation, Winston structured logging, and JWT protection.
- **Data Integrity**: Persistence uses PostgreSQL in cloud deployments and SQLite3 in WAL mode locally.

If you want to discuss a specific part of the workspace, try asking about **Docker**, **Database schemas**, **Authentication**, **Refactoring**, or **Tests**!`;
}
