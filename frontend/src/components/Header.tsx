import React, { useState } from 'react';
import { Upload, GitBranch, LogOut, Code, User, AlertCircle } from 'lucide-react';

interface HeaderProps {
  user: any;
  activeProject: any;
  onSignOut: () => void;
  onUploadClick: () => void;
  onGithubClick: () => void;
  activePage: string;
}

export default function Header({
  user,
  activeProject,
  onSignOut,
  onUploadClick,
  onGithubClick,
  activePage
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Format page name for display
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Project Workspace';
      case 'analysis': return 'Repository Intelligence';
      case 'chat': return 'Codebase RAG Chat';
      case 'security': return 'Vulnerability Audit';
      case 'docs': return 'Documentation Studio';
      case 'architecture': return 'Architecture Visualizer';
      case 'refactor': return 'Refactoring Sandbox';
      case 'resume': return 'Achievement Builder';
      case 'heatmap': return 'Risk Heatmap';
      case 'interview': return 'Interview Readiness Center';
      case 'settings': return 'Workspace Settings';
      default: return 'AI Workspace';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Section Details */}
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold font-title text-slate-100">{getPageTitle()}</h2>
        {activeProject && (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs text-slate-400">
            {activeProject.type === 'GITHUB' ? (
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="font-medium text-slate-300 max-w-[150px] truncate">{activeProject.name}</span>
          </div>
        )}
      </div>

      {/* Right: Quick actions and user details */}
      <div className="flex items-center space-x-4">
        {/* Quick Upload Buttons */}
        <button
          onClick={onUploadClick}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload ZIP</span>
        </button>

        <button
          onClick={onGithubClick}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all shadow-md shadow-purple-900/20"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Import GitHub</span>
        </button>

        <div className="h-5 w-px bg-slate-800"></div>

        {/* User Account Info */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name || 'User Avatar'}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200">{user?.name || 'Developer'}</p>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium uppercase">{user?.role || 'DEVELOPER'}</p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2.5 w-48 rounded-lg border border-slate-800 bg-slate-950 p-1.5 shadow-xl z-20">
                <div className="px-3 py-2 border-b border-slate-900">
                  <p className="text-xs font-medium text-slate-400">Signed in as</p>
                  <p className="text-xs font-bold text-slate-200 truncate">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 rounded-md transition-all text-left mt-1"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
