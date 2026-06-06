import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  MessageSquare, 
  ShieldAlert, 
  Network, 
  RefreshCw, 
  Zap, 
  ArrowRight,
  Star,
  CheckCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ onStartDemo, onLoginClick }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      title: 'Codebase RAG Chat',
      desc: 'Upload zip projects or connect GitHub. Ask questions and get answers referencing precise files.',
      icon: MessageSquare,
      color: 'text-purple-400'
    },
    {
      title: 'Static Security Audits',
      desc: 'Detect API keys leakage, SQL injection risks, and XSS vulnerabilities before they hit master.',
      icon: ShieldAlert,
      color: 'text-rose-400'
    },
    {
      title: 'Architecture Visualizer',
      desc: 'Generate interactive SVG graphs mapping frontend components, API endpoints, and database tables.',
      icon: Network,
      color: 'text-blue-400'
    },
    {
      title: 'Refactoring Sandbox',
      desc: 'Compare four refactoring styles (Clean, Optimized, Secure, Best Practice) side-by-side with automatic diff.',
      icon: RefreshCw,
      color: 'text-emerald-400'
    }
  ];


  const faqs = [
    {
      q: 'How does the codebase chat index my project?',
      a: 'We chunk your repository files, run them through an embedding model, and store them locally. When you chat, we run vector search to feed the most relevant files to the AI.'
    },
    {
      q: 'Do I need a paid OpenAI API key to run this?',
      a: 'No! If no API key is set, the application operates in an offline Demo Mode with highly detailed pre-loaded results. You can plug in your OpenAI key in settings to enable live analysis.'
    },
    {
      q: 'Can I import private repositories from GitHub?',
      a: 'Yes, if you configure a Personal Access Token or link via OAuth, the ingestion pipeline will securely read and analyze your repositories.'
    }
  ];

  return (
    <div className="bg-[#030712] min-h-screen text-slate-100 bg-dot-grid relative overflow-x-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-glow-purple rounded-full filter blur-[80px] -z-10"></div>
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-glow-blue rounded-full filter blur-[100px] -z-10"></div>

      {/* Top Navbar */}
      <nav className="h-16 px-6 max-w-7xl mx-auto flex items-center justify-between border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight font-title">AI Engineering Workspace</span>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={onLoginClick} className="text-xs font-semibold hover:text-purple-400 transition-all">
            Sign In
          </button>
          <button
            onClick={onStartDemo}
            className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-lg shadow-lg shadow-purple-950/40 transition-all text-white"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full mb-6">
            <Zap className="w-3 h-3 text-purple-400 fill-purple-400/20" />
            <span className="text-[10px] text-slate-300 font-semibold tracking-wider uppercase">V1.0.0 Now Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-title leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent max-w-3xl mx-auto">
            Interact with your codebase using AI Intelligence
          </h1>
          
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mt-6 leading-relaxed">
            Upload ZIPs, connect repositories, audit security vulnerability hotspots, run side-by-side refactoring modules, and visualize dynamic structure diagrams.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold rounded-lg shadow-xl transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-lg transition-all text-slate-300"
            >
              <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>Connect GitHub</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Product Teaser Dashboard Preview */}
      <section className="px-6 max-w-6xl mx-auto mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 shadow-2xl shadow-purple-950/10 relative"
        >
          {/* Glass frame browser headers */}
          <div className="flex items-center space-x-1.5 px-3 py-2 border-b border-slate-900/50 mb-3 bg-slate-950/80 rounded-t-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            <div className="w-60 h-4 bg-slate-900 rounded mx-auto border border-slate-800/50 flex items-center justify-center text-[8px] text-slate-500 font-mono">
              http://localhost:3000/workspace
            </div>
          </div>
          
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"
            alt="Workspace preview teaser"
            className="w-full rounded-lg h-72 sm:h-96 object-cover border border-slate-900 opacity-80"
          />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-title">Engineered for Developer Velocity</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">All the tools required to dissect codebases inside a unified workspace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-glow-purple filter blur-[40px] -z-10 opacity-30"></div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{feat.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-title">Loved by Developers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Connecting my backend Express app took less than 2 minutes. The refactoring studio detected a SQL injection loophole that saved us from a production blunder."
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80"
                alt="Dev avatar"
                className="w-8 h-8 rounded-full border border-slate-800 object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-200">Alex Rivera</p>
                <p className="text-[9px] text-slate-400">Senior Full-Stack Dev</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "The local vector search works out-of-the-box without PostgreSQL configurations. Running codebase chat queries locally feels like having an offline Senior Architect next to you."
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80"
                alt="Dev avatar"
                className="w-8 h-8 rounded-full border border-slate-800 object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-200">Sarah Jenkins</p>
                <p className="text-[9px] text-slate-400">Tech Lead, Startup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-title text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-800 bg-slate-950/40 rounded-lg overflow-hidden transition-all">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-slate-200 focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-all ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-900/50 pt-2 bg-slate-950/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Branding copyright footer (As requested by USER) */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-10 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4.5 h-4.5 text-purple-500" />
            <span className="text-xs font-bold font-title">AI Workspace</span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-slate-500 tracking-wide uppercase font-semibold font-mono">
              made by rishi sharma
            </p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">
              all rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
