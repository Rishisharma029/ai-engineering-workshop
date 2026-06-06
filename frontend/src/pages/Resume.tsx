import React, { useState, useEffect } from 'react';
import { 
  FileBadge, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Briefcase, 
  MessageSquare, 
  Clipboard, 
  Download, 
  BookOpen, 
  Award, 
  Share2,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface ResumeProps {
  activeProject: any;
}

const ATSRadialScore = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const radius = 28;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center space-y-1.5 flex-1">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="stroke-slate-900 fill-transparent"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="fill-transparent transition-all duration-500"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-black font-mono text-slate-205">{score}%</span>
      </div>
      <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest block font-sans">{label}</span>
    </div>
  );
};

export default function Resume({ activeProject }: ResumeProps) {
  const [bullets, setBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Editable fields for live preview
  const [fullName, setFullName] = useState('Rishi Sharma');
  const [email, setEmail] = useState('rishi.sharma@example.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [location, setLocation] = useState('San Francisco, CA');

  const fetchResumePoints = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resume/${activeProject.id}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });
      const data = await response.json();
      setBullets(data.points || []);
    } catch (err) {
      console.error('Error fetching resume bullets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumePoints();
  }, [activeProject]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <h3 className="text-lg font-bold text-slate-200">No Project Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Please select or upload a project to generate resume points.</p>
      </div>
    );
  }

  // Parse LinkedIn summary & Talking points from activeProject.resume_data or fallback
  const resumeData = activeProject.resume_data || {
    linkedin: 'AI Full-Stack Software Engineer | TypeScript & Node.js Developer | Specializing in RAG Codebase Search and Static Code Scanners',
    talkingPoints: [
      'Discussed metadata checking migrations to avoid SQLite/Postgres conflicts.',
      'Highlighted RAG context formatting inside server-sent event streams.',
      'Explained complexity score heuristics based on cyclomatic loops.'
    ]
  };

  const bulletsToDisplay = bullets.length > 0 ? bullets : [
    `Engineered dynamic database migrations checks in ${activeProject.name} preventing schema data resets.`,
    `Optimized file sizes and directory layouts, achieving a maintainability rating of ${activeProject.metrics?.maintainability || 92}%.`,
    `Secured private endpoints with bearer JWT authentication middleware routines.`
  ];

  // STAR Stories logs
  const starStories = [
    {
      title: 'Dynamic Column Migrations',
      situation: 'Database resets during upgrades threatened user data loss across SQLite and PostgreSQL databases.',
      task: 'Design a columns checker migration engine checking tables metadata dynamically without hard wipes.',
      action: 'Created PRAGMA table_info queries mapping column objects dynamically and altered target columns.',
      result: 'Maintained 100% database schema backwards-compatibility without losing active workspace data.'
    },
    {
      title: 'Cyclomatic Complexity Heatmaps',
      situation: 'Technical debt accumulated due to large module sizes and console logging in production files.',
      task: 'Provide actionable risk heuristics highlighting large classes and vulnerabilities.',
      action: 'Engineered regex complexity scanners parsing functions length and compiled color risk mappings.',
      result: 'Identified 4 hotspots, resulting in modular refactoring that decreased code size by 15%.'
    }
  ];

  // Recruiter Pitch
  const recruiterPitch = `Hi there,\n\nI just finished designing a Developer Intelligence Platform that automates codebase audits. The application features a dynamic static analyzer checking for CVSS vulnerabilities, a local RAG engine answering architectural questions, and zoomable SVG force topologies drawing dependency maps.\n\nI'd love to chat about how my experience in TypeScript, Node.js, and AI engineering fits your current software development projects. Let me know if you have time for a quick prescreen!\n\nBest,\n${fullName}`;

  // LinkedIn Profile Summary
  const linkedinSummary = `🚀 Passionate Software Engineer specialized in AI Developer Tooling, TypeScript, and Node.js.\n\nKey Achievements:\n• Developed a database migration framework supporting dynamic schema alteration without data wipes.\n• Integrated server-side semantic RAG search matching query vectors with 90%+ similarity indexes.\n• Built interactive dependency graphs using SVG node physics dragging controls.`;

  // Portfolio Description
  const portfolioDesc = `Built an AI Developer Intelligence Platform auditing codebase files. Features interactive SVG topological dependency trees, CVSS threat radar checklist controls, and mock interview prep viva simulators.`;

  // Project Explanation
  const projectExplanation = `This platform acts as an automated engineering scanner. By checking repository structures, parsing function files, and scanning code logic against vulnerability lists, it calculates overall health scores and constructs modular RAG context blocks to answer developer questions.`;

  // Client-Side Exporter
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadResumeMarkdown = () => {
    const markdown = `# ${fullName}\n\n` +
      `**Email:** ${email} | **Phone:** ${phone} | **Location:** ${location}\n\n` +
      `## Professional Profile\n${linkedinSummary}\n\n` +
      `## Project Development Experience\n` +
      `### ${activeProject.name} (AI Developer Intelligence Platform)\n` +
      `*${portfolioDesc}*\n\n` +
      `**Key Accomplishments:**\n` +
      bulletsToDisplay.map((b) => `* ${b}`).join('\n') + `\n\n` +
      `## Technical Success Case-Studies\n` +
      starStories.map(story => {
        return `### ${story.title}\n` +
          `- **Situation:** ${story.situation}\n` +
          `- **Task:** ${story.task}\n` +
          `- **Action:** ${story.action}\n` +
          `- **Result:** ${story.result}\n`;
      }).join('\n') + `\n` +
      `## Interview Talking Points\n` +
      resumeData.talkingPoints.map((pt: string, idx: number) => `${idx + 1}. ${pt}`).join('\n') + `\n\n` +
      `---\n*Generated by AI Developer Intelligence Platform V6*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fullName.toLowerCase().replace(' ', '_')}_resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadResumeText = () => {
    const text = `====================================================\n` +
      `${fullName.toUpperCase()} - PORTFOLIO RESUME\n` +
      `====================================================\n` +
      `Email: ${email} | Phone: ${phone}\n` +
      `Location: ${location}\n\n` +
      `PROFILE SUMMARY:\n` +
      `${linkedinSummary}\n\n` +
      `PROJECT: ${activeProject.name} (AI Developer Intelligence Platform)\n` +
      `- Purpose: ${portfolioDesc}\n` +
      `- Technical Implementation: ${projectExplanation}\n\n` +
      `KEY ACCOMPLISHMENTS:\n` +
      bulletsToDisplay.map((b, i) => `${i + 1}. ${b}`).join('\n') + `\n\n` +
      `STAR SUCCESS STORIES:\n` +
      starStories.map(story => {
        return `Title: ${story.title}\n- Situation: ${story.situation}\n- Task: ${story.task}\n- Action: ${story.action}\n- Result: ${story.result}\n`;
      }).join('\n') + `\n` +
      `====================================================\n` +
      `Generated by AI Developer Intelligence Platform V6\n`;
    
    downloadTextFile(text, `${fullName.toLowerCase().replace(' ', '_')}_resume.txt`);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-[#030712] text-slate-100 bg-dot-grid">
      
      {/* Exporter Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center space-x-2">
          <FileBadge className="w-5 h-5 text-purple-400 animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-slate-200 font-title">Resume & LinkedIn Center</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Compile accomplishments, STAR stories, LinkedIn pitches, and preview print-ready developer CV assets.
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900/50 border border-slate-900 rounded-lg p-1 text-[10px] font-bold">
          <button
            onClick={handleDownloadResumeText}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>
          <button
            onClick={handleDownloadResumeMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-purple-400 hover:text-purple-300 transition-all border border-purple-900/15 rounded bg-purple-950/10 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 animate-pulse" />
            <span>Print Layout</span>
          </button>
        </div>
      </div>

      {/* Grid: Accomplishments vs LinkedIn Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: Interactive Generators */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ATS score gauge card */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title">ATS Resume Audit Scorecard</h4>
            <div className="flex justify-between gap-3">
              <ATSRadialScore score={88} label="Resume Strength" color="#a855f7" />
              <ATSRadialScore score={82} label="Keyword Coverage" color="#3b82f6" />
              <ATSRadialScore score={91} label="Technical Depth" color="#10b981" />
            </div>
          </div>

          {/* Profile Details Edit Card */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Personal Contact Profile</span>
            <div className="space-y-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600/50 text-slate-200 text-xs rounded p-2 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600/50 text-slate-200 text-xs rounded p-2 focus:outline-none"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600/50 text-slate-200 text-xs rounded p-2 focus:outline-none"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full bg-slate-950 border border-slate-900 focus:border-purple-600/50 text-slate-200 text-xs rounded p-2 focus:outline-none"
              />
            </div>
          </div>

          {/* STAR Story Generator */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-355 uppercase tracking-wider font-title border-b border-slate-900 pb-2">
              STAR Story Generator
            </h4>
            <div className="space-y-3">
              {starStories.map((story, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2 text-[10px]">
                  <span className="font-bold text-purple-400 font-mono block">{story.title}</span>
                  <p className="text-slate-450 leading-relaxed font-sans select-text">
                    <strong>Situation:</strong> {story.situation}<br/>
                    <strong>Action:</strong> {story.action}<br/>
                    <strong>Result:</strong> {story.result}
                  </p>
                  <button
                    onClick={() => handleCopy(`${story.title}\nSituation: ${story.situation}\nTask: ${story.task}\nAction: ${story.action}\nResult: ${story.result}`, `star-${idx}`)}
                    className="flex items-center text-[9px] text-purple-405 hover:underline font-bold space-x-1 cursor-pointer bg-transparent border-0"
                  >
                    {copiedText === `star-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-455" /> : <Clipboard className="w-3.5 h-3.5" />}
                    <span>Copy STAR Story</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Summary Generator */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title border-b border-slate-900 pb-2">
              LinkedIn Summary Generator
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2 select-text">
              <p className="text-[10px] leading-relaxed text-slate-400 whitespace-pre-line font-sans">{linkedinSummary}</p>
              <button
                onClick={() => handleCopy(linkedinSummary, 'linkedin')}
                className="flex items-center text-[9px] text-purple-405 hover:underline font-bold space-x-1 cursor-pointer bg-transparent border-0"
              >
                {copiedText === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-455" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>Copy LinkedIn Summary</span>
              </button>
            </div>
          </div>

          {/* Recruiter Pitch Generator */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title border-b border-slate-900 pb-2">
              Recruiter Pitch Generator
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2 select-text">
              <p className="text-[10px] leading-relaxed text-slate-400 whitespace-pre-line max-h-36 overflow-y-auto font-sans">{recruiterPitch}</p>
              <button
                onClick={() => handleCopy(recruiterPitch, 'pitch')}
                className="flex items-center text-[9px] text-purple-405 hover:underline font-bold space-x-1 cursor-pointer bg-transparent border-0"
              >
                {copiedText === 'pitch' ? <Check className="w-3.5 h-3.5 text-emerald-455" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>Copy Outreach Pitch</span>
              </button>
            </div>
          </div>

          {/* Portfolio & Project Generators */}
          <div className="glass-panel p-5 rounded-xl border border-slate-900/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-title border-b border-slate-900 pb-2">
              Project Explanations
            </h4>
            <div className="space-y-3 text-[10px] select-text">
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                <span className="font-bold text-slate-400 block font-mono">Portfolio Pitch</span>
                <p className="text-slate-450 leading-relaxed font-sans">{portfolioDesc}</p>
                <button
                  onClick={() => handleCopy(portfolioDesc, 'port-desc')}
                  className="flex items-center text-[9px] text-purple-405 hover:underline font-bold space-x-1 pt-1 cursor-pointer bg-transparent border-0"
                >
                  {copiedText === 'port-desc' ? <Check className="w-3 h-3 text-emerald-455" /> : <Clipboard className="w-3 h-3" />}
                  <span>Copy Pitch</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                <span className="font-bold text-slate-400 block font-mono">Technical Logic Summary</span>
                <p className="text-slate-455 leading-relaxed font-sans">{projectExplanation}</p>
                <button
                  onClick={() => handleCopy(projectExplanation, 'proj-logic')}
                  className="flex items-center text-[9px] text-purple-405 hover:underline font-bold space-x-1 pt-1 cursor-pointer bg-transparent border-0"
                >
                  {copiedText === 'proj-logic' ? <Check className="w-3 h-3 text-emerald-455" /> : <Clipboard className="w-3 h-3" />}
                  <span>Copy Summary</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Resume Live Preview Panel */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-xl border border-slate-900/80 space-y-6 select-text max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Resume Live Preview Panel</span>
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono">Clean Print Layout</span>
          </div>

          {/* Paper Mock container */}
          <div className="bg-[#0b0f19] border border-slate-900/60 rounded-xl p-6 md:p-8 space-y-6 text-slate-300 font-sans shadow-inner leading-relaxed">
            
            {/* Header info */}
            <div className="text-center space-y-2 border-b border-slate-900 pb-5">
              <h3 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-wider font-title">{fullName}</h3>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-450 font-semibold font-mono">
                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {email}</span>
                <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {phone}</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {location}</span>
              </div>
            </div>

            {/* Profile summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-slate-900/50 pb-1 font-title">
                Professional Profile
              </h4>
              <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed select-text">
                {linkedinSummary}
              </p>
            </div>

            {/* Project Experience section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-slate-900/50 pb-1 font-title">
                Project Development Experience
              </h4>
              
              <div className="space-y-2.5 select-text">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">{activeProject.name}</h5>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase font-mono">AI Developer Intelligence platform</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">June 2026</span>
                </div>

                <p className="text-xs text-slate-400 leading-normal mb-2">
                  {portfolioDesc} {projectExplanation}
                </p>

                {/* Bullets */}
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-400 select-text">
                  {bulletsToDisplay.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* STAR accomplishments */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-slate-900/50 pb-1 font-title">
                Technical Success Case-Studies
              </h4>

              <div className="space-y-3.5 select-text">
                {starStories.map((story, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 font-mono block">{story.title}</span>
                    <p className="text-xs text-slate-450 leading-relaxed pl-2 border-l border-purple-900/60 italic">
                      "Faced with a scenario where {story.situation.toLowerCase()} I was tasked to {story.task.toLowerCase()} Consequently, I {story.action.toLowerCase()} resulting in {story.result.toLowerCase()}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter Talking Points list */}
            <div className="space-y-3 pt-1 select-text">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest border-b border-slate-900/50 pb-1 font-title">
                Interview talking points
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {resumeData.talkingPoints.map((pt: string, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-[10px] text-slate-400">
                    <span className="font-bold text-purple-400 block mb-0.5 font-mono">0{idx + 1}.</span>
                    {pt}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="text-center text-[10px] text-slate-600 font-mono uppercase tracking-wider">
            made by rishi sharma all rights reserved
          </div>
        </div>

      </div>

    </div>
  );
}
