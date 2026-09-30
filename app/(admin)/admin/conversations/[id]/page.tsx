import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, User, Bot } from 'lucide-react';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      lead: true,
    },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/admin/conversations"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to conversations
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Conversation: {conversation.sessionId}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Channel: <strong className="capitalize">{conversation.channel}</strong></span>
          <span>Status: <strong className="capitalize">{conversation.status}</strong></span>
          <span>Created: {new Date(conversation.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Messages</h2>
        {conversation.messages.length === 0 ? (
          <p className="text-sm text-slate-400">No messages in this conversation yet.</p>
        ) : (
          conversation.messages.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl text-sm ${
                m.role === 'user'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-lime-50 border border-lime-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 font-semibold text-xs text-slate-500 uppercase">
                {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{m.role}</span>
                <span className="text-slate-400 font-normal">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
