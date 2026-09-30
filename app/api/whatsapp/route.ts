import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';
import { streamChatResponse } from '@/lib/ai/chain';

const prisma = new PrismaClient();
const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const from = form.get('From') as string;
  const body = form.get('Body') as string;

  const sessionId = `wa-${from.replace(/\D/g, '')}`;

  let conversation = await prisma.conversation.findUnique({
    where: { sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { sessionId, channel: 'whatsapp', customerPhone: from },
      include: { messages: true },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'user', content: body },
  });

  let full = '';
  for await (const chunk of streamChatResponse(body, conversation.messages as any)) {
    full += chunk;
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'assistant', content: full },
  });

  const twiml = new MessagingResponse();
  twiml.message(full);

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
