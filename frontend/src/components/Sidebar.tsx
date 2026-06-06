import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  MessageSquare, 
  ShieldAlert, 
  FileText, 
  Network, 
  RefreshCw, 
  FileBadge, 
  Settings, 
  ChevronDown,
  Terminal,
  Flame,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  projects: any[];
  activeProject: any;
  onProjectChange: (proj: any) => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({
  projects,
  activeProject,
  onProjectChange,
  activePage,
  onPageChange
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Repository', icon: FolderGit2 },
    { id: 'chat', label: 'AI Code Chat', icon: MessageSquare },
    { id: 'security', label: 'Security Scanner', icon: ShieldAlert },
    { id: 'heatmap', label: 'Risk Heatmap', icon: Flame },
    { id: 'docs', label: 'Documentation', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'refactor', label: 'Refactoring Sandbox', icon: RefreshCw },
    { id: 'interview', label: 'Interview Prep', icon: GraduationCap },
    { id: 'resume', label: 'Resume Builder', icon: FileBadge },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-850 space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-title text-slate-100 leading-none">AI Workshop</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Engineering Suite</span>
          </div>
        </div>

        {/* Project Switcher */}
        <div className="p-4 border-b border-slate-900">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 px-2">
            Active Project
          </label>
          <div className="relative">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const proj = projects.find(p => p.id === parseInt(e.target.value, 10));
                if (proj) onProjectChange(proj);
              }}
              className="w-full appearance-none bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none transition-all cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value="">No Projects Loaded</option>
              ) : (
                projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4.5 h-4.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-900/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding copyright (As requested by USER) */}
      <div className="p-4 border-t border-slate-900 text-center">
        <p className="text-[10px] text-slate-500 tracking-wide uppercase font-semibold font-mono">
          made by rishi sharma
        </p>
        <p className="text-[8px] text-slate-600 font-mono mt-0.5">
          all rights reserved
        </p>
      </div>
    </aside>
  );
}
