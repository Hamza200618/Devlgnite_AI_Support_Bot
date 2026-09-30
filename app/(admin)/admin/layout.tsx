import Link from 'next/link';
import { LayoutDashboard, MessageSquare, ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Nav */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-[#C4F82A]">DevIgnite Admin</span>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
              <Link href="/admin" className="hover:text-white flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" /> Overview
              </Link>
              <Link href="/admin/conversations" className="hover:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Conversations
              </Link>
            </nav>
          </div>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
