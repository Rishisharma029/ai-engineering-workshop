import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  type: string;
  content: string;
  version: number;
}

interface DocumentationProps {
  activeProject: any;
  selectedProvider: string;
  providerMetrics: { tokens: number; latency: number; cost: number; provider: string } | null;
  onSetProviderMetrics: (metrics: { tokens: number; latency: number; cost: number; provider: string } | null) => void;
}

export default function Documentation({ 
  activeProject,
  selectedProvider,
  providerMetrics,
  onSetProviderMetrics
}: DocumentationProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedType, setSelectedType] = useState<string>('README');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const docTypes = [
    { type: 'README', label: 'README.md', desc: 'Project overview and quick-start guides.' },
    { type: 'API', label: 'API Reference', desc: 'REST endpoint specs and payloads.' },
    { type: 'INSTALL', label: 'Installation Guide', desc: 'Developer prerequisites and dependencies.' },
    { type: 'ARCH', label: 'Architecture Doc', desc: 'System layers and database relationships.' },
    { type: 'DEV', label: 'Developer Guide', desc: 'Coding patterns, standards, and tools.' },
    { type: 'CONTRIB', label: 'Contribution Guide', desc: 'Commit directives, issues, and PR protocols.' },
  ];

  const fetchDocs = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/docs/${activeProject.id}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeProject]);

  const activeDoc = documents.find(d => d.type === selectedType);

  const handleGenerate = async () => {
    if (!activeProject || generating) return;
    setGenerating(true);
    onSetProviderMetrics(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/docs/${activeProject.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ 
          docType: selectedType,
          provider: selectedProvider
        })
      });

      const data = await response.json();
      if (data.content) {
        await fetchDocs();
        if (data.metrics) {
          onSetProviderMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Error generating document:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!activeDoc) return;
    const element = document.createElement("a");
    const file = new Blob([activeDoc.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = activeDoc.title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadHtml = () => {
    if (!activeDoc) return;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${activeDoc.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #334155; }
    h1, h2, h3, h4 { color: #0f172a; font-weight: 700; margin-top: 24px; margin-bottom: 12px; }
    p { margin-bottom: 16px; }
    li { margin-bottom: 8px; }
    pre { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; overflow-x: auto; font-family: monospace; font-size: 14px; }
    code { font-family: monospace; font-size: 14px; background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${activeDoc.title}</h1>
  ${activeDoc.content
    .replace(/# (.*)/g, '<h2>$1</h2>')
    .replace(/## (.*)/g, '<h3>$1</h3>')
    .replace(/### (.*)/g, '<h4>$1</h4>')
    .replace(/- (.*)/g, '<li>$1</li>')
    .split('\n').join('<br>')}
</body>
</html>
    `;
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = activeDoc.title.replace(/\.md$/, '') + '.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold font-title text-white mt-6 mb-3 border-b border-slate-900 pb-2">{trimmed.substring(2)}</h2>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold font-title text-slate-100 mt-5 mb-2.5">{trimmed.substring(3)}</h3>;
      }
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold font-title text-slate-200 mt-4 mb-2">{trimmed.substring(4)}</h4>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={idx} className="ml-4 list-disc text-xs text-slate-300 mb-1 leading-relaxed">{trimmed.substring(2)}</li>;
      }
      if (trimmed.startsWith('```')) {
        return null;
      }
      if (trimmed === '') return <div key={idx} className="h-2"></div>;
      
      return <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-1.5">{trimmed}</p>;
    });
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <h3 className="text-lg font-bold text-slate-200">No Project Loaded</h3>
        <p className="text-xs text-slate-400 mt-1">Please select or upload a project to view docs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-4rem)] print:block print:h-auto">
      
      {/* Sidebar Selector list */}
      <div className="border-r border-slate-800 bg-slate-950/40 p-4 space-y-3 overflow-y-auto print:hidden">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Document Types</h4>
        <div className="space-y-1">
          {docTypes.map((doc) => {
            const isSelected = selectedType === doc.type;
            const isGenerated = documents.some(d => d.type === doc.type);

            return (
              <button
                key={doc.type}
                onClick={() => setSelectedType(doc.type)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start justify-between group ${
                  isSelected
                    ? 'bg-purple-600/10 border-purple-900/30 text-purple-400'
                    : 'bg-slate-900/20 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5 font-bold">
                    <span>{doc.label}</span>
                    {isGenerated && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Generated"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{doc.desc}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Markdown Viewer pane */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-hidden print:w-full print:block print:h-auto">
        {activeDoc ? (
          <div className="flex flex-col h-full overflow-hidden print:block print:h-auto">
            {/* Header controls bar */}
            <div className="h-12 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center space-x-2 text-xs">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-slate-200">{activeDoc.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-500 font-mono rounded">
                  v{activeDoc.version}
                </span>
                {providerMetrics && providerMetrics.provider && (
                  <span className="text-[8px] px-2 py-0.5 bg-purple-950/20 text-purple-400 border border-purple-900/30 rounded font-mono select-none">
                    {providerMetrics.provider} (${providerMetrics.cost.toFixed(6)})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-300 rounded transition-all font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{generating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
                
                {/* Format Exporter Dropdown */}
                <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-850 rounded px-2 py-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1 shrink-0">Export</span>
                  <select
                    id="export-select"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'md') handleDownloadMarkdown();
                      else if (val === 'html') handleDownloadHtml();
                      else if (val === 'pdf') handleDownloadPdf();
                      e.target.value = ''; // Reset select
                    }}
                    className="bg-transparent border-none text-[10px] font-bold text-purple-400 hover:text-purple-300 focus:outline-none cursor-pointer py-1"
                  >
                    <option value="" disabled selected>Select Format</option>
                    <option value="md" className="bg-slate-950 text-slate-300">Markdown (.md)</option>
                    <option value="html" className="bg-slate-950 text-slate-300">HTML (.html)</option>
                    <option value="pdf" className="bg-slate-950 text-slate-300">PDF (Print)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Markdown Display */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950/20 select-text max-w-3xl mx-auto w-full print:bg-white print:text-black print:max-w-none print:p-0 print:overflow-visible">
              {renderMarkdown(activeDoc.content)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center print:hidden">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mb-3 text-slate-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-300">Document Not Generated</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mb-4">
              Compile README instructions, API schemas, or contributing guidelines for this project using AI context.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Compiling Document...' : 'Generate Document'}</span>
            </button>
            {providerMetrics && providerMetrics.provider && (
              <div className="mt-4 text-[10px] text-slate-400 font-mono bg-slate-900/40 px-3 py-1.5 border border-slate-900 rounded-md select-none">
                Tokens: <strong className="text-slate-202">{providerMetrics.tokens}</strong> | Cost: <strong className="text-emerald-450">${providerMetrics.cost.toFixed(6)}</strong> | Latency: <strong className="text-slate-202">{providerMetrics.latency}ms</strong>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
