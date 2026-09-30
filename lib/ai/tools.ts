import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const captureLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  intent: z.enum(['pricing', 'demo', 'support', 'other']).optional(),
});

export async function captureLead(conversationId: string, data: z.infer<typeof captureLeadSchema>) {
  const lead = await prisma.lead.upsert({
    where: { conversationId },
    create: { conversationId, ...data, qualified: !!(data.email && data.intent) },
    update: data,
  });

  // Notify sales
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-lead`, {
    method: 'POST',
    body: JSON.stringify(lead),
  }).catch(() => {});

  return lead;
}

export async function createCalendlyLink(email: string, name: string) {
  const res = await fetch('https://api.calendly.com/scheduling_links', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      max_event_count: 1,
      owner: process.env.CALENDLY_EVENT_TYPE_URI,
      owner_type: 'EventType',
    }),
  });
  const data = await res.json();
  return data.resource.booking_url as string;
}