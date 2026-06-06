import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  ArrowRight, 
  BookOpen, 
  Award, 
  Sliders, 
  RefreshCw, 
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Layers,
  History,
  TrendingUp,
  AwardIcon,
  ShieldCheck
} from 'lucide-react';

interface InterviewQuestion {
  question: string;
  expected: string;
  category: 'Architecture' | 'Security' | 'System Design' | 'Behavioral' | 'HR' | 'Viva';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
}

interface InterviewPrepProps {
  activeProject: any;
  onNavigateToFile?: (path: string) => void;
}

const defaultQuestions: InterviewQuestion[] = [
  {
    question: 'Explain the database migration strategy implemented in the db.ts driver.',
    expected: 'Instead of deleting files or tables, the system reads table descriptors via PRAGMA (SQLite) or schemas (Postgres) and executes safe ALTER TABLE statements to add columns dynamically, preventing user data loss.',
    category: 'Architecture',
    difficulty: 'Medium'
  },
  {
    question: 'What security concerns are raised by the dangerouslySetInnerHTML usage in React files?',
    expected: 'It renders raw string content directly as HTML, opening cross-site scripting (XSS) loopholes. Input must be sanitized through an active library like DOMPurify first.',
    category: 'Security',
    difficulty: 'Hard'
  },
  {
    question: 'How does the local RAG engine match chat queries to files without a vector database?',
    expected: 'It generates embeddings, saves them as serialized JSON string entries in SQL, and runs cosine similarity math in Node.js memory, sorting the top matches instantly.',
    category: 'System Design',
    difficulty: 'Expert'
  },
  {
    question: 'Explain the folder layout structure and boundaries of controllers vs services.',
    expected: 'The routes directory manages network controllers mapping parameters. Heavy operations, static code parsing, and API request calls are decoupled inside the services layer.',
    category: 'Viva',
    difficulty: 'Easy'
  },
  {
    question: 'Tell me about a time you had to deal with significant technical debt in a codebase.',
    expected: 'STAR format: Situation: high bug density. Task: refactor complex modules. Action: wrote test suites and broke down file lengths. Result: maintainability rating increased by 20%.',
    category: 'HR',
    difficulty: 'Medium'
  },
  {
    question: 'How do you handle conflict with a team member regarding an architectural decision?',
    expected: 'Discuss objectively based on data, performance benchmarks, and design constraints. Focus on system tradeoffs (e.g. latency vs consistency) and align with team goals.',
    category: 'Behavioral',
    difficulty: 'Easy'
  }
];

export default function InterviewPrep({ activeProject, onNavigateToFile }: InterviewPrepProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    talkingPoints: string[];
    feedback: string;
    keywordsMatched: string[];
    lengthRating: string;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expectedRevealAll, setExpectedRevealAll] = useState(false);

  // Mock Interview Mode States
  const [mockMode, setMockMode] = useState(false);
  const [currentMockIndex, setCurrentMockIndex] = useState(0);
  const [mockScores, setMockScores] = useState<number[]>([]);
  const [mockComplete, setMockComplete] = useState(false);

  // Simulated Mock history
  const [mockHistory, setMockHistory] = useState([
    { date: 'June 02, 2026', topic: 'Architecture & System Design', score: 82, questionsCount: 5 },
    { date: 'June 04, 2026', topic: 'Vulnerability Remediation Viva', score: 88, questionsCount: 3 }
  ]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <h3 className="text-lg font-bold text-slate-200">No Project Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Please connect a repository first.</p>
      </div>
    );
  }

  // Retrieve mock questions from project metadata or default list
  const questions: InterviewQuestion[] = useMemo(() => {
    let list: any[] = [];
    if (activeProject.interviewPrep) {
      try {
        list = typeof activeProject.interviewPrep === 'string' 
          ? JSON.parse(activeProject.interviewPrep) 
          : activeProject.interviewPrep;
      } catch (e) {
        console.error(e);
      }
    }
    const baseList = Array.isArray(list) && list.length > 0 ? list : defaultQuestions;

    return baseList.map((q, idx) => {
      // Map category and difficulty dynamically
      const categories: ('Architecture' | 'Security' | 'System Design' | 'Behavioral' | 'HR' | 'Viva')[] = [
        'Architecture', 'Security', 'System Design', 'Behavioral', 'HR', 'Viva'
      ];
      const category = q.category && categories.includes(q.category) ? q.category : categories[idx % categories.length];
      const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Expert')[] = ['Easy', 'Medium', 'Hard', 'Expert'];
      const difficulty = q.difficulty || difficulties[idx % difficulties.length];

      return {
        question: q.question || 'Describe your software engineering role and responsibilities.',
        expected: q.expected || 'Detail your tech stack (TypeScript, React, Node.js), system designs, and team collaborations.',
        category,
        difficulty
      };
    });
  }, [activeProject.interviewPrep]);

  const categories = ['All', 'Architecture', 'Security', 'System Design', 'Behavioral', 'HR', 'Viva'];

  const filteredQuestions = activeCategory === 'All' 
    ? questions 
    : questions.filter(q => q.category.toLowerCase() === activeCategory.toLowerCase());

  const activeQuestion = mockMode 
    ? questions[currentMockIndex]
    : (selectedQuestion || filteredQuestions[0] || questions[0]);

  // Readiness gauges mapped dynamically
  const codeMetrics = activeProject.metrics || { security: 74, maintainability: 92, testCoverage: 68 };
  const [weaknesses, setWeaknesses] = useState({
    architecture: Math.round(codeMetrics.maintainability),
    security: Math.round(codeMetrics.security),
    systemDesign: Math.round((codeMetrics.maintainability + codeMetrics.security) / 2),
    viva: 82,
    behavioral: 88
  });

  const readinessScore = useMemo(() => {
    return Math.round((weaknesses.architecture + weaknesses.security + weaknesses.systemDesign + weaknesses.viva + weaknesses.behavioral) / 5);
  }, [weaknesses]);

  const strongestCategory = useMemo(() => {
    const sorted = Object.entries(weaknesses).sort((a, b) => b[1] - a[1]);
    const name = sorted[0][0];
    return name === 'systemDesign' ? 'System Design' : name.charAt(0).toUpperCase() + name.slice(1);
  }, [weaknesses]);

  const weakestCategory = useMemo(() => {
    const sorted = Object.entries(weaknesses).sort((a, b) => a[1] - b[1]);
    const name = sorted[0][0];
    return name === 'systemDesign' ? 'System Design' : name.charAt(0).toUpperCase() + name.slice(1);
  }, [weaknesses]);

  const handleSelectQuestion = (q: InterviewQuestion) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    setScoreResult(null);
    setRevealed(false);
  };

  const handleScoreAnswer = () => {
    if (!userAnswer.trim() || !activeQuestion) return;
    setScoring(true);

    setTimeout(() => {
      // Articulation checks
      const expectedWords = activeQuestion.expected.toLowerCase().split(/\s+/);
      const userWords = userAnswer.toLowerCase().split(/\s+/);
      
      const matchedKeywords: string[] = [];
      const keyTokens = expectedWords.filter(w => w.length > 4);
      
      keyTokens.forEach(token => {
        const cleaned = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        if (userWords.some(uw => uw.includes(cleaned)) && !matchedKeywords.includes(cleaned)) {
          matchedKeywords.push(cleaned);
        }
      });

      const matchedRatio = keyTokens.length > 0 ? (matchedKeywords.length / keyTokens.length) : 0.5;
      const score = Math.round(55 + (matchedRatio * 42));
      const finalScore = Math.min(98, Math.max(45, score));

      // Response length assessment
      const wordCount = userWords.length;
      const lengthRating = wordCount > 80 ? 'Highly Detailed' : wordCount > 40 ? 'Moderate' : 'Concise / Brief';

      setScoreResult({
        score: finalScore,
        talkingPoints: [
          activeQuestion.category === 'Security' ? 'Credentials validation parameters' : 'Layered MVC boundaries decoupling',
          activeQuestion.category === 'Architecture' ? 'Schema alter table migration checks' : 'Vector similarity cosine indexes',
          'Production-grade design patterns compliance'
        ],
        feedback: finalScore >= 80 
          ? 'Excellent answer. You articulated the architectural nuances cleanly and covered primary technical points recruiters look for.' 
          : 'Decent attempt. Try to elaborate on precise patterns (e.g. prepared statements, alter tables, modularization) to sound more senior.',
        keywordsMatched: matchedKeywords.slice(0, 4),
        lengthRating
      });

      // Update mock scores or weakness grades
      if (mockMode) {
        setMockScores(prev => [...prev, finalScore]);
      }

      // Improve weakness rating based on score
      const categoryKey = activeQuestion.category.toLowerCase().replace(' ', '') as keyof typeof weaknesses;
      if (categoryKey in weaknesses) {
        setWeaknesses(prev => ({
          ...prev,
          [categoryKey]: Math.min(100, Math.round(prev[categoryKey] * 0.8 + finalScore * 0.2))
        }));
      }

      setScoring(false);
    }, 850);
  };

  const startMockInterview = () => {
    setMockMode(true);
    setCurrentMockIndex(0);
    setMockScores([]);
    setMockComplete(false);
    setUserAnswer('');
    setScoreResult(null);
    setRevealed(false);
  };

  const nextMockQuestion = () => {
    setUserAnswer('');
    setScoreResult(null);
    setRevealed(false);
    
    if (currentMockIndex < questions.length - 1) {
      setCurrentMockIndex(prev => prev + 1);
    } else {
      setMockComplete(true);
      // Save completed mock to history
      const avg = Math.round(mockScores.reduce((a, b) => a + b, 0) / mockScores.length);
      setMockHistory(prev => [
        { date: new Date().toLocaleDateString(), topic: 'Mock Practice Session', score: avg, questionsCount: questions.length },
        ...prev
      ]);
    }
  };

  const exitMockMode = () => {
    setMockMode(false);
    setMockComplete(false);
    setSelectedQuestion(questions[0]);
    setUserAnswer('');
    setScoreResult(null);
  };

  const getAverageMockScore = () => {
    if (mockScores.length === 0) return 0;
    return Math.round(mockScores.reduce((a, b) => a + b, 0) / mockScores.length);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
      case 'Medium': return 'text-amber-400 bg-amber-950/20 border-amber-900/30';
      case 'Hard': return 'text-orange-400 bg-orange-950/20 border-orange-900/30';
      default: return 'text-rose-400 bg-rose-950/20 border-rose-900/30';
    }
  };

  const getMaturityColor = (val: number) => {
    if (val >= 85) return 'text-purple-400 bg-purple-950/20 border-purple-900/35';
    if (val >= 70) return 'text-blue-450 bg-blue-950/20 border-blue-900/35';
    return 'text-amber-450 bg-amber-950/20 border-amber-900/35';
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto space-y-6 bg-[#030712] text-slate-100 bg-dot-grid">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-bold font-title text-slate-100 flex items-center">
            <BookOpen className="w-5 h-5 text-purple-400 mr-2" />
            Interview Readiness Dashboard
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Simulate technical checks and viva recruiter questions mapped recursively to this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!mockMode ? (
            <button
              onClick={startMockInterview}
              className="px-3.5 py-1.5 bg-purple-650 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 shadow-md shadow-purple-950/30 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Mock Interview</span>
            </button>
          ) : (
            <button
              onClick={exitMockMode}
              className="px-3 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Exit Mock Mode
            </button>
          )}
        </div>
      </div>

      {/* Top Stats Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Readiness Rating</span>
            <span className="text-xl font-extrabold text-purple-400 font-mono mt-1 block">{readinessScore}%</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-purple-450/40" />
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Strongest Area</span>
            <span className="text-xs font-extrabold text-emerald-400 mt-1 block select-text">{strongestCategory}</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-550/40" />
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Weakest Area</span>
            <span className="text-xs font-extrabold text-amber-400 mt-1 block select-text">{weakestCategory}</span>
          </div>
          <AlertCircle className="w-8 h-8 text-amber-550/40" />
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-900/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Total Completed</span>
            <span className="text-xl font-extrabold text-slate-200 font-mono mt-1 block">
              {mockScores.length} / {questions.length} solved
            </span>
          </div>
          <Award className="w-8 h-8 text-slate-550/40" />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Categories & Gauges & Weaknesses */}
        <div className="space-y-6">
          
          {/* Categories Selector (Non-Mock Mode) */}
          {!mockMode && (
            <div className="glass-panel p-4 rounded-xl border border-slate-900/80 space-y-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Category Filter
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setScoreResult(null);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-purple-600/10 border-purple-500/50 text-purple-400'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Reveal All Toggle */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                <span>Show Expected Answers</span>
                <button
                  onClick={() => setExpectedRevealAll(!expectedRevealAll)}
                  className={`px-2 py-0.5 rounded font-mono border cursor-pointer ${
                    expectedRevealAll 
                      ? 'bg-purple-950/20 text-purple-450 border-purple-900/30 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {expectedRevealAll ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* Weakness Assessment Scorecard Gauges */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
              <Sliders className="w-4 h-4 text-purple-400 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Readiness Gauges</h4>
            </div>

            <div className="space-y-3">
              {Object.entries(weaknesses).map(([name, scoreVal]) => {
                const label = name === 'HR' ? 'HR / Behavioral' : name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={name} className="text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-450">{label}</span>
                      <span className="text-slate-200 font-mono">{scoreVal}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className={`h-full rounded-full ${
                            scoreVal >= 85 ? 'bg-purple-500' :
                            scoreVal >= 70 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${scoreVal}%` }} 
                        />
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${getMaturityColor(scoreVal)}`}>
                        {scoreVal >= 85 ? 'Prod Ready' : scoreVal >= 70 ? 'Advanced' : 'Needs Review'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Readiness Radar Chart Card */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Readiness Breakdown Chart</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                  { subject: 'Architecture', score: weaknesses.architecture, fullMark: 100 },
                  { subject: 'Security', score: weaknesses.security, fullMark: 100 },
                  { subject: 'System Design', score: weaknesses.systemDesign, fullMark: 100 },
                  { subject: 'Behavioral', score: weaknesses.behavioral, fullMark: 100 },
                  { subject: 'Viva / HR', score: weaknesses.viva, fullMark: 100 }
                ]}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 6 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', fontSize: 10 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Radar
                    name="Readiness"
                    dataKey="score"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weakness Breakdown suggestions */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Weakness Breakdown & Advice</span>
            <div className="space-y-3 text-[11px] select-text">
              {weaknesses.security < 80 && (
                <div className="p-3 bg-rose-950/15 border border-rose-900/20 rounded-lg space-y-2">
                  <span className="font-bold text-rose-400 block mb-0.5">Vulnerability Heuristics</span>
                  <p className="text-slate-400 leading-normal">Hardcoded configuration credentials checker parameters need reading.</p>
                  {onNavigateToFile && (
                    <button
                      onClick={() => onNavigateToFile('backend/src/config/db.ts')}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-purple-400 hover:text-purple-300 font-mono text-[9px] rounded cursor-pointer transition-all"
                    >
                      backend/src/config/db.ts
                    </button>
                  )}
                </div>
              )}
              {weaknesses.architecture < 85 && (
                <div className="p-3 bg-amber-955/10 border border-amber-900/20 rounded-lg space-y-2">
                  <span className="font-bold text-amber-400 block mb-0.5">Architecture Guidelines</span>
                  <p className="text-slate-400 leading-normal">Audit layered MVC separation boundaries. Avoid database imports in routing controllers.</p>
                  {onNavigateToFile && (
                    <button
                      onClick={() => onNavigateToFile('backend/src/routes/projects.ts')}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-purple-400 hover:text-purple-300 font-mono text-[9px] rounded cursor-pointer transition-all"
                    >
                      backend/src/routes/projects.ts
                    </button>
                  )}
                </div>
              )}
              <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-lg space-y-2">
                <span className="font-bold text-slate-300 block mb-0.5">RAG Cosine Indexes</span>
                <p className="text-slate-400 leading-normal">Review how text segments are loaded inside business service files.</p>
                {onNavigateToFile && (
                  <button
                    onClick={() => onNavigateToFile('backend/src/services/rag.ts')}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-purple-400 hover:text-purple-300 font-mono text-[9px] rounded cursor-pointer transition-all"
                  >
                    backend/src/services/rag.ts
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Question Simulator Console / History */}
        <div className="lg:col-span-2 space-y-6">
          
          {mockComplete ? (
            /* Mock Complete Panel */
            <div className="glass-panel p-6 rounded-xl border border-slate-900/80 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-purple-950/20 border border-purple-900/30 flex items-center justify-center mx-auto text-purple-400">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100 font-title">Mock Interview Complete!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You have completed the mock viva evaluation. AI computed your results based on talking points coverage.
                </p>
              </div>

              <div className="p-4 bg-slate-955 border border-slate-900 rounded-lg max-w-xs mx-auto text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Average Interview Score</span>
                <span className="text-3xl font-black text-purple-400 font-mono mt-1 block">{getAverageMockScore()} / 100</span>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={startMockInterview}
                  className="px-4 py-2 bg-purple-650 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Retake Interview
                </button>
                <button
                  onClick={exitMockMode}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Exit Mock Mode
                </button>
              </div>
            </div>
          ) : (
            /* Simulator Console UI */
            <div className="glass-panel p-6 rounded-xl border border-slate-900/80 space-y-5">
              
              {/* Question Selection Grid (Non-mock mode) */}
              {!mockMode && (
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block px-1">
                    Questions Deck ({filteredQuestions.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                    {filteredQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectQuestion(q)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          activeQuestion.question === q.question
                            ? 'bg-purple-950/20 text-purple-400 border-purple-500/40 font-medium'
                            : 'bg-slate-950/40 hover:bg-slate-900/50 border-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="space-y-1 truncate pr-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[7px] font-bold tracking-wider bg-slate-900 border border-slate-850 text-slate-400 uppercase">
                              {q.category}
                            </span>
                            <span className={`px-1 rounded text-[7px] font-bold tracking-wider border uppercase ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="truncate font-semibold mt-1">{q.question}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active question details */}
              <div className="space-y-2.5 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    {mockMode ? `Mock Question ${currentMockIndex + 1} of ${questions.length}` : 'Selected Prompt'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider border uppercase ${getDifficultyColor(activeQuestion.difficulty)}`}>
                      {activeQuestion.difficulty}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider bg-purple-950/40 text-purple-400 border border-purple-900/35 uppercase">
                      {activeQuestion.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 leading-relaxed leading-6 font-sans select-text">
                  {activeQuestion.question}
                </h3>
              </div>

              {/* Answer writing textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Your Answer Response
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your structured explanation here (e.g. pattern descriptions, code parts, advantages, STAR steps)..."
                  className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600/50 text-slate-300 text-xs rounded-xl p-3.5 focus:outline-none min-h-[130px] leading-relaxed resize-none font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 items-center justify-between pt-1 border-t border-slate-900/50 pt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRevealed(true)}
                    className="px-3 py-1.5 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Reveal expected answer
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleScoreAnswer}
                    disabled={scoring || !userAnswer.trim()}
                    className="px-4 py-1.5 bg-purple-650 hover:bg-purple-600 disabled:bg-slate-900 disabled:text-slate-650 disabled:border-slate-900 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5 border border-purple-500/20 cursor-pointer"
                  >
                    {scoring ? (
                      <span className="flex items-center"><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Evaluating...</span>
                    ) : (
                      <>
                        <span>Submit & Score response</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {mockMode && scoreResult && (
                    <button
                      onClick={nextMockQuestion}
                      className="px-4 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      {currentMockIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                    </button>
                  )}
                </div>
              </div>

              {/* Evaluation score results */}
              <AnimatePresence>
                {scoreResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-slate-950/75 border border-slate-900 rounded-lg space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-title">
                        Answer Quality Analysis
                      </span>
                      <div className="flex items-center space-x-1 text-purple-400">
                        <Star className="w-4 h-4 fill-purple-400" />
                        <span className="text-xs font-bold font-mono">{scoreResult.score} / 100</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full ${scoreResult.score >= 80 ? 'bg-purple-500' : 'bg-amber-500'}`}
                        style={{ width: `${scoreResult.score}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      <div>
                        <span>Articulation:</span>
                        <span className="text-slate-350 ml-1.5 font-bold">{scoreResult.lengthRating}</span>
                      </div>
                      <div className="text-right">
                        <span>Keywords Matched:</span>
                        <span className="text-purple-405 ml-1.5 font-bold">{scoreResult.keywordsMatched.join(', ') || 'None'}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-450 leading-relaxed font-sans select-text border-t border-slate-900/60 pt-2">
                      {scoreResult.feedback}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                        Talking points matched
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {scoreResult.talkingPoints.map((tp, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-900/80 border border-slate-850 text-[9px] font-semibold text-slate-400 rounded-full flex items-center">
                            <CheckCircle2 className="w-3 h-3 text-purple-400 mr-1.5 shrink-0" />
                            {tp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reveal expected answer card */}
              <AnimatePresence>
                {(revealed || expectedRevealAll) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-purple-955/10 border border-purple-900/20 rounded-lg space-y-2 select-text font-sans"
                  >
                    <div className="flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">
                        Expected Recruiter Answer (Ideal Response)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-350 leading-relaxed italic">
                      "{activeQuestion.expected}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* Mock History logs */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
              <History className="w-4 h-4 text-purple-400 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">Mock History Logs</h4>
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 select-text">
              {mockHistory.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950/50 border border-slate-900 rounded-lg flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-300 block">{item.topic}</span>
                    <span className="text-[9px] text-slate-500 font-mono block">{item.date} • {item.questionsCount} prompts</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] border ${
                    item.score >= 85 ? 'text-purple-400 border-purple-900/40 bg-purple-955/10' : 'text-blue-450 border-blue-900/40 bg-blue-955/10'
                  }`}>
                    {item.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
