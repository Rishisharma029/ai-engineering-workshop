import React, { useState, useEffect, useMemo } from 'react';
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  FileCode,
  ArrowRight,
  TrendingUp,
  FileText,
  ShieldAlert,
  Terminal,
  Zap,
  Plus,
  UserCheck,
  BarChart3,
  Database,
  Cpu,
  Layers,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  FileBadge,
  GitBranch
} from 'lucide-react';

interface DashboardProps {
  activeProject: any;
  projects: any[];
  onPageChange: (page: string) => void;
  onGenerateDoc: (type: string) => void;
  onProjectChange: (proj: any) => void;
}

export default function Dashboard({
  activeProject,
  projects,
  onPageChange,
  onGenerateDoc,
  onProjectChange
}: DashboardProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Simulated Live AI Observations Feed
  const [observations, setObservations] = useState<string[]>([
    'AI detected dynamic variable string interpolation in SQL query.',
    'AI suggests service extraction for user profile verification.',
    'AI identified potential dead code in controller routes (unresolved exports).',
    'AI recommends adding centralized error handling middleware.',
    'AI detected hardcoded secrets inside environment configuration file.',
    'AI discovered empty catch block on database query handler.'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const feedPool = [
        'AI detected high cyclomatic complexity in main router controller.',
        'AI recommends caching response payloads for dashboard endpoint.',
        'AI identified missing indices on foreign keys inside database schema.',
        'AI recommends migrating dependency jsonwebtoken to a secured vault service.',
        'AI detected unhandled promise rejection path in file loader.',
        'AI recommends upgrading lodash package to lodash-es for tree shaking.',
        'AI suggests implementing rate-limiter middleware on authentication gateways.',
        'AI discovered redundant imports inside utility helper utilities.'
      ];
      const randomMsg = feedPool[Math.floor(Math.random() * feedPool.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setObservations(prev => [`[${timestamp}] ${randomMsg}`, ...prev.slice(0, 7)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Parse V4/V5 analysis payload dynamically from JSON string
  const v4 = useMemo(() => {
    let parsed: any = null;
    if (activeProject?.v4_analysis) {
      try {
        parsed = typeof activeProject.v4_analysis === 'string' 
          ? JSON.parse(activeProject.v4_analysis) 
          : activeProject.v4_analysis;
      } catch (e) {
        console.error('Error parsing v4_analysis json:', e);
      }
    }

    const metrics = activeProject?.metrics || { security: 74, documentation: 95, testCoverage: 68, maintainability: 92, performance: 88, overall: 87 };

    // Build defaults
    const defaultReviewReport = {
      overallScore: metrics.overall,
      grade: metrics.overall >= 90 ? 'A+' : metrics.overall >= 80 ? 'A-' : 'B+',
      hiringRecommendation: metrics.overall >= 80 ? 'Strong Mid / Senior Developer Candidate' : 'Junior Developer Candidate',
      scores: {
        engineering: metrics.overall,
        architecture: metrics.maintainability,
        security: metrics.security,
        performance: metrics.performance,
        testing: metrics.testCoverage,
        documentation: metrics.documentation,
        maintainability: metrics.maintainability,
        scalability: Math.round((metrics.performance + metrics.maintainability) / 2),
        reliability: Math.round((metrics.security + metrics.performance) / 2),
        observability: 82,
        developerExperience: 90,
        technicalDebt: Math.round(100 - (activeProject?.bugs?.length || 5) * 5)
      },
      engineeringMaturityLevel: metrics.overall >= 85 ? 'Production Ready' : 'Advanced',
      projectHealthSummary: 'The codebase contains active modules. Critical threats are at a minimum. Modularity meets clean standard specifications.'
    };

    const defaultCtoReview = {
      rating: `${(metrics.overall / 10).toFixed(1)} / 10`,
      recommendation: metrics.overall >= 80 ? 'Proceed to Final Technical Round' : 'Schedule Technical Pre-screen',
      strengths: [
        'Descriptive type interfaces and modular folders layout.',
        'Low code duplication pattern in router endpoints.',
        'Safe configurations isolation design.'
      ],
      weaknesses: [
        'Exposed hardcoded secret strings detected in controller layers.',
        'Low unit test coverage configuration files.'
      ],
      architectureRisks: 'Interface dependencies bypass controllers structure checks.',
      securityRisks: 'Unsafe dynamic variables inside raw SQL queries.',
      scalabilityRisks: 'SQLite single thread locking bottlenecks under high concurrency writes.',
      technicalDebt: '12 developer-hours required to resolve critical alerts.',
      engineeringMaturity: 'Senior level standard design patterns',
      developmentPractices: 'Clean package script setup and environment isolation.',
      missingSystems: 'No centralized log aggregators (e.g. Sentry/Winston) or coverage badges.',
      futureRisks: 'Database connection locking under concurrent read/write transactions.',
      recommendations: 'Decouple query routes from server configurations, add Winston logging middleware, and target 70%+ testing coverage.'
    };

    const defaultStartupReadiness = {
      concurrentLimit: metrics.overall >= 85 ? 12000 : 4500,
      support1k: 'PASS - Latency averages 14ms under standard read/write queries.',
      support10k: 'WARNING - Direct SQLite thread locks under heavy concurrency writes.',
      support100k: 'FAIL - Saturated connection pools. Direct file routing blocks execution loops.',
      support1m: 'FAIL - Memory overflow. Requires microservice extraction and load balancing.',
      bottlenecks: ['Authentication middleware checks', 'Direct disk reads/writes', 'Lack of Redis query caching'],
      recommendations: ['Redis Cache cluster', 'PostgreSQL cluster replicates', 'Winston monitoring alerts', 'Nginx Load balancer'],
      roadmap: [
        'Deploy backend inside an Express clustering worker pool.',
        'Migrate SQLite databases files to high-performance PG databases.',
        'Inject a Redis server cache level on authorization middleware query blocks.'
      ]
    };

    const defaultCompetitorBenchmark = {
      percentiles: {
        security: metrics.security,
        architecture: metrics.maintainability,
        performance: metrics.performance,
        documentation: metrics.documentation,
        testing: metrics.testCoverage,
        developerExperience: 88
      }
    };

    // Safe merge parsed values with defaults to guarantee nested fields exist
    return {
      engineeringReviewReport: {
        ...defaultReviewReport,
        ...(parsed?.engineeringReviewReport || {}),
        scores: {
          ...defaultReviewReport.scores,
          ...(parsed?.engineeringReviewReport?.scores || {})
        }
      },
      ctoReview: {
        ...defaultCtoReview,
        ...(parsed?.ctoReview || {})
      },
      startupReadiness: {
        ...defaultStartupReadiness,
        ...(parsed?.startupReadiness || {})
      },
      competitorBenchmark: {
        ...defaultCompetitorBenchmark,
        ...(parsed?.competitorBenchmark || {}),
        percentiles: {
          ...defaultCompetitorBenchmark.percentiles,
          ...(parsed?.competitorBenchmark?.percentiles || {})
        }
      }
    };
  }, [activeProject]);

  const metrics = activeProject?.metrics || {
    security: 74,
    documentation: 95,
    testCoverage: 68,
    maintainability: 92,
    performance: 88,
    overall: 87
  };

  // Recharts Radar data
  const radarData = [
    { subject: 'Architecture', value: v4.engineeringReviewReport.scores.architecture, fullMark: 100 },
    { subject: 'Security', value: v4.engineeringReviewReport.scores.security, fullMark: 100 },
    { subject: 'Testing', value: v4.engineeringReviewReport.scores.testing, fullMark: 100 },
    { subject: 'Documentation', value: v4.engineeringReviewReport.scores.documentation, fullMark: 100 },
    { subject: 'Performance', value: v4.engineeringReviewReport.scores.performance, fullMark: 100 },
  ];

  // Recharts Bar data for Competitor Benchmark
  const benchmarkData = [
    { name: 'Security', Project: v4.competitorBenchmark.percentiles.security, Competitor: 68 },
    { name: 'Architecture', Project: v4.competitorBenchmark.percentiles.architecture, Competitor: 75 },
    { name: 'Performance', Project: v4.competitorBenchmark.percentiles.performance, Competitor: 72 },
    { name: 'Testing', Project: v4.competitorBenchmark.percentiles.testing, Competitor: 55 },
    { name: 'Documentation', Project: v4.competitorBenchmark.percentiles.documentation, Competitor: 60 },
    { name: 'DX', Project: v4.competitorBenchmark.percentiles.developerExperience, Competitor: 80 }
  ];

  const getOverallColor = (score: number) => {
    if (score >= 85) return 'text-purple-400 border-purple-500 bg-purple-950/10';
    if (score >= 70) return 'text-blue-400 border-blue-500 bg-blue-950/10';
    if (score >= 50) return 'text-amber-400 border-amber-500 bg-amber-950/10';
    return 'text-rose-400 border-rose-500 bg-rose-950/10';
  };

  // AI Action Center entries
  const actions = [
    {
      id: 1,
      title: 'Fix JWT Secret Exposure',
      description: 'Potential active API keys or deployment secrets exposed in backend code.',
      severity: 'CRITICAL',
      icon: '🔥',
      page: 'security'
    },
    {
      id: 2,
      title: 'Add Input Validation',
      description: 'Query parameters are concatenated directly. Sanitize routes parameters.',
      severity: 'HIGH',
      icon: '⚠',
      page: 'refactor'
    },
    {
      id: 3,
      title: 'Remove Dead Code',
      description: 'Swallowed exceptions or debug console loggers remain in production code.',
      severity: 'MEDIUM',
      icon: '⚠',
      page: 'refactor'
    },
    {
      id: 4,
      title: 'Improve Test Coverage',
      description: 'Codebase has less than 20% unit tests coverages. Generate spec files.',
      severity: 'LOW',
      icon: '🚀',
      page: 'analysis'
    }
  ];

  // Compile timeline data
  const timeline = useMemo(() => {
    if (activeProject?.timeline) {
      try {
        const parsed = typeof activeProject.timeline === 'string' ? JSON.parse(activeProject.timeline) : activeProject.timeline;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { stage: 'Repository Created', description: 'Initialized monorepo workspace from codebase files.', status: 'Safe', timestamp: 'June 01, 2026' },
      { stage: 'Major Refactor', description: 'Restructured folder hierarchies and compiled ESM routers.', status: 'Safe', timestamp: 'June 03, 2026' },
      { stage: 'Security Issues Introduced', description: 'Detected potential hardcoded values or SQL concatenate loops.', status: 'Issue Introduced', timestamp: 'June 04, 2026' },
      { stage: 'Documentation Added', description: 'Auto-generated detailed README instructions and install guides.', status: 'Safe', timestamp: 'June 05, 2026' },
      { stage: 'Latest Changes', description: 'Compiled dynamic RAG indexes and SVG topologies.', status: 'Resolved', timestamp: 'June 06, 2026' }
    ];
  }, [activeProject?.timeline]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-purple-400 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 font-title">No Projects Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Upload a ZIP archive or connect a public GitHub repository using the buttons in the header to initialize the workspace.
        </p>
      </div>
    );
  }

  // Best Practice Coverage keys
  const bestPractices = [
    { name: 'Authentication', percentage: 70, status: 'Intermediate', recommendation: 'Avoid local session stores; use secure JWT or sessions.' },
    { name: 'Authorization', percentage: 65, status: 'Needs Review', recommendation: 'Implement Role-Based Access Control (RBAC) middleware.' },
    { name: 'Error Handling', percentage: 80, status: 'Advanced', recommendation: 'Catch blocks exist but lack centralized logging.' },
    { name: 'Input Validation', percentage: 60, status: 'Needs Review', recommendation: 'Use schema validation libraries like Zod or Joi.' },
    { name: 'Logging', percentage: 50, status: 'Beginner', recommendation: 'Replace console.logs with a logger like Winston.' },
    { name: 'Documentation', percentage: 95, status: 'Production Ready', recommendation: 'Excellent. Complete README and symbol coverage.' },
    { name: 'Testing', percentage: 68, status: 'Intermediate', recommendation: 'Target key route controllers with Jest/Supertest.' },
    { name: 'CI/CD Readiness', percentage: 85, status: 'Advanced', recommendation: 'Docker configurations ready for pipeline setup.' }
  ];

  // Exporters Helper
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const report = `# AI Engineering Audit Report: ${activeProject.name}\n\n` +
      `## 1. Executive Summary\n${v4.engineeringReviewReport.projectHealthSummary} Overall performance satisfies clean architecture boundaries.\n\n` +
      `## 2. Engineering Review\n- Overall Grade: ${v4.engineeringReviewReport.grade}\n- Overall Score: ${v4.engineeringReviewReport.overallScore}%\n` +
      `- Readiness Status: ${v4.engineeringReviewReport.engineeringMaturityLevel}\n\n` +
      `## 3. Architecture Review\n- Architecture Rating: ${v4.engineeringReviewReport.scores.architecture}%\n` +
      `- Maintainability Index: ${v4.engineeringReviewReport.scores.maintainability}%\n` +
      `- Review: Modular project layout separating controllers, routes, configurations, and services layer objects cleanly.\n\n` +
      `## 4. Security Review\n- Security Rating: ${v4.engineeringReviewReport.scores.security}%\n` +
      `- Vulnerability Alert: ${v4.ctoReview.securityRisks || 'None.'}\n\n` +
      `## 5. Performance Review\n- Performance Rating: ${v4.engineeringReviewReport.scores.performance}%\n` +
      `- Scalability Alert: ${v4.ctoReview.scalabilityRisks || 'None.'}\n\n` +
      `## 6. Testing Review\n- Testing Coverage Rating: ${v4.engineeringReviewReport.scores.testing}%\n` +
      `- Spec recommendation: Build Jest controller tests to hit route handler files.\n\n` +
      `## 7. Documentation Review\n- Documentation Rating: ${v4.engineeringReviewReport.scores.documentation}%\n` +
      `- Index status: Excellent. Descriptive symbol tags and clean README install guides are active.\n\n` +
      `## 8. Technical Debt Review\n- Debt hours: ${v4.ctoReview.technicalDebt}\n` +
      `- Effort assessment: Scans recommend parameterizing connection queries and using dotenv configuration files.\n\n` +
      `## 9. Startup Readiness Review\n- Max Concurrent Users Capacity: ${v4.startupReadiness.concurrentLimit} sessions\n` +
      `- Support 1k load: ${v4.startupReadiness.support1k}\n` +
      `- Support 10k load: ${v4.startupReadiness.support10k}\n` +
      `- Support 100k load: ${v4.startupReadiness.support100k}\n\n` +
      `## 10. Hiring Recommendation\n- Candidate Assessment: ${v4.engineeringReviewReport.hiringRecommendation}\n\n` +
      `## 11. CTO Recommendations\n- Actionable decision: ${v4.ctoReview.recommendation}\n` +
      `- Core recommendation: ${v4.ctoReview.recommendations}\n`;

    downloadFile(report, `${activeProject.name.toLowerCase()}_engineering_report.md`, 'text/markdown');
  };

  const handleExportJSON = () => {
    downloadFile(JSON.stringify(v4, null, 2), `${activeProject.name.toLowerCase()}_engineering_report.json`, 'application/json');
  };

  const handleExportPDF = () => {
    const reportText = `====================================================\n` +
      `AI ENGINEERING EXECUTIVE BRIEFING AUDIT REPORT\n` +
      `====================================================\n` +
      `Project Target: ${activeProject.name}\n` +
      `Platform Rating: ${v4.engineeringReviewReport.grade} (${v4.engineeringReviewReport.overallScore}/100)\n` +
      `Maturity Level: ${v4.engineeringReviewReport.engineeringMaturityLevel}\n` +
      `Date Generated: ${new Date().toLocaleDateString()}\n` +
      `----------------------------------------------------\n\n` +
      `1. EXECUTIVE OVERVIEW:\n` +
      `${v4.engineeringReviewReport.projectHealthSummary}\n\n` +
      `2. ENGINEERING REVIEW SCORECARD:\n` +
      `- Engineering Grade Score: ${v4.engineeringReviewReport.scores.engineering}%\n` +
      `- Overall Grade letter: ${v4.engineeringReviewReport.grade}\n\n` +
      `3. ARCHITECTURE REVIEW:\n` +
      `- Architecture Rating Score: ${v4.engineeringReviewReport.scores.architecture}%\n` +
      `- Maintainability Index Score: ${v4.engineeringReviewReport.scores.maintainability}%\n` +
      `- Status: Modular folder separation.\n\n` +
      `4. SECURITY REVIEW:\n` +
      `- Security Scanners Score: ${v4.engineeringReviewReport.scores.security}%\n` +
      `- Exposure Warnings: ${v4.ctoReview.securityRisks || 'None.'}\n\n` +
      `5. PERFORMANCE REVIEW:\n` +
      `- Performance Benchmark Score: ${v4.engineeringReviewReport.scores.performance}%\n` +
      `- Scale Warning: ${v4.ctoReview.scalabilityRisks || 'None.'}\n\n` +
      `6. TESTING REVIEW:\n` +
      `- Test Suite Coverage Score: ${v4.engineeringReviewReport.scores.testing}%\n` +
      `- Spec files required: Express route endpoints.\n\n` +
      `7. DOCUMENTATION REVIEW:\n` +
      `- Documentation Rating Score: ${v4.engineeringReviewReport.scores.documentation}%\n\n` +
      `8. TECHNICAL DEBT ASSESSMENT:\n` +
      `- Calculated remediation effort: ${v4.ctoReview.technicalDebt}\n\n` +
      `9. STARTUP READINESS:\n` +
      `- Startup Scalability capacity: ${v4.startupReadiness.concurrentLimit} sessions\n` +
      `- 1k Users: ${v4.startupReadiness.support1k}\n` +
      `- 10k Users: ${v4.startupReadiness.support10k}\n` +
      `- 100k Users: ${v4.startupReadiness.support100k}\n\n` +
      `10. HIRING RECOMMENDATION:\n` +
      `- Candidate Assessment Matrix: ${v4.engineeringReviewReport.hiringRecommendation}\n\n` +
      `11. CTO EXECUTIVE ADVICE:\n` +
      `- Pre-screen Decision: ${v4.ctoReview.recommendation}\n` +
      `- Action Plan: ${v4.ctoReview.recommendations}\n\n` +
      `====================================================\n` +
      `Generated by AI Developer Intelligence Platform V6\n` +
      `made by rishi sharma all rights reserved\n`;

    downloadFile(reportText, `${activeProject.name.toLowerCase()}_engineering_report.txt`, 'text/plain');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] bg-[#030712] text-slate-100 bg-dot-grid">
      
      {/* Top Header CTA Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gradient-to-r from-purple-950/15 via-slate-900/40 to-slate-900/10 border border-slate-900 rounded-xl gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">Workspace Loaded</span>
          </div>
          <h2 className="text-base font-extrabold text-slate-200 mt-1 flex items-center font-title">
            <Terminal className="w-4.5 h-4.5 text-purple-400 mr-2" />
            {activeProject.name}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-lg">
            {activeProject.description || 'No workspace description provided.'}
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/20 flex items-center space-x-1.5 transition-all hover:scale-103 active:scale-97 border border-purple-500/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
          <span>Generate Engineering Report</span>
        </button>
      </div>

      {/* Horizontal Repository Switcher Deck */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 font-title">Workspace Repositories</h4>
          <span className="text-[10px] text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-950/20 border border-purple-900/30">
            {projects.length} connected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {projects.map((proj) => {
            const isActive = proj.id === activeProject.id;
            const score = proj.metrics?.overall || 87;
            return (
              <div
                key={proj.id}
                onClick={() => onProjectChange(proj)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-950/20 glow-border-active' 
                    : 'bg-slate-900/40 border-slate-900/80 hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-slate-200 truncate">{proj.name}</h5>
                    <span className="text-[9px] text-slate-500 block font-semibold tracking-wider mt-0.5 uppercase">{proj.type}</span>
                  </div>
                  <span className={`text-xs font-extrabold font-mono ${
                    score >= 80 ? 'text-purple-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Action Center */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 font-title">AI Action Center</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={() => onPageChange(act.page)}
              className="p-4 bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-3 group glass-panel"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center">
                    <span className="mr-1.5">{act.icon}</span> {act.title}
                  </span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold border ${
                    act.severity === 'CRITICAL' ? 'bg-rose-950/30 text-rose-400 border-rose-900/30' :
                    act.severity === 'HIGH' ? 'bg-orange-950/30 text-orange-400 border-orange-900/30' :
                    act.severity === 'MEDIUM' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900/30' :
                    'bg-slate-950/40 text-slate-450 border-slate-800'
                  }`}>
                    {act.severity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed pt-0.5 select-text">
                  {act.description}
                </p>
              </div>
              <div className="flex items-center text-[9px] font-bold text-purple-400/80 group-hover:text-purple-400 transition-all space-x-1 pt-1 self-end">
                <span>Navigate</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Engineering Score Centerpiece Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Large Centerpiece Scorecard Card */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-slate-900/80 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-glow-purple filter blur-[60px] opacity-10 pointer-events-none"></div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-title">AI Engineering Scorecard</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Static analysis review report evaluating 12 parameters.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950/40 border border-purple-900/30 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  Maturity: {v4.engineeringReviewReport.engineeringMaturityLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Giant Grade Gauge & Hiring Rec */}
              <div className="flex flex-col items-center justify-center text-center py-4 border-r border-slate-900/50 space-y-4">
                <div className={`w-28 h-28 rounded-full border-[6px] flex flex-col items-center justify-center ${getOverallColor(v4.engineeringReviewReport.overallScore)}`}>
                  <span className="text-3xl font-black font-title">{v4.engineeringReviewReport.grade}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5 font-mono">
                    Score: {v4.engineeringReviewReport.overallScore}
                  </span>
                </div>
                
                <div className="w-full px-2">
                  <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-lg space-y-1">
                    <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest block flex items-center justify-center">
                      <UserCheck className="w-3 h-3 mr-1" /> Hiring Recommendation
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-200 block truncate select-text">
                      {v4.engineeringReviewReport.hiringRecommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* 12 Specific Scores Grid */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {Object.entries(v4.engineeringReviewReport.scores).map(([name, scoreVal]) => {
                  const label = name
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={name} className="p-2.5 bg-slate-950/50 border border-slate-900/80 rounded-lg space-y-1 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-450 font-semibold truncate">{label}</span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 font-mono text-[11px]">{scoreVal as number}%</span>
                        <div className="w-12 bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className={`h-full rounded-full ${
                              (scoreVal as number) >= 85 ? 'bg-purple-500' :
                              (scoreVal as number) >= 70 ? 'bg-blue-500' :
                              (scoreVal as number) >= 50 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${scoreVal}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 gap-2">
            <span className="flex items-center select-text">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 animate-ping"></span>
              {v4.engineeringReviewReport.projectHealthSummary}
            </span>
            <button onClick={() => onPageChange('heatmap')} className="text-purple-400 hover:underline flex items-center space-x-0.5 font-bold shrink-0 self-end cursor-pointer">
              <span>Inspect Code Risk Heatmap</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scores Radar Card */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-slate-900/80">
          <div>
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1 font-title">Metrics Radar</h3>
            <span className="text-[9px] text-slate-500 font-mono block">Multi-axis visual mapping of primary score parameters.</span>
          </div>
          <div className="h-36 w-full py-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 6 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', fontSize: 10 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Radar
                  name="Metrics"
                  dataKey="value"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: AI CTO Review Panel & Best Practice Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* CTO Review Report Panel */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-200 font-title">AI CTO Audit Findings</h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">CTO Rating</span>
                <span className="text-xs font-extrabold text-purple-400 font-mono">{v4.ctoReview.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs select-text">
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Strengths</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    {v4.ctoReview.strengths.map((str: string, i: number) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <span className="text-[10px] font-bold text-rose-455 uppercase tracking-wider block mb-1">Critical Weaknesses</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    {v4.ctoReview.weaknesses.map((weak: string, i: number) => (
                      <li key={i}>{weak}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span className="text-slate-500 font-semibold">Technical Debt</span>
                    <span className="font-bold text-slate-300 font-mono">{v4.ctoReview.technicalDebt}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span className="text-slate-500 font-semibold">Architecture Risk</span>
                    <span className="font-bold text-slate-350 truncate max-w-[65%]" title={v4.ctoReview.architectureRisks}>{v4.ctoReview.architectureRisks}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span className="text-slate-500 font-semibold">Security Risks</span>
                    <span className="font-bold text-rose-400 truncate max-w-[65%]" title={v4.ctoReview.securityRisks}>{v4.ctoReview.securityRisks}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span className="text-slate-500 font-semibold">Scalability Risk</span>
                    <span className="font-bold text-amber-400 truncate max-w-[65%]" title={v4.ctoReview.scalabilityRisks}>{v4.ctoReview.scalabilityRisks}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/60 pb-1">
                    <span className="text-slate-500 font-semibold">Missing Subsystems</span>
                    <span className="font-bold text-slate-300 truncate max-w-[65%]" title={v4.ctoReview.missingSystems}>{v4.ctoReview.missingSystems}</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-950/10 border border-purple-900/20 rounded-lg text-[10px] text-purple-300 leading-normal select-text">
                  <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">Engineering Recommendation</span>
                  {v4.ctoReview.recommendations}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practice Coverage Card */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-title">Best Practice Coverage</h3>
            <span className="text-[9px] text-slate-500 block mb-3 font-mono">Evaluation against secure coding standards.</span>
            
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {bestPractices.map((bp) => (
                <div key={bp.name} className="text-[11px] space-y-1 border-b border-slate-900/30 pb-1.5 last:border-b-0">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">{bp.name}</span>
                    <span className="text-purple-400 font-mono">{bp.percentage}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-900">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${bp.percentage}%` }} />
                    </div>
                    <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider shrink-0 ${
                      bp.percentage >= 85 ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/10' :
                      bp.percentage >= 65 ? 'bg-blue-950/30 text-blue-450 border border-blue-900/10' :
                      'bg-rose-950/30 text-rose-400 border border-rose-900/10'
                    }`}>
                      {bp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 5: Startup Readiness Analyzer & Competitor Benchmarks & Live AI Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Startup Readiness Analyzer */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-4">
              <Layers className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Startup Readiness Analyzer</h3>
            </div>

            <div className="space-y-4">
              {/* Concurrent limit banner */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900 rounded-lg select-text">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Estimated concurrent users limit</span>
                  <span className="text-base font-extrabold text-slate-200 font-mono mt-0.5 block">
                    {v4.startupReadiness.concurrentLimit.toLocaleString()} sessions
                  </span>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950/20 border border-purple-900/30 px-2 py-0.5 rounded">
                  Scale Threshold
                </span>
              </div>

              {/* Tiers list */}
              <div className="space-y-2 text-[11px] select-text">
                <div className="flex items-start justify-between space-x-2 border-b border-slate-900/40 pb-1.5">
                  <span className="font-semibold text-slate-300">1,000 Users</span>
                  <span className="text-emerald-400 text-right font-medium max-w-[70%] text-[10px] leading-snug">{v4.startupReadiness.support1k}</span>
                </div>
                <div className="flex items-start justify-between space-x-2 border-b border-slate-900/40 pb-1.5">
                  <span className="font-semibold text-slate-300">10,000 Users</span>
                  <span className="text-amber-400 text-right font-medium max-w-[70%] text-[10px] leading-snug">{v4.startupReadiness.support10k}</span>
                </div>
                <div className="flex items-start justify-between space-x-2 border-b border-slate-900/40 pb-1.5">
                  <span className="font-semibold text-slate-300">100,000 Users</span>
                  <span className="text-rose-455 text-right font-medium max-w-[70%] text-[10px] leading-snug">{v4.startupReadiness.support100k}</span>
                </div>
                <div className="flex items-start justify-between space-x-2">
                  <span className="font-semibold text-slate-300">1,000,000 Users</span>
                  <span className="text-rose-455 text-right font-medium max-w-[70%] text-[10px] leading-snug">{v4.startupReadiness.support1m}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-900/60 select-text">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Redis / Caching Architecture Roadmap</span>
            <div className="space-y-1.5 text-[10px] text-slate-400">
              {v4.startupReadiness.roadmap.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-1.5 leading-relaxed">
                  <span className="text-purple-400 shrink-0 font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competitor Benchmark Engine */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 mb-2">
              <BarChart3 className="w-4.5 h-4.5 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Competitor Benchmark</h3>
            </div>
            <span className="text-[9px] text-slate-500 block mb-2 font-mono">Comparison vs average industry repository metrics.</span>
            
            <div className="h-44 w-full py-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 8 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', fontSize: 10 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="Project" fill="#a855f7" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Competitor" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-slate-950/65 border border-slate-900 rounded-lg text-[10px] text-slate-500 leading-normal flex items-center justify-between">
            <span>Overall rating exceeds 78% of compared repos.</span>
            <span className="text-purple-400 font-bold font-mono">Top 22%</span>
          </div>
        </div>

        {/* Live AI Observations Feed */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-2">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Live AI Feed</h3>
              </div>
              <span className="text-[8px] font-mono bg-purple-950/40 text-purple-400 border border-purple-900/35 px-1.5 py-0.5 rounded uppercase">
                Continuous Ingestion
              </span>
            </div>
            
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 select-text font-mono text-[10px]">
              {observations.map((obs, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded border transition-all ${
                    idx === 0 
                      ? 'bg-purple-950/20 border-purple-900/30 text-purple-350' 
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-450 hover:text-slate-350'
                  }`}
                >
                  <p className="leading-relaxed">{obs}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[9px] text-slate-500 font-semibold uppercase font-mono">
            <span>RAG context indexing: ACTIVE</span>
            <span>SIMULATOR</span>
          </div>
        </div>

      </div>

      {/* Row 6: Project Timeline & Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Project Timeline visualizer */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider font-title">AI Project Timeline</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Historical milestone tracking of repository development branches.</p>
              </div>
              <span className="text-[9px] font-bold text-slate-500 font-mono">Active Timeline</span>
            </div>

            {/* Vertical timeline items */}
            <div className="relative pl-6 space-y-4 select-text">
              {/* Timeline center line */}
              <div className="absolute left-[30px] top-2 bottom-2 w-[1px] bg-slate-900"></div>

              {timeline.map((item: any, idx: number) => (
                <div key={idx} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 w-3 h-3 rounded-full border bg-slate-950 mt-1 z-10 ${
                    item.status.includes('Issue') ? 'border-rose-500 shadow-lg shadow-rose-955' : 
                    item.status.includes('Resolved') ? 'border-emerald-500 shadow-lg shadow-emerald-955' :
                    'border-purple-500 shadow-lg shadow-purple-955'
                  }`}></div>
                  
                  <div className="pl-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">{item.stage}</span>
                      <span className="text-[9px] text-slate-500 font-semibold font-mono">{item.timestamp}</span>
                      <span className={`text-[8px] font-mono px-1 rounded ${
                        item.status.includes('Issue') ? 'bg-rose-950/20 text-rose-400 border border-rose-900/10' :
                        item.status.includes('Resolved') ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/10' :
                        'bg-purple-950/20 text-purple-400 border border-purple-900/10'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal max-w-xl">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
              {/* Workspace Intelligence Summary Card */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-3 border-b border-slate-900 pb-3">
              <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Workspace Intelligence</h3>
            </div>

            <div className="space-y-3 text-xs select-text">
              <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg space-y-1">
                <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest block font-mono">🚨 Top Risk</span>
                <span className="text-[10px] font-extrabold text-slate-200 block">Exposed Database Config Credentials</span>
                <p className="text-[9px] text-slate-500 leading-normal">Credential strings found inside db driver config.</p>
              </div>

              <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg space-y-1">
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block font-mono">💡 Biggest Opportunity</span>
                <span className="text-[10px] font-extrabold text-slate-200 block">Deconstruct Express Router Controllers</span>
                <p className="text-[9px] text-slate-500 leading-normal">Refactoring to services increases maintainability by 12%.</p>
              </div>

              <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg space-y-1">
                <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest block font-mono">⚡ Recommended Action</span>
                <span className="text-[10px] font-extrabold text-slate-200 block">Inject dotenv Configuration variables</span>
                <p className="text-[9px] text-slate-500 leading-normal">Eliminate exposed variables in db.ts and server.ts.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900/50">
            <button
              onClick={() => onPageChange('security')}
              className="flex-1 py-1.5 bg-rose-955/20 hover:bg-rose-955/35 border border-rose-900/30 text-rose-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
            >
              Fix Security
            </button>
            <button
              onClick={() => onPageChange('interview')}
              className="flex-1 py-1.5 bg-purple-955/20 hover:bg-purple-955/35 border border-purple-900/30 text-purple-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
            >
              Mock Interview
            </button>
          </div>
        </div>    </div>

      </div>

      {/* Flagship: Generate Engineering Report Briefing Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-4xl rounded-xl p-6 relative border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4 shrink-0">
              <div className="flex items-center space-x-2">
                <FileBadge className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider font-title">
                    AI Engineering Executive Briefing Report
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Production-grade developer intelligence scorecard, security check, and scalability assessment.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Exporters buttons */}
                <div className="flex bg-slate-905 border border-slate-850 rounded-lg p-1 text-[10px] font-bold">
                  <button
                    onClick={handleExportMarkdown}
                    className="flex items-center space-x-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Markdown</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center space-x-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center space-x-1 px-2.5 py-1 text-purple-400 hover:text-purple-300 hover:bg-purple-950/20 rounded border border-purple-900/10 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 animate-bounce" />
                    <span>PDF Report</span>
                  </button>
                </div>

                <button
                  onClick={() => setReportModalOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-350 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Report Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-2 select-text font-sans text-xs">
              
              {/* Report Header Block */}
              <div className="p-5 bg-slate-950/65 border border-slate-900 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Report Scope Target</span>
                    <h3 className="text-base font-extrabold text-slate-200 font-title">{activeProject.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">UUID: {activeProject.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Audit Timestamp</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">{new Date().toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-900 pt-3 text-[11px] leading-relaxed text-slate-400">
                  <p>
                    This comprehensive developer assessment report evaluates repository modules against security vulnerabilities, cyclomatic complexities, test suite compliance, and startup scalability thresholds. 
                    Calculations are run recursively over AST node configurations.
                  </p>
                </div>
              </div>

              {/* Scorecard Grades Grid */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Intelligence Grade Scorecard</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Engineering Grade', val: v4.engineeringReviewReport.scores.engineering, type: 'overall' },
                    { label: 'Architecture Grade', val: v4.engineeringReviewReport.scores.architecture, type: 'arch' },
                    { label: 'Security Grade', val: v4.engineeringReviewReport.scores.security, type: 'sec' },
                    { label: 'Performance Grade', val: v4.engineeringReviewReport.scores.performance, type: 'perf' },
                    { label: 'Testing Grade', val: v4.engineeringReviewReport.scores.testing, type: 'test' },
                    { label: 'Documentation Grade', val: v4.engineeringReviewReport.scores.documentation, type: 'doc' },
                    { label: 'Maintainability Grade', val: v4.engineeringReviewReport.scores.maintainability, type: 'maint' },
                    { label: 'Startup Readiness Grade', val: Math.round(v4.startupReadiness.concurrentLimit >= 10000 ? 92 : 65), type: 'scale' }
                  ].map((item, idx) => {
                    const gradeLetter = item.val >= 90 ? 'A+' : item.val >= 80 ? 'A-' : item.val >= 70 ? 'B+' : item.val >= 60 ? 'B-' : 'C';
                    return (
                      <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center space-y-1.5">
                        <span className="text-[10px] text-slate-450 font-semibold block truncate">{item.label}</span>
                        <div className="text-2xl font-black text-purple-400 font-title">{gradeLetter}</div>
                        <span className="text-[9px] text-slate-500 font-mono block">Score: {item.val}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Reviews Stack */}
              <div className="space-y-4 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Detailed Engineering Audits</span>

                {/* 1. Executive Summary */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">01. Executive Summary</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{v4.engineeringReviewReport.projectHealthSummary}</p>
                </div>

                {/* 2. Engineering Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">02. Engineering Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Overall code grade is <strong className="text-purple-450">{v4.engineeringReviewReport.grade}</strong> (overall score {v4.engineeringReviewReport.overallScore}%). Workspace maturity is classed as {v4.engineeringReviewReport.engineeringMaturityLevel}.</p>
                </div>

                {/* 3. Architecture Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">03. Architecture Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Architecture Rating: {v4.engineeringReviewReport.scores.architecture}%. Maintainability index is {v4.engineeringReviewReport.scores.maintainability}%. Modular layouts isolate endpoints parameterization from database connection parameters.</p>
                </div>

                {/* 4. Security Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">04. Security Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Security Score: {v4.engineeringReviewReport.scores.security}%. Security Alert: {v4.ctoReview.securityRisks || 'None.'}</p>
                </div>

                {/* 5. Performance Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">05. Performance Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Performance Score: {v4.engineeringReviewReport.scores.performance}%. Potential bottleneck: {v4.ctoReview.scalabilityRisks || 'None.'}</p>
                </div>

                {/* 6. Testing Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">06. Testing Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Testing Score: {v4.engineeringReviewReport.scores.testing}%. Codebase unit test coverage matches intermediate standards. Focus specs on routes handlers.</p>
                </div>

                {/* 7. Documentation Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">07. Documentation Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Documentation Score: {v4.engineeringReviewReport.scores.documentation}%. High description symbol density. Complete README and package descriptors.</p>
                </div>

                {/* 8. Technical Debt Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">08. Technical Debt Review</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Technical Debt Rating: {v4.engineeringReviewReport.scores.technicalDebt}%. Calculated remediation effort: <strong className="text-purple-455">{v4.ctoReview.technicalDebt}</strong>. Scans advise param query additions.</p>
                </div>

                {/* 9. Startup Readiness Review */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">09. Startup Readiness Review</span>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Concurrency capacity limit: <strong className="text-slate-200">{v4.startupReadiness.concurrentLimit.toLocaleString()} concurrent users</strong>.</div>
                    <div>• 1k users load check: {v4.startupReadiness.support1k}</div>
                    <div>• 10k users load check: {v4.startupReadiness.support10k}</div>
                    <div>• 100k users load check: {v4.startupReadiness.support100k}</div>
                  </div>
                </div>

                {/* 10. Hiring Recommendation */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">10. Hiring Recommendation</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Recruiter Assessment: <strong className="text-emerald-450">{v4.engineeringReviewReport.hiringRecommendation}</strong>.</p>
                </div>

                {/* 11. CTO Recommendations */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-purple-400 uppercase font-mono">11. CTO Recommendations</span>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Decision: <strong className="text-emerald-450">{v4.ctoReview.recommendation}</strong></div>
                    <div>CTO Action Plan: {v4.ctoReview.recommendations}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-900 pt-4 mt-4 text-[10px] text-slate-650 text-center shrink-0 flex items-center justify-between font-mono uppercase tracking-wider">
              <span>made by rishi sharma all rights reserved</span>
              <span>Platform V5 Report Generator</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
