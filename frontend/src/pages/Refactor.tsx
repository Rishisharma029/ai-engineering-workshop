import React, { useState, useEffect } from 'react';
import { RefreshCw, Code, Copy, Check, Sparkles, LayoutGrid, Eye } from 'lucide-react';

interface RefactorProps {
  initialCode?: string;
  initialLanguage?: string;
  onClearInitialCode?: () => void;
  selectedProvider: string;
  providerMetrics: { tokens: number; latency: number; cost: number; provider: string } | null;
  onSetProviderMetrics: (metrics: { tokens: number; latency: number; cost: number; provider: string } | null) => void;
}

export default function Refactor({ 
  initialCode = '', 
  initialLanguage = 'js', 
  onClearInitialCode,
  selectedProvider,
  providerMetrics,
  onSetProviderMetrics
}: RefactorProps) {
  const [inputCode, setInputCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  
  const [refactored, setRefactored] = useState<Record<string, string> | null>(null);
  const [activeTab, setActiveTab] = useState<'clean' | 'optimized' | 'secure' | 'bestPractice'>('clean');
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  const [loading, setLoading] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      setLanguage(initialLanguage);
      setRefactored(null);
    }
  }, [initialCode, initialLanguage]);

  const handleRefactor = async () => {
    if (!inputCode.trim() || loading) return;
    setLoading(true);
    setRefactored(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/refactor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          code: inputCode,
          language: language,
          provider: selectedProvider
        })
      });

      const data = await response.json();
      if (data.clean) {
        setRefactored(data);
        if (data.metrics) {
          onSetProviderMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Error refactoring code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (tabKey: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const tabs = [
    { id: 'clean', label: 'Clean Code' },
    { id: 'optimized', label: 'Optimized' },
    { id: 'secure', label: 'Secure' },
    { id: 'bestPractice', label: 'Best Practice' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-4rem)]">
      
      {/* Input Code Panel */}
      <div className="border-r border-slate-800 p-4 flex flex-col justify-between h-full bg-slate-950/20">
        <div className="flex-1 flex flex-col justify-between mb-4">
          
          <div className="h-10 flex items-center justify-between shrink-0 mb-3 px-1">
            <div className="flex items-center space-x-2 text-xs">
              <Code className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-300">Input Source Code</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-350 text-[10px] rounded px-2 py-1 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
              {onClearInitialCode && initialCode && (
                <button
                  onClick={onClearInitialCode}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-rose-450 rounded font-semibold transition-all"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste your raw code block here..."
            className="flex-1 w-full bg-slate-950/50 border border-slate-900 focus:border-purple-650 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none placeholder:text-slate-650 resize-none min-h-[300px] leading-relaxed"
          />

        </div>

        <button
          onClick={handleRefactor}
          disabled={loading || !inputCode.trim()}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-650 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-950/25 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refactoring block...' : 'Analyze & Refactor Code'}</span>
        </button>

        {providerMetrics && providerMetrics.provider && (
          <div className="mt-3 text-[10px] text-slate-400 font-mono bg-slate-900/60 p-2.5 border border-slate-900 rounded-lg flex justify-between items-center select-none shrink-0">
            <span>Provider: <strong className="text-purple-400">{providerMetrics.provider}</strong></span>
            <div className="flex space-x-3">
              <span>Tokens: <strong>{providerMetrics.tokens}</strong></span>
              <span>Cost: <strong className="text-emerald-450">${providerMetrics.cost.toFixed(6)}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Refactored Code Comparison Panel */}
      <div className="flex flex-col h-full overflow-hidden bg-slate-950/10">
        {refactored ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header / Mode Switcher bar */}
            <div className="h-12 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
              
              {/* Single View Tabs */}
              {viewMode === 'single' ? (
                <div className="flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wide uppercase transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-600/10 text-purple-400 border border-purple-900/30'
                          : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  Enterprise Compare Grid
                </span>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 space-x-1">
                <button
                  onClick={() => setViewMode('single')}
                  className={`p-1 rounded transition-all text-xs font-semibold ${viewMode === 'single' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-500'}`}
                  title="Single code view"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  className={`p-1 rounded transition-all text-xs font-semibold ${viewMode === 'compare' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-500'}`}
                  title="Enterprise comparative grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Display Body */}
            {viewMode === 'single' ? (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <button
                  onClick={() => handleCopy(activeTab, refactored[activeTab])}
                  className="absolute top-3 right-3 p-1.5 bg-slate-900/80 border border-slate-850 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-all z-10"
                  title="Copy Code"
                >
                  {copiedTab === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1 p-4 overflow-auto bg-slate-950/20 font-mono text-xs leading-relaxed text-slate-300 select-text">
                  <pre className="whitespace-pre">{refactored[activeTab]}</pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-2.5 p-3.5 overflow-y-auto">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="glass-panel rounded-lg border border-slate-900/80 flex flex-col max-h-[300px] overflow-hidden relative group"
                  >
                    {/* Header */}
                    <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-900/60 flex items-center justify-between shrink-0">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tab.label}</span>
                      <button
                        onClick={() => handleCopy(tab.id, refactored[tab.id])}
                        className="p-1 hover:bg-slate-900 border border-transparent rounded text-slate-450 hover:text-slate-250 transition-all"
                        title="Copy Block"
                      >
                        {copiedTab === tab.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    {/* Code */}
                    <div className="flex-1 p-3 overflow-auto font-mono text-[10px] leading-relaxed text-slate-350 select-text bg-slate-950/15">
                      <pre className="whitespace-pre">{refactored[tab.id]}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            {loading ? (
              <div className="space-y-3 animate-pulse w-3/4">
                <div className="h-4 bg-slate-900 rounded w-5/6 mx-auto"></div>
                <div className="h-4 bg-slate-900 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-slate-900 rounded w-3/4 mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mb-3 text-slate-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-300 font-title">Refactor Sandbox Ready</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Enter code in the left editor and hit Refactor. We will output four side-by-side comparative variations.
                </p>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
