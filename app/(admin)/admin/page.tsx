import { PrismaClient } from '@prisma/client';
import { MessageSquare, Users, Target, TrendingUp, AlertTriangle } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminHome() {
  let convs = 0;
  let leads = 0;
  let qualified = 0;
  let handoffs = 0;
  let dbError: string | null = null;

  try {
    const results = await Promise.all([
      prisma.conversation.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { qualified: true } }),
      prisma.conversation.count({ where: { status: 'handed_off' } }),
    ]);
    [convs, leads, qualified, handoffs] = results;
  } catch (err: any) {
    console.error('Admin dashboard DB error:', err);
    dbError = err.message || 'Cannot reach database server';
  }

  const kpis = [
    { label: 'Total Conversations', value: convs, icon: MessageSquare },
    { label: 'Leads Captured', value: leads, icon: Users },
    { label: 'Qualified Leads', value: qualified, icon: Target },
    { label: 'Live Handoffs', value: handoffs, icon: TrendingUp },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time overview of AI chatbot interactions and lead captures</p>
        </div>
      </div>

      {dbError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Database Connection Issue</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Could not reach your PostgreSQL database. Please check your <code>DATABASE_URL</code> in <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center mb-3">
              <k.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{k.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}