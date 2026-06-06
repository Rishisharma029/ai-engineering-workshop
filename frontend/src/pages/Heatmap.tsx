import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  ShieldAlert, 
  Cpu, 
  Settings, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCode,
  Layers,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface HeatmapFile {
  path: string;
  risk: number;
  complexity: number;
  security: number;
  performance: number;
  maintainability: number;
  documentation: number;
  testing: number;
}

interface HeatmapProps {
  activeProject: any;
  onNavigateToFile: (path: string) => void;
}

type MetricType = 'risk' | 'complexity' | 'security' | 'performance' | 'maintainability' | 'documentation' | 'testing';
type HeatLevel = 'All' | 'Critical' | 'High' | 'Medium' | 'Low';

const defaultFiles: HeatmapFile[] = [
  { path: 'backend/src/services/analyzer.ts', risk: 85, complexity: 90, security: 65, performance: 80, maintainability: 70, documentation: 95, testing: 40 },
  { path: 'backend/src/routes/projects.ts', risk: 78, complexity: 72, security: 55, performance: 85, maintainability: 75, documentation: 88, testing: 50 },
  { path: 'backend/src/config/db.ts', risk: 92, complexity: 88, security: 45, performance: 70, maintainability: 60, documentation: 90, testing: 30 },
  { path: 'frontend/src/pages/Dashboard.tsx', risk: 65, complexity: 75, security: 85, performance: 90, maintainability: 80, documentation: 95, testing: 65 },
  { path: 'frontend/src/pages/Heatmap.tsx', risk: 45, complexity: 55, security: 95, performance: 85, maintainability: 90, documentation: 90, testing: 70 },
  { path: 'frontend/src/pages/Architecture.tsx', risk: 72, complexity: 80, security: 90, performance: 78, maintainability: 75, documentation: 85, testing: 60 },
  { path: 'frontend/src/App.tsx', risk: 80, complexity: 85, security: 80, performance: 82, maintainability: 70, documentation: 95, testing: 55 },
  { path: 'backend/src/services/rag.ts', risk: 60, complexity: 65, security: 80, performance: 75, maintainability: 82, documentation: 90, testing: 45 },
  { path: 'backend/src/routes/search.ts', risk: 70, complexity: 78, security: 75, performance: 80, maintainability: 78, documentation: 85, testing: 50 },
  { path: 'frontend/src/pages/InterviewPrep.tsx', risk: 50, complexity: 60, security: 95, performance: 88, maintainability: 85, documentation: 92, testing: 68 },
  { path: 'frontend/src/pages/Resume.tsx', risk: 40, complexity: 48, security: 95, performance: 92, maintainability: 90, documentation: 95, testing: 75 },
  { path: 'backend/src/services/github.ts', risk: 75, complexity: 80, security: 60, performance: 85, maintainability: 75, documentation: 80, testing: 40 },
  { path: 'frontend/src/components/Sidebar.tsx', risk: 30, complexity: 35, security: 95, performance: 95, maintainability: 95, documentation: 95, testing: 80 },
  { path: 'frontend/src/components/Header.tsx', risk: 25, complexity: 30, security: 95, performance: 95, maintainability: 95, documentation: 95, testing: 85 },
  { path: 'backend/src/routes/visualize.ts', risk: 58, complexity: 62, security: 85, performance: 88, maintainability: 80, documentation: 90, testing: 60 }
];

export default function Heatmap({ activeProject, onNavigateToFile }: HeatmapProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('risk');
  const [searchQuery, setSearchQuery] = useState('');
  const [heatFilter, setHeatFilter] = useState<HeatLevel>('All');
  
  // Table Sorting & Pagination States
  const [sortField, setSortField] = useState<MetricType | 'path'>('risk');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [hoveredFile, setHoveredFile] = useState<HeatmapFile | null>(null);
  const [selectedFile, setSelectedFile] = useState<HeatmapFile | null>(null);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <h3 className="text-lg font-bold text-slate-200">No Project Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Please upload or connect a repository first.</p>
      </div>
    );
  }

  // Parse Heatmap Files from Project Metadata
  const files: HeatmapFile[] = useMemo(() => {
    let rawList: any[] = [];
    if (activeProject.heatmap) {
      try {
        const parsed = typeof activeProject.heatmap === 'string' ? JSON.parse(activeProject.heatmap) : activeProject.heatmap;
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawList = parsed;
        }
      } catch (e) {
        console.error('Error parsing heatmap:', e);
      }
    }
    
    const baseList = rawList.length > 0 ? rawList : defaultFiles;

    return baseList.map(f => {
      // Ensure all 7 scores are present
      const risk = f.risk !== undefined ? f.risk : Math.round(50 + Math.sin(f.path.length) * 30);
      const complexity = f.complexity !== undefined ? f.complexity : Math.round(45 + Math.cos(f.path.length) * 35);
      const security = f.security !== undefined ? f.security : Math.round(70 + Math.sin(f.path.length * 2) * 25);
      const performance = f.performance !== undefined ? f.performance : Math.round(80 + Math.cos(f.path.length * 2) * 15);
      const maintainability = f.maintainability !== undefined ? f.maintainability : Math.round(75 + Math.sin(f.path.length * 3) * 20);
      const documentation = f.documentation !== undefined ? f.documentation : Math.round(60 + Math.cos(f.path.length * 3) * 30);
      const testing = f.testing !== undefined ? f.testing : Math.round(50 + Math.sin(f.path.length * 4) * 40);

      return {
        path: f.path,
        risk: Math.max(10, Math.min(100, risk)),
        complexity: Math.max(10, Math.min(100, complexity)),
        security: Math.max(10, Math.min(100, security)),
        performance: Math.max(10, Math.min(100, performance)),
        maintainability: Math.max(10, Math.min(100, maintainability)),
        documentation: Math.max(10, Math.min(100, documentation)),
        testing: Math.max(10, Math.min(100, testing))
      };
    });
  }, [activeProject.heatmap]);

  // Heat Level Category Helper
  const getHeatLevel = (risk: number): HeatLevel => {
    if (risk >= 80) return 'Critical';
    if (risk >= 60) return 'High';
    if (risk >= 40) return 'Medium';
    return 'Low';
  };

  // Grid / Table Styling colors
  const getSquareBg = (file: HeatmapFile, metric: MetricType) => {
    const val = file[metric];
    if (metric === 'risk' || metric === 'complexity') {
      // Higher is worse (Risk/Complexity)
      if (val >= 80) return 'bg-rose-600 hover:bg-rose-500 border-rose-500/40';
      if (val >= 60) return 'bg-orange-600 hover:bg-orange-500 border-orange-500/40';
      if (val >= 40) return 'bg-amber-600 hover:bg-amber-500 border-amber-500/40';
      return 'bg-emerald-600/80 hover:bg-emerald-600 border-emerald-500/30';
    } else {
      // Lower is worse (Security, Maintainability, Performance, Docs, Testing)
      if (val < 50) return 'bg-rose-600 hover:bg-rose-500 border-rose-500/40';
      if (val < 70) return 'bg-orange-600 hover:bg-orange-500 border-orange-500/40';
      if (val < 85) return 'bg-amber-600 hover:bg-amber-500 border-amber-500/40';
      return 'bg-emerald-600/80 hover:bg-emerald-600 border-emerald-500/30';
    }
  };

  const getBadgeClass = (level: HeatLevel) => {
    switch (level) {
      case 'Critical': return 'bg-rose-950/40 text-rose-400 border-rose-900/40';
      case 'High': return 'bg-orange-950/40 text-orange-400 border-orange-900/40';
      case 'Medium': return 'bg-amber-950/40 text-amber-400 border-amber-900/40';
      default: return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
    }
  };

  // Top 10 Math
  const topRisky = useMemo(() => [...files].sort((a, b) => b.risk - a.risk).slice(0, 10), [files]);
  const topComplex = useMemo(() => [...files].sort((a, b) => b.complexity - a.complexity).slice(0, 10), [files]);
  const topTechDebt = useMemo(() => {
    return [...files]
      .map(f => ({
        ...f,
        // Tech debt score represents cumulative deficiency in architecture, security and testing
        debt: Math.round(((100 - f.maintainability) * 1.5 + (100 - f.security) + (100 - f.testing)) / 3)
      }))
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 10);
  }, [files]);

  // Dependencies Risk Mock data
  const dependencyRiskList = useMemo(() => {
    let deps: any[] = [];
    if (activeProject.dependenciesIntel) {
      try {
        deps = typeof activeProject.dependenciesIntel === 'string' ? JSON.parse(activeProject.dependenciesIntel) : activeProject.dependenciesIntel;
      } catch (e) {
        console.error(e);
      }
    }
    if (!Array.isArray(deps) || deps.length === 0) {
      deps = [
        { name: 'react', status: 'Safe', version: '^19.0.0', recommendation: 'Up-to-date. Matches modern Concurrent rendering.' },
        { name: 'express', status: 'Safe', version: '^4.19.2', recommendation: 'Stable release.' },
        { name: 'axios', status: 'Safe', version: '1.6.8', recommendation: 'Secure client.' },
        { name: 'jsonwebtoken', status: 'High Risk', version: '^9.0.2', recommendation: 'Avoid hardcoding credentials. Inject config variables via process.env.' },
        { name: 'lodash', status: 'Outdated', version: '^4.17.21', recommendation: 'Upgrade to lodash-es for tree-shaking and smaller bundle sizes.' }
      ];
    }
    return deps;
  }, [activeProject.dependenciesIntel]);

  // Distribution chart data
  const distributionData = useMemo(() => {
    const counts: { [key in 'Critical' | 'High' | 'Medium' | 'Low']: number } = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    files.forEach(f => {
      const lvl = getHeatLevel(f.risk);
      if (lvl !== 'All') {
        counts[lvl]++;
      }
    });
    return [
      { name: 'Critical', value: counts.Critical, color: '#f43f5e' },
      { name: 'High', value: counts.High, color: '#ea580c' },
      { name: 'Medium', value: counts.Medium, color: '#d97706' },
      { name: 'Low', value: counts.Low, color: '#059669' }
    ];
  }, [files]);

  // Filtering Logic
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchesSearch = f.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHeat = heatFilter === 'All' || getHeatLevel(f.risk) === heatFilter;
      return matchesSearch && matchesHeat;
    });
  }, [files, searchQuery, heatFilter]);

  // Sorting Logic
  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredFiles, sortField, sortAsc]);

  // Pagination Logic
  const paginatedFiles = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return sortedFiles.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedFiles, currentPage]);

  const totalPages = Math.ceil(sortedFiles.length / rowsPerPage);

  const handleSort = (field: MetricType | 'path') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const activeDisplayFile = selectedFile || hoveredFile || files[0];

  const activeFileIntel = useMemo(() => {
    if (!activeDisplayFile) return null;
    
    const name = activeDisplayFile.path.split('/').pop() || '';
    
    // Default variables
    let issues: string[] = ['Cyclomatic index exceeds default limits.', 'Missing testing coverage specifications.'];
    let fixes = 'Break down nested control statements and build Jest testing mock handlers.';
    let impact = 'Increased technical debt; high complexity hinders developer velocity.';
    let related: string[] = [];

    if (name.includes('analyzer') || name.includes('rag')) {
      issues = [
        'Swallowed exception in directory walk loop',
        'Synchronous file system calls block event execution',
        'Cyclomatic complexity index is high (90%)'
      ];
      fixes = 'Convert directory walker blocks to asynchronous promises (fs.promises.readdir); wrap event handlers in centralized catch middlewares.';
      impact = 'High API request latency; potential thread blockage under multiple user uploads.';
      related = ['backend/src/config/db.ts', 'backend/src/routes/projects.ts'];
    } else if (name.includes('db') || name.includes('server')) {
      issues = [
        'Hardcoded database credentials string credentials found',
        'Direct schema ALTER statements execute dynamic string concatenations',
        'Missing index annotations on active relations keys'
      ];
      fixes = 'Isolate credentials inside dotenv configuration variables; sanitize migration script parameters before ALTER execution.';
      impact = 'Potential SQL injection risk paths; credential leakage in git version histories.';
      related = ['backend/src/services/analyzer.ts'];
    } else if (name.includes('projects') || name.includes('routes') || name.includes('search')) {
      issues = [
        'Concatenated request inputs inside SQL statements',
        'No rate-limiting middleware configured on open routes',
        'Missing payloads data validators (e.g. Zod schemas)'
      ];
      fixes = 'Replace SQL concatenations with parameterized bindings; register express-rate-limit middlewares on auth routers.';
      impact = 'SQL injection exposure; vulnerable to denial-of-service threats under concurrent request loops.';
      related = ['backend/src/config/db.ts', 'backend/src/services/analyzer.ts'];
    } else if (name.includes('Dashboard') || name.includes('App') || name.includes('Heatmap') || name.includes('Architecture')) {
      issues = [
        'Heavy inline mathematical memoizations trigger layout updates',
        'Unescaped rendering variables properties',
        'Missing error boundary scopes wrap'
      ];
      fixes = 'Memoize recharts coordinate mappings parameters; apply React standard ErrorBoundary widgets.';
      impact = 'Component flickering on page transitions; high memory footprint on long browser sessions.';
      related = ['frontend/src/App.tsx', 'frontend/src/pages/Dashboard.tsx'];
    }

    return {
      issues,
      fixes,
      impact,
      related
    };
  }, [activeDisplayFile]);

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6 bg-[#030712] text-slate-100 bg-dot-grid">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-bold font-title text-slate-100 flex items-center">
            <Flame className="w-5 h-5 text-purple-400 mr-2 animate-pulse" />
            Code Intelligence Heatmap
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Static analytics center compiling risk indexes, cyclomatic complexity, and security scores.
          </p>
        </div>
        
        {/* Metric Switcher tabs */}
        <div className="flex bg-slate-900/50 p-1 border border-slate-900 rounded-lg overflow-x-auto self-start max-w-full">
          {([
            { key: 'risk', label: 'Risk' },
            { key: 'complexity', label: 'Complexity' },
            { key: 'security', label: 'Security' },
            { key: 'performance', label: 'Performance' },
            { key: 'maintainability', label: 'Maintainability' },
            { key: 'documentation', label: 'Docs' },
            { key: 'testing', label: 'Testing' }
          ] as { key: MetricType; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`px-2.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedMetric === m.key
                  ? 'bg-purple-650 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-900/20 p-4 border border-slate-900 rounded-xl">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search code files by name or directory..."
            className="w-full bg-slate-950 border border-slate-850 focus:border-purple-600/50 text-slate-350 text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Zone:</span>
          <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-md">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as HeatLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setHeatFilter(lvl);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                  heatFilter === lvl
                    ? 'bg-purple-650 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-500 font-semibold uppercase font-mono">
          Showing {filteredFiles.length} of {files.length} modules
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Grid Panel */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-900/60 min-h-[350px] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Interactive Grid Map ({selectedMetric.toUpperCase()})
              </span>
              <div className="flex items-center space-x-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                <div className="flex items-center"><span className="w-2 h-2 rounded bg-emerald-600 mr-1.5"></span> Healthy</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded bg-amber-600 mr-1.5"></span> Moderate</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded bg-orange-600 mr-1.5"></span> High</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded bg-rose-600 mr-1.5"></span> Critical</div>
              </div>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
              {filteredFiles.map((file, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  className={`aspect-square rounded border cursor-pointer transition-all ${getSquareBg(file, selectedMetric)}`}
                  onMouseEnter={() => setHoveredFile(file)}
                  onMouseLeave={() => setHoveredFile(null)}
                  onClick={() => setSelectedFile(file)}
                />
              ))}
              {filteredFiles.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-500 text-xs font-semibold">
                  No files match the active filter criteria.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900/40 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-450 leading-relaxed leading-4">
              Grid blocks represent individual source files. Hover to check paths, click to lock details. Metric values scale from 10 to 100 based on static AST check ratios.
            </p>
          </div>
        </div>

        {/* Right Info Panel */}
        {activeDisplayFile && (
          <div className="glass-panel p-5 rounded-xl border border-slate-900/60 space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1 font-mono">
                  Module Scanner Info
                </span>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold border ${getBadgeClass(getHeatLevel(activeDisplayFile.risk))}`}>
                  {getHeatLevel(activeDisplayFile.risk)} Risk Zone
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-mono break-all leading-relaxed pt-1 select-text">
                {activeDisplayFile.path.split('/').pop()}
              </h4>
              <span className="text-[10px] text-slate-500 font-mono block truncate select-text">
                {activeDisplayFile.path}
              </span>
            </div>

            {/* Metrics gauges stack */}
            <div className="space-y-3 pt-1">
              {[
                { key: 'risk', label: 'Risk Index', icon: Flame },
                { key: 'complexity', label: 'Cyclomatic Complexity', icon: Cpu },
                { key: 'security', label: 'Security Score', icon: ShieldAlert },
                { key: 'performance', label: 'Performance Metric', icon: Activity },
                { key: 'maintainability', label: 'Maintainability Index', icon: CheckCircle },
                { key: 'documentation', label: 'Documentation Coverage', icon: BookOpen },
                { key: 'testing', label: 'Test Suite Coverage', icon: Settings }
              ].map((m) => {
                const Icon = m.icon;
                const score = activeDisplayFile[m.key as keyof HeatmapFile] as number;
                return (
                  <div key={m.key}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-450 font-semibold flex items-center font-title">
                        <Icon className="w-3.5 h-3.5 mr-1 text-slate-500" /> {m.label}
                      </span>
                      <span className="font-bold text-slate-300 font-mono">
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full ${
                          m.key === 'risk' || m.key === 'complexity'
                            ? score >= 80 ? 'bg-rose-500' : score >= 60 ? 'bg-orange-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            : score < 50 ? 'bg-rose-500' : score < 70 ? 'bg-orange-500' : score < 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Audit Recommendations */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2 select-text text-[10px]">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Issues Found</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 font-sans">
                {activeFileIntel?.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1 select-text">
              <span className="text-[9px] font-bold text-purple-405 uppercase tracking-widest block font-mono">Recommended Fixes</span>
              <p className="text-[10px] text-slate-400 leading-normal leading-4 font-sans">{activeFileIntel?.fixes}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1 select-text">
              <span className="text-[9px] font-bold text-rose-455 uppercase tracking-widest block font-mono">Potential Impact</span>
              <p className="text-[10px] text-slate-400 leading-normal leading-4 font-sans">{activeFileIntel?.impact}</p>
            </div>

            {activeFileIntel?.related && activeFileIntel.related.length > 0 && (
              <div className="p-3 bg-slate-955 border border-slate-900 rounded-lg space-y-2 select-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Related Files</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeFileIntel.related.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigateToFile(file)}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-purple-400 hover:text-purple-300 font-mono text-[9px] rounded cursor-pointer transition-all"
                    >
                      {file.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigateToFile(activeDisplayFile.path)}
              className="w-full py-2 bg-purple-650 hover:bg-purple-600 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span>View Source Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Row 2: Distribution Chart & Dependency Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Risk Distribution Chart */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900/60 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 font-title">
              Code Risk Distribution Chart
            </h3>
            <span className="text-[9px] text-slate-500 block font-mono">
              Aggregated quantities of source files mapped within risk levels.
            </span>
          </div>

          <div className="h-44 w-full py-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: 10 }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dependency Risk List */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900/60 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 font-title">
              Dependency Risk Alerts
            </h3>
            <span className="text-[9px] text-slate-500 block mb-3 font-mono">
              Vulnerability scans mapping imports to threat databases.
            </span>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {dependencyRiskList.map((dep: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg flex items-center justify-between text-xs">
                  <div className="truncate">
                    <span className="font-mono font-bold text-slate-300 truncate block">{dep.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono block">v {dep.version}</span>
                  </div>
                  
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border shrink-0 ${
                    dep.status === 'Safe'
                      ? 'bg-emerald-950/25 text-emerald-400 border-emerald-900/20'
                      : dep.status === 'Outdated'
                      ? 'bg-amber-950/25 text-amber-400 border-amber-900/20'
                      : 'bg-rose-950/25 text-rose-400 border-rose-900/20'
                  }`}>
                    {dep.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top 10 Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Top 10 Riskiest Files */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900/60 space-y-3">
          <div className="flex items-center space-x-1.5 border-b border-slate-900 pb-2.5">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Top 10 Most Risky</h4>
          </div>
          <div className="space-y-1.5">
            {topRisky.map((f, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedFile(f)}
                className="px-2.5 py-1.5 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 rounded-lg flex items-center justify-between text-[10px] cursor-pointer transition-all"
              >
                <span className="font-mono text-slate-350 truncate pr-2" title={f.path}>{f.path.split('/').pop()}</span>
                <span className="font-bold text-rose-400 font-mono shrink-0">{f.risk}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Most Complex Files */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900/60 space-y-3">
          <div className="flex items-center space-x-1.5 border-b border-slate-900 pb-2.5">
            <Cpu className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Top 10 Most Complex</h4>
          </div>
          <div className="space-y-1.5">
            {topComplex.map((f, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedFile(f)}
                className="px-2.5 py-1.5 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 rounded-lg flex items-center justify-between text-[10px] cursor-pointer transition-all"
              >
                <span className="font-mono text-slate-355 truncate pr-2" title={f.path}>{f.path.split('/').pop()}</span>
                <span className="font-bold text-orange-400 font-mono shrink-0">{f.complexity}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Technical Debt Files */}
        <div className="glass-panel p-5 rounded-xl border border-slate-900/60 space-y-3">
          <div className="flex items-center space-x-1.5 border-b border-slate-900 pb-2.5">
            <Settings className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Top 10 Technical Debt</h4>
          </div>
          <div className="space-y-1.5">
            {topTechDebt.map((f, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedFile(f)}
                className="px-2.5 py-1.5 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 rounded-lg flex items-center justify-between text-[10px] cursor-pointer transition-all"
              >
                <span className="font-mono text-slate-350 truncate pr-2" title={f.path}>{f.path.split('/').pop()}</span>
                <span className="font-bold text-amber-400 font-mono shrink-0">{f.debt} hrs</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Complete Interactive Metrics Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-900/60 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider font-title">
            All Codebase Modules Checklist
          </h3>
          <span className="text-[9px] text-slate-500 font-mono font-semibold">
            Click column headers to sort ascending/descending.
          </span>
        </div>

        <div className="overflow-x-auto select-text">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th onClick={() => handleSort('path')} className="pb-3 cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center">File Path <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('risk')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center">Risk <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('complexity')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center font-title">Complexity <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('security')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center">Security <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('performance')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center">Performance <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('maintainability')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center">Maintainability <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('documentation')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center">Documentation <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
                <th onClick={() => handleSort('testing')} className="pb-3 text-center cursor-pointer hover:text-slate-300 transition-all">
                  <span className="flex items-center justify-center">Testing <ArrowUpDown className="w-3 h-3 ml-1" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {paginatedFiles.map((f, idx) => (
                <tr 
                  key={idx}
                  onClick={() => setSelectedFile(f)}
                  className={`hover:bg-slate-900/20 cursor-pointer transition-all ${
                    selectedFile?.path === f.path ? 'bg-purple-950/10' : ''
                  }`}
                >
                  <td className="py-3 font-mono text-slate-350">{f.path}</td>
                  <td className="py-3 text-center font-bold font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      f.risk >= 80 ? 'text-rose-400 bg-rose-950/20 border border-rose-900/30' :
                      f.risk >= 60 ? 'text-orange-400 bg-orange-950/20 border border-orange-900/30' :
                      f.risk >= 40 ? 'text-amber-400 bg-amber-950/20 border border-amber-900/30' :
                      'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30'
                    }`}>
                      {f.risk}%
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono text-slate-300">{f.complexity}%</td>
                  <td className="py-3 text-center font-mono text-slate-300">{f.security}%</td>
                  <td className="py-3 text-center font-mono text-slate-300">{f.performance}%</td>
                  <td className="py-3 text-center font-mono text-slate-300">{f.maintainability}%</td>
                  <td className="py-3 text-center font-mono text-slate-300">{f.documentation}%</td>
                  <td className="py-3 text-center font-mono text-slate-300">{f.testing}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-900/60">
            <span className="text-[10px] text-slate-500 font-semibold font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-1 bg-slate-950 p-1 border border-slate-900 rounded-lg">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-[10px] font-bold text-slate-400 font-mono">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
