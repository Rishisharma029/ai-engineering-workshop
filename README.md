# AI Developer Intelligence Platform (v6)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-20%2B%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-93.5%25-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![TypeScript](https://img.shields.io/badge/typescript-strict-blue)
![License](https://img.shields.io/badge/license-MIT-purple)
![Version](https://img.shields.io/badge/version-v1.0.0-orange)

A production-grade, portfolio-ready developer intelligence platform that transforms raw code repositories into structured engineering reports, interactive visual topologies, risk heatmaps, mock interview preparation decks, and ATS-scorecard resume packages.

It acts as an **AI CTO, Security Auditor, and Interview Coach** for software engineering portfolios.

---

## 🚀 Key Features

### 1. Repository Intelligence Inspector
- **3-Pane Split View**: Interactive File Tree explorer, Code Viewer pane, and AI Inspector sidebar.
- **AST Metrics Deck**: Generates complexity scores, maintainability indexes, security risk levels, and documentation coverage metrics.
- **Dependency & Import Map**: Scans and parses imported npm packages, resolving internal imports vs external packages dynamically.
- **Function Intelligence**: Lists every defined method with its estimated complexity, risk assessment, and technical purpose.

### 2. Executive Engineering Report Generator
- **Flagship Scorecard**: One-click generation of detailed developer audits.
- **11 Review Pillars**: Covers Executive Summary, Engineering Review, Architecture, Security, Performance, Testing, Documentation, Technical Debt, Startup Readiness, Hiring Recommendations, and CTO Advice.
- **Multi-Format Exporters**: Downloads print-ready `.txt` briefings, structured `.json` metrics, and Github-ready `.md` audits.

### 3. SVG Dependency Topology Explorer
- **Visual Canvas**: Renders SVG nodes with drag-to-pan, scroll-to-zoom, and layout reset capabilities.
- **Layer Filters**: Toggles visibility across Frontend SPA, Backend Server, API Routes, Services, Database Models, and Utilities.
- **Rich Floating Tooltips**: Displays complexity percentiles and layer descriptions on mouse hover.
- **Code Explorer Integration**: Clicking any node navigates directly to the corresponding source file.

### 4. Code Risk Heatmap & checklist
- **Interactive Grid**: Visualizes cyclomatic complexity and risk hotspots using color-coded grid blocks.
- **Column-Sorted checklist**: Sorts files by Risk, Complexity, Security, and Maintainability.
- **AI Audit Recommendation**: Details issues found, recommended fixes, and performance impact for the selected file.

### 5. AI Interview Coach & Viva prep
- **Readiness Gauges**: Displays competency bars for System Design, Behavior, Viva, Security, and Architecture.
- **Interactive Radar Chart**: Maps mock scoring metrics dynamically.
- **Weakness File Mapping**: Pinpoints security and architectural weaknesses directly to clickable source paths.
- **STAR Story Evaluator**: Analyzes user answers against expected responses, rating length and keyword matching.

### 6. Resume & LinkedIn Package Center
- **ATS Scorecard**: Radial gauges calculating resume strength, keyword coverage, and technical depth.
- **STAR Case-Study Generator**: Outlines situation, task, action, and results for key engineering achievements.
- **Exporters**: Downloads plain text, markdown, and print layout outreach templates.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Express, Node.js, TypeScript, SQL/SQLite database adapter.
- **Analytics Engine**: AST directory crawler and static code analyzer.

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository and navigate to the directory:
   ```bash
   cd "AI Engineering Workspace (Best Long-Term)   new project"
   ```
2. Install dependencies:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
3. Start the local dev servers:
   ```bash
   # Starts Vite client on http://localhost:3000 and API listener on port 5000
   npm run dev
   ```

---
*made by rishi sharma all rights reserved*
