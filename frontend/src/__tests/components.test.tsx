import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../pages/Dashboard.js';
import Heatmap from '../pages/Heatmap.js';
import RepositoryAnalysis from '../pages/RepositoryAnalysis.js';
import AIChat from '../pages/AIChat.js';
import Architecture from '../pages/Architecture.js';

// Setup mock project dataset
const mockProject = {
  id: 1,
  name: 'Test-Repo-Engine',
  description: 'AI intelligence platform repository',
  tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Express'],
  metrics: {
    security: 82,
    documentation: 76,
    testCoverage: 65,
    maintainability: 89,
    performance: 78,
    overall: 78
  },
  folder_structure: {
    name: 'Root',
    path: '',
    type: 'directory',
    size: 5000,
    children: [
      { name: 'src', path: 'src', type: 'directory', size: 4000, children: [
        { name: 'server.ts', path: 'src/server.ts', type: 'file', size: 2000, language: 'TypeScript' },
        { name: 'db.ts', path: 'src/db.ts', type: 'file', size: 2000, language: 'TypeScript' }
      ]},
      { name: 'package.json', path: 'package.json', type: 'file', size: 1000, language: 'JSON' }
    ]
  },
  executive_summary: {
    overview: 'This is a test repository built using React and Express.',
    purpose: 'Serve as a secure workspace.',
    architecture: 'Layered MVC with API routes and db config.',
    technologies: ['React', 'Express', 'SQLite'],
    strengths: ['Strict TS checks', 'Isolated models'],
    risks: ['Hardcoded secret key in config', 'concatenated inputs in query']
  },
  insights: {
    complexFiles: [{ path: 'src/server.ts', complexity: 80, risk: 60 }],
    riskyFiles: [{ path: 'src/db.ts', complexity: 70, risk: 90 }],
    bottlenecks: [{ file: 'src/db.ts', desc: 'Direct query interpolation' }],
    deadCode: [{ file: 'src/helper.ts', desc: 'Unused exports' }]
  },
  heatmap: [
    { path: 'src/server.ts', risk: 60, complexity: 80, security: 95, maintainability: 80, performance: 85, documentation: 90, testing: 70 },
    { path: 'src/db.ts', risk: 90, complexity: 70, security: 20, maintainability: 85, performance: 80, documentation: 60, testing: 50 }
  ],
  interview_prep: [
    { question: 'Explain the migration safety checks.', expected: 'ALTER TABLE queries check existing details.', category: 'Architecture', difficulty: 'Medium' }
  ],
  resume_data: {
    points: ['Created dual-persistence drivers for Postgres/SQLite.'],
    linkedin: 'Fullstack developer specializing in RAG systems',
    talkingPoints: ['Migrations checking heuristics']
  },
  timeline: [
    { stage: 'Repository Created', description: 'Initial import', status: 'Safe', timestamp: '2026-06-01' }
  ],
  dependencies_intel: [
    { name: 'express', status: 'Safe', version: '^4.19.2', recommendation: 'Keep stable.' }
  ],
  v4_analysis: {
    engineeringReviewReport: {
      overallScore: 78,
      grade: 'B+',
      hiringRecommendation: 'Mid Level',
      scores: {
        engineering: 78,
        architecture: 89,
        security: 82,
        performance: 78,
        testing: 65,
        documentation: 76,
        maintainability: 89
      }
    }
  }
};

describe('Frontend Pages Rendering', () => {

  it('Dashboard Page renders metrics and charts layout', () => {
    const mockOnPageChange = vi.fn();
    const mockOnGenerateDoc = vi.fn();
    const mockOnProjectChange = vi.fn();

    render(
      <Dashboard 
        activeProject={mockProject} 
        projects={[mockProject]} 
        onPageChange={mockOnPageChange}
        onGenerateDoc={mockOnGenerateDoc}
        onProjectChange={mockOnProjectChange}
      />
    );

    // Verify Project Name is rendered
    expect(screen.getAllByText('Test-Repo-Engine')[0]).toBeInTheDocument();
    
    // Verify Health Metrics display
    expect(screen.getAllByText('78%')[0]).toBeInTheDocument();
    expect(screen.getByText('Hiring Recommendation')).toBeInTheDocument();
  });

  it('Heatmap Page renders file lists and risk indicators', () => {
    const mockNavigate = vi.fn();
    render(<Heatmap activeProject={mockProject} onNavigateToFile={mockNavigate} />);

    // Check header title
    expect(screen.getByText('Code Intelligence Heatmap')).toBeInTheDocument();
    
    // Verify file names inside heatmap table are rendered
    expect(screen.getAllByText('src/server.ts')[0]).toBeInTheDocument();
    expect(screen.getAllByText('src/db.ts')[0]).toBeInTheDocument();
  });

  it('Repository Inspector Page renders folder directory files tree', () => {
    render(<RepositoryAnalysis activeProject={mockProject} />);

    // Verify Repository inspector search input exists
    expect(screen.getByPlaceholderText(/Search files/i)).toBeInTheDocument();
    
    // Verify folder directory structure names render
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('AI Chat Copilot Page displays dialogue panels and prompt inputs', () => {
    render(
      <AIChat 
        activeProject={mockProject} 
        selectedProvider="gemini-2.5-pro"
        onProviderChange={() => {}}
        providerMetrics={null}
        onSetProviderMetrics={() => {}}
      />
    );

    // Verify text inputs and quick actions are displayed
    expect(screen.getByPlaceholderText(/Ask anything about the codebase/i)).toBeInTheDocument();
    expect(screen.getByText('Explain the database and schemas in this project.')).toBeInTheDocument();
    expect(screen.getByText('Scan the codebase for security risks or hardcoded secrets.')).toBeInTheDocument();
  });

  it('Architecture Explorer renders SVG topology networks canvas', async () => {
    console.log("STARTING ARCHITECTURE TEST");
    render(<Architecture activeProject={mockProject} />);
    console.log("RENDERED ARCHITECTURE COMPONENT");

    // Verify zooming and panning controls exist
    const el = await screen.findByText(/Express API Server/i);
    console.log("FOUND ELEMENT:", el ? el.textContent : "null");
    expect(el).toBeInTheDocument();
    expect(await screen.findByText(/Client \(UI\)/i)).toBeInTheDocument();
  });
});
