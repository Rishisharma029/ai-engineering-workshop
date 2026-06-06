import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  GitBranch, 
  X, 
  Terminal, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  Search, 
  FileCode, 
  Cpu, 
  ShieldAlert, 
  Radio, 
  Braces, 
  Sparkles, 
  Briefcase, 
  MessageSquare, 
  Clipboard,
  MessageCircle,
  Zap,
  Info
} from 'lucide-react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import RepositoryAnalysis from './pages/RepositoryAnalysis.tsx';
import AIChat from './pages/AIChat.tsx';
import Security from './pages/Security.tsx';
import Documentation from './pages/Documentation.tsx';
import Architecture from './pages/Architecture.tsx';
import Refactor from './pages/Refactor.tsx';
import Resume from './pages/Resume.tsx';
import Settings from './pages/Settings.tsx';
import Heatmap from './pages/Heatmap.tsx';
import InterviewPrep from './pages/InterviewPrep.tsx';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);
  
  // Navigation & Page State
  const [activePage, setActivePage] = useState('dashboard');
  const [refactorInitialCode, setRefactorInitialCode] = useState('');
  const [refactorInitialLang, setRefactorInitialLang] = useState('javascript');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('rishi.sharma@example.com');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('Rishi Sharma');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [gitUrl, setGitUrl] = useState('https://github.com/facebook/react');
  const [gitName, setGitName] = useState('');
  const [gitDesc, setGitDesc] = useState('');
  const [importing, setImporting] = useState(false);

  // Search Everywhere State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    files: any[];
    functions: any[];
    endpoints: any[];
    components: any[];
    vulnerabilities: any[];
    dependencies: any[];
    questions: any[];
    resume: any[];
  }>({ 
    files: [], 
    functions: [], 
    endpoints: [], 
    components: [], 
    vulnerabilities: [],
    dependencies: [],
    questions: [],
    resume: []
  });
  const [selectedSearchFilePath, setSelectedSearchFilePath] = useState<string | null>(null);

  // AI Engineering Coach State
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachQuestion, setCoachQuestion] = useState<string | null>(null);
  const [coachAnswer, setCoachAnswer] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  // Global Multi-LLM Provider Selector State
  const [selectedProvider, setSelectedProvider] = useState<string>(() => localStorage.getItem('selected_provider') || 'gemini-2.5-pro');
  const [providerMetrics, setProviderMetrics] = useState<{ tokens: number; latency: number; cost: number; provider: string } | null>(null);

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    localStorage.setItem('selected_provider', newProvider);
  };

  // Ctrl+K keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced query fetching
  useEffect(() => {
    if (!searchQuery.trim() || !activeProject) {
      setSearchResults({ 
        files: [], 
        functions: [], 
        endpoints: [], 
        components: [], 
        vulnerabilities: [],
        dependencies: [],
        questions: [],
        resume: []
      });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${activeProject.id}/search-everywhere?q=${encodeURIComponent(searchQuery)}`, {
          headers: { 'Authorization': `Bearer ${token || ''}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error('Error searching:', e);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeProject?.id, token]);

  // Fetch current user details
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile();
      fetchProjects();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setToken(null);
      }
    } catch (e) {
      setUser({
        id: 1,
        email: 'rishi.sharma@example.com',
        name: 'Rishi Sharma',
        role: 'LEAD',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setProjects(data);
          if (!activeProject) {
            setActiveProject(data[0]);
          }
          return;
        }
      }
      throw new Error('No projects found');
    } catch (e) {
      console.error('Offline project listing, seeding fallback demo project.');
      const fallbackProject = {
        id: 1,
        name: 'AI Engineering Workshop',
        description: 'A production-ready developer intelligence platform and AI Engineering Workshop',
        type: 'GITHUB',
        repo_url: 'https://github.com/Rishisharma029/ai-engineering-workshop',
        tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Express', 'TypeScript'],
        metrics: {
          security: 82,
          documentation: 76,
          testCoverage: 65,
          maintainability: 89,
          performance: 78,
          overall: 78
        },
        folder_structure: {
          name: 'Root',
          path: '',
          type: 'directory',
          size: 154200,
          children: [
            { name: 'backend', path: 'backend', type: 'directory', size: 48000, children: [
              { name: 'src', path: 'backend/src', type: 'directory', size: 38000, children: [
                { name: 'server.ts', path: 'backend/src/server.ts', type: 'file', size: 2376, language: 'TypeScript' },
                { name: 'config', path: 'backend/src/config', type: 'directory', size: 10500, children: [
                  { name: 'db.ts', path: 'backend/src/config/db.ts', type: 'file', size: 9590, language: 'TypeScript' }
                ]}
              ]}
            ]},
            { name: 'frontend', path: 'frontend', type: 'directory', size: 94000, children: [
              { name: 'src', path: 'frontend/src', type: 'directory', size: 84000, children: [
                { name: 'App.tsx', path: 'frontend/src/App.tsx', type: 'file', size: 54644, language: 'TypeScript' },
                { name: 'pages', path: 'frontend/src/pages', type: 'directory', size: 28000, children: [
                  { name: 'Dashboard.tsx', path: 'frontend/src/pages/Dashboard.tsx', type: 'file', size: 65429, language: 'TypeScript' },
                  { name: 'Resume.tsx', path: 'frontend/src/pages/Resume.tsx', type: 'file', size: 25600, language: 'TypeScript' }
                ]}
              ]}
            ]},
            { name: 'README.md', path: 'README.md', type: 'file', size: 4297, language: 'Markdown' }
          ]
        },
        executive_summary: {
          overview: 'The AI Engineering Workshop is a decoupled React and Node/Express platform designed to index repositories, parse file structures, draw topology networks, and prepare engineering packages.',
          purpose: 'Serve as an automated code intelligence dashboard and portfolio accelerator.',
          architecture: 'Layered client-server MVC using SQLite/PostgreSQL adapters and Google Gemini AI client.',
          technologies: ['React', 'Express', 'TypeScript', 'Docker', 'Vite'],
          strengths: ['Robust static analyzer', 'Zoomable SVG dependency maps', 'Automated interview coach'],
          risks: ['Strict local database fallbacks', 'Lack of rate-limiting on custom AI uploads']
        },
        insights: {
          complexFiles: [{ path: 'frontend/src/App.tsx', complexity: 82, risk: 40 }],
          riskyFiles: [{ path: 'backend/src/config/db.ts', complexity: 72, risk: 35 }],
          bottlenecks: [{ file: 'frontend/src/pages/Dashboard.tsx', desc: 'Large DOM render tree with multiple nested SVG nodes.' }],
          deadCode: [{ file: 'frontend/src/components/Sidebar.tsx', desc: 'Legacy unused route buttons.' }]
        },
        heatmap: [
          { path: 'frontend/src/App.tsx', risk: 40, complexity: 82, security: 95, maintainability: 80, performance: 85, documentation: 90, testing: 70 },
          { path: 'backend/src/config/db.ts', risk: 35, complexity: 72, security: 90, maintainability: 85, performance: 80, documentation: 60, testing: 50 },
          { path: 'frontend/src/pages/Dashboard.tsx', risk: 50, complexity: 90, security: 98, maintainability: 75, performance: 65, documentation: 85, testing: 60 }
        ],
        interview_prep: [
          { question: 'Describe the dual-database setup implemented in this repository.', expected: 'Uses a conditional process.env check to initialize either PostgreSQL or SQLite3 driver pools dynamically.', category: 'Architecture', difficulty: 'Medium' },
          { question: 'How is the visual dependency tree rendered without third-party canvas libraries?', expected: 'Constructs dynamic SVG nodes and edges, using simple force-directed coordinate math calculations.', category: 'Viva', difficulty: 'Hard' }
        ],
        resume_data: {
          points: [
            'Designed a dual-persistence database driver in Node.js/TypeScript that auto-detects cloud PG endpoints with local SQLite fallback.',
            'Created custom SVG dependency topology visuals supporting pan-and-zoom actions, increasing frontend rendering efficiency.'
          ],
          linkedin: 'Fullstack Engineer focused on AI Developer Tooling and Cloud Deployments',
          talkingPoints: [
            'Offline-first fallback capabilities',
            'SVG coordinate mapping logic',
            'TypeScript compilation gates setup'
          ]
        }
      };
      setProjects([fallbackProject]);
      setActiveProject(fallbackProject);
    }
  };

  const handleSignOut = () => {
    setToken(null);
    localStorage.removeItem('token');
    setActiveProject(null);
    setProjects([]);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { email: authEmail, password: authPassword, name: authName }
      : { email: authEmail, password: authPassword };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Authentication failed');
      } else {
        setToken(data.token);
        setAuthModalOpen(false);
      }
    } catch (err) {
      setAuthError('Connection error to server. Launching demo dashboard.');
      setToken('mock-preview-token');
      setAuthModalOpen(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', uploadName);
    formData.append('description', uploadDesc);

    try {
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      setProjects(prev => [data, ...prev]);
      setActiveProject(data);
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadName('');
      setUploadDesc('');
    } catch (err) {
      alert('Error uploading project ZIP. Please ensure backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleGithubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);

    try {
      const ghToken = localStorage.getItem('github_token') || undefined;
      const response = await fetch('/api/projects/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          repoUrl: gitUrl,
          name: gitName,
          description: gitDesc,
          token: ghToken
        })
      });

      if (!response.ok) throw new Error('GitHub import failed');
      const data = await response.json();

      setProjects(prev => [data, ...prev]);
      setActiveProject(data);
      setGithubModalOpen(false);
      setGitUrl('');
      setGitName('');
      setGitDesc('');
    } catch (err) {
      alert('GitHub import failure. Please confirm backend details.');
    } finally {
      setImporting(false);
    }
  };

  const handleDocGenerateFromDashboard = async (type: string) => {
    setActivePage('docs');
  };

  const handleSelectCodeToRefactor = (code: string, lang: string) => {
    setRefactorInitialCode(code);
    setRefactorInitialLang(lang);
    setActivePage('refactor');
  };

  const clearRefactorCode = () => {
    setRefactorInitialCode('');
  };

  // AI Coach Quick Answers Mapping
  const renderCoachText = (text: string | null) => {
    if (!text) return 'Analyzing active codebase context...';
    
    try {
      const parsed = JSON.parse(text);
      return (
        <div className="space-y-4 select-text">
          <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg space-y-1">
            <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest block font-mono">🚨 Problem</span>
            <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{parsed.problem}</p>
          </div>

          <div className="p-3 bg-orange-950/20 border border-orange-900/30 rounded-lg space-y-1">
            <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest block font-mono">⚠️ Impact</span>
            <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{parsed.impact}</p>
          </div>

          <div className="p-3 bg-purple-955/20 border border-purple-900/30 rounded-lg space-y-1">
            <span className="text-[8px] font-bold text-purple-405 uppercase tracking-widest block font-mono">⚡ Recommended Fix</span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{parsed.fix}</p>
          </div>

          {parsed.files && parsed.files.length > 0 && (
            <div className="space-y-1.5 select-none">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">📂 Related Files</span>
              <div className="flex flex-col gap-1.5">
                {parsed.files.map((file: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSearchFilePath(file);
                      setActivePage('analysis');
                    }}
                    className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-purple-400 hover:text-purple-300 font-mono rounded-lg transition-all cursor-pointer truncate"
                  >
                    {file}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (e) {
      // Fallback parser for custom free text matching
      const regex = /(\b[a-zA-Z0-9_\-\.\/]+\.(?:ts|tsx|js|jsx|py|java|go|rs|c|cpp|html|css|json|md)\b)/g;
      const parts = text.split(regex);
      return parts.map((part, idx) => {
        if (regex.test(part)) {
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedSearchFilePath(part);
                setActivePage('analysis');
              }}
              className="text-purple-400 hover:text-purple-300 hover:underline font-mono bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-[10px] inline-block my-0.5 cursor-pointer align-middle"
            >
              {part}
            </button>
          );
        }
        return part;
      });
    }
  };

  const handleCoachAsk = async (question: string) => {
    setCoachQuestion(question);
    setCoachAnswer('');

    try {
      const tokenVal = localStorage.getItem('token');
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenVal || ''}`
        },
        body: JSON.stringify({
          projectId: activeProject?.id || 1,
          provider: selectedProvider,
          messages: [
            {
              role: 'system',
              content: 'You are a professional AI software engineering assistant. Structure your reply inside a JSON block showing Problem, Impact, and Fix, and render related files as navigable button controls: {"problem": "...", "impact": "...", "fix": "...", "files": ["filepath1", "filepath2"]}. Provide precise details matching the codebase. Return ONLY this raw JSON string (no markdown ticks or other texts).'
            },
            { role: 'user', content: question }
          ]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finished = false;
      let tempContent = '';

      while (!finished && reader) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunkStr = decoder.decode(value);
          const lines = chunkStr.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataClean = line.replace('data: ', '');
              if (dataClean === '[DONE]') continue;
              try {
                const dataJson = JSON.parse(dataClean);
                const delta = dataJson.choices[0]?.delta?.content || '';
                tempContent += delta;
                setCoachAnswer(tempContent);
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      setCoachAnswer(JSON.stringify({
        problem: 'Connection error to workspace assistant server.',
        impact: 'Offline mode active.',
        fix: 'Please verify the backend server is listening and environment is configured.',
        files: []
      }));
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            activeProject={activeProject}
            projects={projects}
            onPageChange={setActivePage}
            onGenerateDoc={handleDocGenerateFromDashboard}
            onProjectChange={setActiveProject}
          />
        );
      case 'analysis':
        return (
          <RepositoryAnalysis
            activeProject={activeProject}
            onSelectCodeToRefactor={handleSelectCodeToRefactor}
            selectedFilePath={selectedSearchFilePath}
            onSelectFile={setSelectedSearchFilePath}
          />
        );
      case 'chat':
        return (
          <AIChat 
            activeProject={activeProject} 
            selectedProvider={selectedProvider}
            onProviderChange={handleProviderChange}
            providerMetrics={providerMetrics}
            onSetProviderMetrics={setProviderMetrics}
          />
        );
      case 'security':
        return <Security activeProject={activeProject} />;
      case 'docs':
        return (
          <Documentation 
            activeProject={activeProject} 
            selectedProvider={selectedProvider}
            providerMetrics={providerMetrics}
            onSetProviderMetrics={setProviderMetrics}
          />
        );
      case 'architecture':
        return (
          <Architecture 
            activeProject={activeProject} 
            onNavigateToFile={(path) => {
              setSelectedSearchFilePath(path);
              setActivePage('analysis');
            }}
          />
        );
      case 'refactor':
        return (
          <Refactor
            initialCode={refactorInitialCode}
            initialLanguage={refactorInitialLang}
            onClearInitialCode={clearRefactorCode}
            selectedProvider={selectedProvider}
            providerMetrics={providerMetrics}
            onSetProviderMetrics={setProviderMetrics}
          />
        );
      case 'resume':
        return <Resume activeProject={activeProject} />;
      case 'heatmap':
        return (
          <Heatmap 
            activeProject={activeProject} 
            onNavigateToFile={(path) => {
              setSelectedSearchFilePath(path);
              setActivePage('analysis');
            }} 
          />
        );
      case 'interview':
        return (
          <InterviewPrep 
            activeProject={activeProject} 
            onNavigateToFile={(path: string) => {
              setSelectedSearchFilePath(path);
              setActivePage('analysis');
            }}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            activeProject={activeProject} 
            projects={projects} 
            onPageChange={setActivePage} 
            onGenerateDoc={handleDocGenerateFromDashboard}
            onProjectChange={setActiveProject}
          />
        );
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen text-slate-100 flex overflow-hidden font-sans">
      
      {!token ? (
        <LandingPage
          onStartDemo={() => setAuthModalOpen(true)}
          onLoginClick={() => setAuthModalOpen(true)}
        />
      ) : (
        <div className="flex w-full h-screen overflow-hidden relative">
          <Sidebar
            projects={projects}
            activeProject={activeProject}
            onProjectChange={setActiveProject}
            activePage={activePage}
            onPageChange={setActivePage}
          />
          
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Header
              user={user}
              activeProject={activeProject}
              onSignOut={handleSignOut}
              onUploadClick={() => setUploadModalOpen(true)}
              onGithubClick={() => setGithubModalOpen(true)}
              activePage={activePage}
            />
            
            <main className="flex-1 overflow-hidden bg-slate-950/20 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  {renderActivePage()}
                </motion.div>
              </AnimatePresence>

              {/* Floating AI Engineering Coach Drawer Trigger */}
              <button
                onClick={() => setCoachOpen(!coachOpen)}
                className="fixed bottom-6 right-6 z-40 p-3 bg-purple-600 hover:bg-purple-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all text-white border border-purple-400/30"
                title="AI Engineering Coach"
              >
                <MessageCircle className="w-6 h-6 animate-pulse" />
              </button>
            </main>
          </div>

          {/* Floating AI Coach Panel Overlay */}
          <AnimatePresence>
            {coachOpen && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed top-16 right-0 bottom-0 w-80 bg-slate-950/95 border-l border-slate-900 shadow-2xl z-40 p-5 flex flex-col justify-between backdrop-blur-md"
              >
                <div className="space-y-5 flex-1 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4.5 h-4.5 text-purple-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-title">AI Engineering Coach</h4>
                    </div>
                    <button onClick={() => setCoachOpen(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Ask coach</span>
                    <div className="flex flex-col gap-1.5">
                      {[
                        'What should I improve first?',
                        'What is my biggest risk?',
                        'How do I improve architecture?',
                        'How do I improve security?',
                        'How do I improve scalability?',
                        'How do I improve performance?'
                      ].map((qst, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCoachAsk(qst)}
                          className="w-full text-left px-3 py-2 bg-slate-900/50 hover:bg-purple-950/10 border border-slate-900 hover:border-purple-900/20 text-[11px] text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                        >
                          {qst}
                        </button>
                      ))}
                    </div>
                  </div>

                  {coachQuestion && (
                    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-3.5">
                      <div className="flex items-start space-x-1.5">
                        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Coach Observation</span>
                          <span className="text-[11px] font-semibold text-slate-300 leading-snug">{coachQuestion}</span>
                        </div>
                      </div>
                      
                      <div className="text-[11px] text-slate-400 leading-relaxed font-sans whitespace-pre-line border-t border-slate-900/50 pt-2.5">
                        {renderCoachText(coachAnswer)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-900">
                  <div className="relative">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customQuestion.trim()) {
                          handleCoachAsk(customQuestion);
                          setCustomQuestion('');
                        }
                      }}
                      placeholder="Ask another question..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-purple-600 text-xs rounded-lg px-3 py-2.5 focus:outline-none placeholder:text-slate-650"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Auth Modal Portal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm rounded-xl overflow-hidden p-6 relative">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-7 h-7 rounded bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider font-title">Start Demo Workspace</span>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>

              {authError && (
                <p className="text-[10px] font-semibold text-rose-400">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md transition-all mt-4"
              >
                {isRegister ? 'Sign Up' : 'Launch Workspace'}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setAuthError('');
                  }}
                  className="text-[10px] text-slate-500 hover:text-purple-400 transition-all font-semibold"
                >
                  {isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload ZIP Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <h3 className="text-sm font-bold text-slate-200 font-title mb-4">Upload Codebase ZIP</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. backend-express-app"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="e.g. Core backend api files"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ZIP Archive File</label>
                <div className="border border-dashed border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-950/20 hover:bg-slate-950/40 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".zip"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        if (!uploadName) {
                          setUploadName(e.target.files[0].name.replace('.zip', ''));
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-300">
                    {selectedFile ? selectedFile.name : 'Click to select project .zip'}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1">Maximum size: 15MB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-650 text-white text-xs font-bold rounded-lg shadow-md transition-all mt-4"
              >
                {uploading ? 'Processing Codebase...' : 'Upload & Scan Archive'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Import Modal */}
      {githubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setGithubModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <h3 className="text-sm font-bold text-slate-200 font-title mb-4">Import GitHub Repository</h3>

            <form onSubmit={handleGithubSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Repository URL</label>
                <input
                  type="text"
                  required
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Name (Optional)</label>
                <input
                  type="text"
                  value={gitName}
                  onChange={(e) => setGitName(e.target.value)}
                  placeholder="Leave blank to use repo name"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <input
                  type="text"
                  value={gitDesc}
                  onChange={(e) => setGitDesc(e.target.value)}
                  placeholder="Brief description"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="p-3 bg-purple-950/15 border border-purple-900/20 rounded flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Private repositories require a Personal Access Token. You can configure it inside the settings tab.
                </p>
              </div>

              <button
                type="submit"
                disabled={importing || !gitUrl.trim()}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-650 text-white text-xs font-bold rounded-lg shadow-md transition-all mt-4"
              >
                {importing ? 'Ingesting Repository Trees...' : 'Import & Build Embeddings'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Search Everywhere (Ctrl+K) Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-md p-4 pt-[10vh]">
          <div className="glass-panel w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
            
            {/* Input Header */}
            <div className="flex items-center space-x-3 px-4 py-3 border-b border-slate-800/80 shrink-0">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files, functions, API endpoints, dependencies, interview prompts, resume achievs..."
                className="w-full bg-transparent text-slate-100 text-sm focus:outline-none placeholder:text-slate-500 font-sans"
              />
              <span className="px-2 py-0.5 bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 font-mono rounded shrink-0">
                ESC
              </span>
            </div>

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!searchQuery.trim() ? (
                <div className="text-center py-8">
                  <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">Repository Omniscient Search</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Press <span className="font-mono text-purple-400/80">Ctrl + K</span> to invoke. Queries matched code files, component structures, endpoints, active dependencies, interview prompts, and STAR bio achievements.
                  </p>
                </div>
              ) : (
                <>
                  {searchResults.files.length === 0 &&
                   searchResults.components.length === 0 &&
                   searchResults.functions.length === 0 &&
                   searchResults.endpoints.length === 0 &&
                   searchResults.vulnerabilities.length === 0 &&
                   (searchResults.dependencies?.length || 0) === 0 &&
                   (searchResults.questions?.length || 0) === 0 &&
                   (searchResults.resume?.length || 0) === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No matching records found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="space-y-4 font-sans text-xs">
                      
                      {/* Files */}
                      {searchResults.files.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <FileCode className="w-3.5 h-3.5 text-slate-450 mr-1.5" />
                            Files ({searchResults.files.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.files.map((file, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedSearchFilePath(file.path);
                                  setActivePage('analysis');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                              >
                                <span className="font-semibold text-slate-350">{file.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{file.path}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Components */}
                      {searchResults.components.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <Cpu className="w-3.5 h-3.5 text-slate-450 mr-1.5" />
                            React Components ({searchResults.components.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.components.map((comp, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedSearchFilePath(comp.path);
                                  setActivePage('analysis');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                              >
                                <span className="font-semibold text-slate-350">{comp.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{comp.path}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Functions */}
                      {searchResults.functions.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <Braces className="w-3.5 h-3.5 text-slate-450 mr-1.5" />
                            Functions ({searchResults.functions.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.functions.map((func, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedSearchFilePath(func.path);
                                  setActivePage('analysis');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex flex-col space-y-1 cursor-pointer transition-all"
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-semibold font-mono text-purple-400">{func.name}</span>
                                  <span className="text-[10px] text-slate-550 font-mono">{func.path} : L{func.line}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono bg-slate-950/65 px-2 py-0.5 rounded truncate">{func.snippet}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Endpoints */}
                      {searchResults.endpoints.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <Radio className="w-3.5 h-3.5 text-slate-450 mr-1.5" />
                            API Endpoints ({searchResults.endpoints.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.endpoints.map((ep, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedSearchFilePath(ep.path);
                                  setActivePage('analysis');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] font-mono ${
                                    ep.method === 'GET' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                                    ep.method === 'POST' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' :
                                    ep.method === 'DELETE' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' :
                                    'bg-purple-950/40 text-purple-400 border border-purple-900/30'
                                  }`}>
                                    {ep.method}
                                  </span>
                                  <span className="font-mono text-slate-300 font-semibold">{ep.route}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[50%]">{ep.path}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Dependencies */}
                      {searchResults.dependencies && searchResults.dependencies.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <Zap className="w-3.5 h-3.5 text-purple-450 mr-1.5" />
                            Dependencies ({searchResults.dependencies.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.dependencies.map((dep, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActivePage('security');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-semibold text-slate-300">{dep.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{dep.version}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border ${
                                  dep.status === 'Safe' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/20' :
                                  'bg-rose-950/30 text-rose-400 border-rose-900/20'
                                }`}>
                                  {dep.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interview Questions */}
                      {searchResults.questions && searchResults.questions.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-450 mr-1.5" />
                            Interview Prompts ({searchResults.questions.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.questions.map((qst, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActivePage('interview');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex flex-col space-y-1 cursor-pointer transition-all"
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-semibold text-slate-300">{qst.question}</span>
                                  <span className="text-[9px] font-mono bg-slate-900 px-1 border border-slate-800 rounded text-slate-450 uppercase">{qst.category}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 leading-normal truncate italic">"{qst.expected}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resume / Portfolio points */}
                      {searchResults.resume && searchResults.resume.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <Briefcase className="w-3.5 h-3.5 text-slate-450 mr-1.5" />
                            Resume Bullet Points ({searchResults.resume.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.resume.map((resItem, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActivePage('resume');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-purple-950/20 border border-slate-900 hover:border-purple-900/35 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                              >
                                <span className="text-[11px] text-slate-350 leading-relaxed pr-3 truncate">{resItem.content}</span>
                                <span className="text-[9px] font-mono text-slate-550 shrink-0 font-semibold uppercase">{resItem.category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vulnerabilities */}
                      {searchResults.vulnerabilities.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2 flex items-center">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
                            Security Vulnerabilities ({searchResults.vulnerabilities.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.vulnerabilities.map((v, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActivePage('security');
                                  setSearchModalOpen(false);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-2 bg-slate-950/40 hover:bg-rose-950/15 border border-slate-900 hover:border-rose-900/25 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div className="flex flex-col space-y-0.5">
                                  <span className="font-semibold text-slate-355">{v.name}</span>
                                  <span className="text-[10px] text-slate-500 truncate">{v.description}</span>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] font-mono ${
                                    v.severity === 'CRITICAL' ? 'bg-rose-900/30 text-rose-400 border border-rose-800/20' :
                                    v.severity === 'HIGH' ? 'bg-orange-900/30 text-orange-400 border border-orange-850/20' :
                                    'bg-yellow-900/30 text-yellow-400 border border-yellow-855/20'
                                  }`}>
                                    {v.severity}
                                  </span>
                                  <span className="text-[10px] text-slate-550 font-mono">{v.path}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
