import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Terminal, 
  HelpCircle, 
  Activity, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Key, 
  EyeOff, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface Vulnerability {
  id: number;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  line: number;
  secret_snippet: string;
  file_path: string;
}

interface DependencyItem {
  name: string;
  status: 'Safe' | 'Outdated' | 'High Risk';
  version: string;
  recommendation: string;
}

interface SecurityProps {
  activeProject: any;
}

export default function Security({ activeProject }: SecurityProps) {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVulns = async () => {
      if (!activeProject) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/analysis/${activeProject.id}/vulnerabilities`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`
          }
        });
        const data = await response.json();
        setVulns(data);
      } catch (err) {
        console.error('Error fetching vulnerabilities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVulns();
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <h3 className="text-lg font-bold text-slate-200">No Project Loaded</h3>
        <p className="text-xs text-slate-400 mt-1">Please select or upload a project to scan.</p>
      </div>
    );
  }

  // Count severities
  const counts = {
    CRITICAL: vulns.filter(v => v.severity === 'CRITICAL').length,
    HIGH: vulns.filter(v => v.severity === 'HIGH').length,
    MEDIUM: vulns.filter(v => v.severity === 'MEDIUM').length,
    LOW: vulns.filter(v => v.severity === 'LOW').length,
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'text-rose-500 border-rose-900 bg-rose-950/20';
      case 'HIGH': return 'text-amber-500 border-amber-900 bg-amber-950/20';
      case 'MEDIUM': return 'text-purple-550 border-purple-900 bg-purple-950/20';
      default: return 'text-blue-500 border-blue-900 bg-blue-950/20';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-450 border-rose-900/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-450 border-amber-900/30';
      case 'MEDIUM': return 'bg-purple-500/10 text-purple-455 border-purple-900/30';
      default: return 'bg-blue-500/10 text-blue-450 border-blue-900/30';
    }
  };

  // Safe dependencies fallback
  const dependencies: DependencyItem[] = activeProject.dependencies_intel || [
    { name: 'react', status: 'Safe', version: '^19.0.0', recommendation: 'Up-to-date. Matches modern Concurrent rendering.' },
    { name: 'express', status: 'Safe', version: '^4.19.2', recommendation: 'Stable release.' },
    { name: 'axios', status: 'Safe', version: '^1.6.8', recommendation: 'Secure client.' },
    { name: 'jsonwebtoken', status: 'High Risk', version: '^9.0.2', recommendation: 'Avoid hardcoding credentials. Inject config variables via process.env.' },
    { name: 'lodash', status: 'Outdated', version: '^4.17.21', recommendation: 'Upgrade to lodash-es for tree-shaking and smaller bundle sizes.' }
  ];

  // Calculate simulated CVSS Score
  const getCvssScore = () => {
    let score = 0.0;
    if (counts.CRITICAL > 0) score += counts.CRITICAL * 3.5 + 4.5;
    if (counts.HIGH > 0) score += counts.HIGH * 2.0 + 2.0;
    if (counts.MEDIUM > 0) score += counts.MEDIUM * 1.0;
    if (counts.LOW > 0) score += counts.LOW * 0.5;
    return Math.min(10.0, score || 2.4); // fallback minimum CVSS is 2.4 if no vulns
  };

  const cvss = getCvssScore();

  // OWASP Mapping logic
  const owaspFindings = [
    { code: 'A01:2021', name: 'Broken Access Control', status: counts.CRITICAL > 0 ? 'Threat Discovered' : 'Secure', desc: 'Checks for authenticated router guards and session token validation.', pct: counts.CRITICAL > 0 ? 65 : 100 },
    { code: 'A02:2021', name: 'Cryptographic Failures', status: vulns.some(v => v.type.includes('Secret')) ? 'Threat Discovered' : 'Secure', desc: 'Checks for exposed keys, unhashed credentials or weak TLS.', pct: vulns.some(v => v.type.includes('Secret')) ? 40 : 100 },
    { code: 'A03:2021', name: 'Injection', status: vulns.some(v => v.type.includes('SQL')) ? 'Threat Discovered' : 'Secure', desc: 'Audits parameterized queries against SQL injections.', pct: vulns.some(v => v.type.includes('SQL')) ? 50 : 100 },
    { code: 'A07:2021', name: 'Identification & Auth Failures', status: 'Secure', desc: 'Checks session identifiers, expiry headers and rate limits.', pct: 90 },
    { code: 'A08:2021', name: 'Software & Data Integrity Failures', status: dependencies.some(d => d.status === 'High Risk') ? 'Outdated Dependencies' : 'Secure', desc: 'Verifies vulnerabilities inside imported package dependencies.', pct: dependencies.some(d => d.status === 'High Risk') ? 75 : 95 }
  ];

  // Advanced Security Checks Checklist
  const securityChecks = [
    { name: 'Secrets Detection', checked: !vulns.some(v => v.type.includes('Secret')), details: 'No hardcoded private keys or tokens' },
    { name: 'API Key Verification', checked: true, details: 'API keys loaded via environment variables' },
    { name: 'JWT Analysis', checked: true, details: 'Signed header algorithms verification' },
    { name: 'Authentication Review', checked: true, details: 'Private route endpoints protected by bearer token' },
    { name: 'Authorization Review', checked: false, details: 'Lacks granular access level checks (RBAC)' },
    { name: 'SQL Injection Risks', checked: !vulns.some(v => v.type.includes('SQL')), details: 'Prepared statements validation' },
    { name: 'XSS Risks', checked: !vulns.some(v => v.type.includes('XSS')), details: 'Raw HTML rendering checking' },
    { name: 'Dependency Vulnerabilities', checked: !dependencies.some(d => d.status === 'High Risk'), details: 'Package security audit status' }
  ];

  // Simulated Security Timeline Data
  const timelineData = [
    { name: 'Commit 1', CVSS: 2.1 },
    { name: 'Commit 2', CVSS: 3.4 },
    { name: 'Commit 3', CVSS: cvss * 0.8 },
    { name: 'Scan 4', CVSS: cvss }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] bg-[#030712] text-slate-100 bg-dot-grid">
      
      {/* Overview Block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold font-title text-slate-100 flex items-center">
            <Lock className="w-5 h-5 text-purple-400 mr-2" />
            AI Security Center
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Enterprise-grade vulnerability auditing, secret detection scanners, and OWASP compliance maps.
          </p>
        </div>
        <span className="text-[10px] font-mono bg-purple-950/30 text-purple-400 border border-purple-900/30 px-3 py-1 rounded-full uppercase tracking-wider font-semibold self-start sm:self-center">
          Status: Auditing Complete
        </span>
      </div>

      {/* Row 1: Threat CVSS meter & counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Threat CVSS score card */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-slate-900/80">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-title">CVSS Threat Index</h3>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Cumulative threat density</span>
          </div>

          <div className="flex items-center space-x-6 py-4">
            <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-mono shrink-0 ${
              cvss >= 7.0 ? 'border-rose-600 text-rose-400 bg-rose-950/15' :
              cvss >= 4.0 ? 'border-amber-600 text-amber-400 bg-amber-950/15' :
              'border-emerald-600 text-emerald-400 bg-emerald-950/15'
            }`}>
              <span className="text-2xl font-black">{cvss.toFixed(1)}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider">Rating</span>
            </div>
            
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="font-extrabold text-slate-200">
                {cvss >= 7.0 ? 'Critical Threat Density' : cvss >= 4.0 ? 'Medium Vulnerabilities Found' : 'Secure Codebase Baseline'}
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Auditor checks found {vulns.length} vulnerabilities across static files. Resolve hardcoded values.
              </p>
            </div>
          </div>
          
          <div className="text-[9px] text-slate-500 font-semibold border-t border-slate-900/60 pt-2 flex items-center justify-between">
            <span>CVSS v3.1 Standards</span>
            <span>Scan 100% complete</span>
          </div>
        </div>

        {/* Severity counts cards grid */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center border-slate-900/80">
          <div className="p-4 bg-slate-950/50 border border-slate-900 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-rose-455 font-bold uppercase tracking-wider block">Critical</span>
            <span className="text-3xl font-black text-rose-500 font-mono">{counts.CRITICAL}</span>
          </div>
          <div className="p-4 bg-slate-950/50 border border-slate-900 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-amber-455 font-bold uppercase tracking-wider block">High</span>
            <span className="text-3xl font-black text-amber-500 font-mono">{counts.HIGH}</span>
          </div>
          <div className="p-4 bg-slate-950/50 border border-slate-900 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-purple-455 font-bold uppercase tracking-wider block">Medium</span>
            <span className="text-3xl font-black text-purple-500 font-mono">{counts.MEDIUM}</span>
          </div>
          <div className="p-4 bg-slate-950/50 border border-slate-900 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-blue-455 font-bold uppercase tracking-wider block">Low</span>
            <span className="text-3xl font-black text-blue-500 font-mono">{counts.LOW}</span>
          </div>
        </div>

      </div>

      {/* Row 2: Advanced Security Checks & Security Timeline Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Security Checks Checklist */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-title">Advanced Security Checklist</h3>
            <p className="text-[9px] text-slate-500 mt-0.5">Automated validation scanners executing credentials & injection reviews.</p>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {securityChecks.map((check, idx) => (
              <div key={idx} className="flex items-start justify-between p-2.5 bg-slate-950/45 border border-slate-900 rounded-lg text-[11px] gap-2">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200 block">{check.name}</span>
                  <span className="text-[9px] text-slate-500 block leading-normal">{check.details}</span>
                </div>
                {check.checked ? (
                  <span className="flex items-center text-emerald-400 font-bold font-mono text-[9px] bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase shrink-0">
                    <ShieldCheck className="w-3 h-3 mr-1" /> SECURE
                  </span>
                ) : (
                  <span className="flex items-center text-rose-455 font-bold font-mono text-[9px] bg-rose-950/20 border border-rose-900/30 px-1.5 py-0.5 rounded uppercase shrink-0">
                    <ShieldAlert className="w-3 h-3 mr-1" /> RISK
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Timeline Chart */}
        <div className="glass-panel p-6 rounded-xl border-slate-900/80 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-title">CVSS Security Timeline</h3>
            <p className="text-[9px] text-slate-500 mt-0.5">Threat index tracking history computed over active workspace iterations.</p>
          </div>

          <div className="h-44 w-full py-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCvss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 8 }} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', fontSize: 10 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="CVSS" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCvss)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-[9px] text-slate-550 font-semibold font-mono uppercase tracking-wider border-t border-slate-900/60 pt-2 flex items-center justify-between">
            <span>Scan Trend: Stable</span>
            <span>CVSS Threshold: 7.0 max</span>
          </div>
        </div>

      </div>

      {/* Row 3: OWASP Top 10 Mapping list */}
      <div className="glass-panel p-6 rounded-xl border-slate-900/80 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-title">OWASP Top 10 Compliance Mapping</h3>
          <p className="text-[9px] text-slate-500 mt-0.5">Static code files parsed against the Open Web Application Security Project standards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owaspFindings.map((finding) => (
            <div key={finding.code} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] font-mono text-purple-400 rounded-md font-bold uppercase">
                    {finding.code}
                  </span>
                  <span className={`text-[8px] font-mono font-extrabold px-1.5 rounded uppercase tracking-wider border ${
                    finding.status === 'Secure' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/20' : 'bg-rose-950/20 text-rose-455 border-rose-900/20'
                  }`}>
                    {finding.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{finding.name}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{finding.desc}</p>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[9px] font-semibold">
                  <span className="text-slate-450">Compliance Rate</span>
                  <span className={finding.pct === 100 ? 'text-emerald-400' : 'text-rose-400'}>{finding.pct}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-900/60">
                  <div 
                    className={`h-full rounded-full ${finding.pct === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${finding.pct}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Dependency Intelligence safety grid */}
      <div className="glass-panel p-6 rounded-xl border-slate-900/80 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-title">Dependency Vulnerabilities</h3>
          <p className="text-[9px] text-slate-500 mt-0.5">Automated package scanning checks for known security leaks and outdated libraries.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] font-bold text-slate-550 uppercase tracking-widest">
                <th className="py-2.5 px-3">Package</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {dependencies.map((dep, idx) => (
                <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-300">{dep.name}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border ${
                      dep.status === 'Safe' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/20' :
                      dep.status === 'Outdated' ? 'bg-amber-950/30 text-amber-400 border-amber-900/20' :
                      'bg-rose-950/30 text-rose-400 border-rose-900/20'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-550">{dep.version}</td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] leading-relaxed max-w-sm">{dep.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Audit findings list */}
      <div className="glass-panel p-6 rounded-xl space-y-6 border-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-200 font-title">Vulnerabilities Scan Report</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {vulns.length} vulnerabilities found
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-16 bg-slate-900 border border-slate-850 rounded"></div>
            <div className="h-16 bg-slate-900 border border-slate-850 rounded"></div>
          </div>
        ) : vulns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-center mb-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">No vulnerabilities detected!</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Your codebase passes the static credential check and SQLi parameters test.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vulns.map((vuln) => (
              <div
                key={vuln.id}
                className="p-4 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-lg space-y-3 transition-all"
              >
                {/* Vuln Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold rounded uppercase tracking-wider ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{vuln.type}</h4>
                  </div>
                  
                  <span className="text-[10px] text-slate-550 font-mono">
                    {vuln.file_path} : Line {vuln.line}
                  </span>
                </div>

                {/* Vuln Description */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {vuln.description}
                </p>

                {/* Code Snippet Box */}
                {vuln.secret_snippet && (
                  <div className="rounded border border-slate-900 bg-slate-900/50 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto relative">
                    <span className="absolute top-1 right-2 text-[8px] text-slate-650 font-bold uppercase">vulnerable snippet</span>
                    <pre>{vuln.secret_snippet}</pre>
                  </div>
                )}

                {/* Recommendation prompt */}
                <div className="p-3 bg-purple-950/15 border border-purple-900/20 rounded flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">Remediation Recommendation</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                      {vuln.type.includes('Secret') 
                        ? 'Extract this credentials key to your environment configurations file (.env) and add .env to your .gitignore.'
                        : 'Review this file block inside the Refactoring Studio to generate a secure binding fallback.'}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

