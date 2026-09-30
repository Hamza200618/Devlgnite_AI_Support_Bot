import Link from 'next/link';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Bot, Sparkles, ShieldCheck, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C4F82A]/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navbar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#C4F82A] text-black flex items-center justify-center font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">DevIgnite AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <LayoutDashboard className="w-4 h-4 text-[#C4F82A]" />
              Admin Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-[#C4F82A] mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Autonomous AI Support Agent</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Supercharge Customer Support with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C4F82A] to-lime-400">
            Intelligent AI
          </span>
        </h1>
        
        <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
          Provide instant answers from your knowledge base, qualify incoming leads automatically, and seamlessly hand off high-value prospects to your team.
        </p>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-950/60 border border-lime-800/40 text-[#C4F82A] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">Instant RAG Responses</h3>
            <p className="text-sm text-slate-400">Vector-powered knowledge retrieval with zero hallucinations.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-950/60 border border-lime-800/40 text-[#C4F82A] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">Lead Qualification</h3>
            <p className="text-sm text-slate-400">Captures customer intent and syncs qualified leads automatically.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-950/60 border border-lime-800/40 text-[#C4F82A] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">Human Handoff</h3>
            <p className="text-sm text-slate-400">Smart escalation to live agents or direct Calendly booking.</p>
          </div>
        </div>

        <div className="mt-12 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-400 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4F82A] animate-pulse" />
          <span>Click the chat bubble in the bottom right corner to test the widget live!</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        DevIgnite AI Support Bot &copy; {new Date().getFullYear()}
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </main>
  );
}
