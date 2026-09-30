import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { AlertTriangle, MessageSquare } from 'lucide-react';

const prisma = new PrismaClient();

export default async function ConversationsPage() {
  let conversations: any[] = [];
  let dbError: string | null = null;

  try {
    conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } }, lead: true },
      take: 50,
    });
  } catch (err: any) {
    console.error('Conversations page DB error:', err);
    dbError = err.message || 'Cannot reach database server';
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Conversations</h1>
        <p className="text-sm text-slate-500 mt-1">Review live chat histories and captured leads</p>
      </div>

      {dbError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Database Connection Issue</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Could not fetch conversations because the database is unreachable. Check your <code>DATABASE_URL</code> in <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {conversations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-slate-800 font-semibold text-sm">No conversations found</p>
            <p className="text-slate-400 text-xs mt-1">Start chatting using the widget on the homepage to see sessions appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-slate-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-slate-500">Channel</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-slate-500">Messages</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-slate-500">Lead</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {c.customerName ?? c.customerPhone ?? c.sessionId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 capitalize text-sm text-slate-600">{c.channel}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c._count?.messages ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.lead ? '✅' : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/conversations/${c.id}`}
                      className="text-lime-700 hover:text-lime-800 font-semibold text-sm"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}