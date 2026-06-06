import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, GitBranch, Users, Check } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [savedKey, setSavedKey] = useState(false);
  const [savedToken, setSavedToken] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const key = localStorage.getItem('openai_key') || '';
    const tok = localStorage.getItem('github_token') || '';
    setApiKey(key);
    setGithubToken(tok);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('openai_key', apiKey);
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  const saveGithubToken = () => {
    localStorage.setItem('github_token', githubToken);
    setSavedToken(true);
    setTimeout(() => setSavedToken(false), 2000);
  };

  const team = [
    { name: 'Rishi Sharma', role: 'Lead Architect', email: 'rishi.sharma@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { name: 'Sarah Jenkins', role: 'Senior Tech Lead', email: 'sarah.j@example.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    { name: 'Alex Rivera', role: 'Full-Stack Developer', email: 'alex.r@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      
      {/* OpenAI Settings Card */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Key className="w-4.5 h-4.5 text-purple-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Provider Configurations</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">OpenAI API Key Override</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="flex-1 bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
              />
              <button
                onClick={saveApiKey}
                className="flex items-center space-x-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-purple-900/10 shrink-0"
              >
                {savedKey ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              If provided, this key overrides the backend environmental settings, allowing you to use your own OpenAI usage plan for indexing and chat prompts. Keys are only cached locally in your browser storage.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Auth Settings Card */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
          <GitBranch className="w-4.5 h-4.5 text-purple-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">GitHub Integration Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Personal Access Token (PAT)</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="flex-1 bg-slate-950 border border-slate-900 focus:border-purple-600 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none placeholder:text-slate-700"
              />
              <button
                onClick={saveGithubToken}
                className="flex items-center space-x-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-purple-900/10 shrink-0"
              >
                {savedToken ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Required to fetch repositories from private GitHub organizations or bypass default API limits.
            </p>
          </div>
        </div>
      </div>

      {/* Team Workspace management */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Users className="w-4.5 h-4.5 text-purple-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Team & Workspace Members</h3>
        </div>

        <div className="divide-y divide-slate-900/50">
          {team.map((member, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-800"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{member.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{member.email}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-semibold text-slate-400 rounded-full">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
