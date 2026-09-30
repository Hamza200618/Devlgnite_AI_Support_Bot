import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { streamChatResponse } from '@/lib/ai/chain';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId = 'anon-session', channel = 'web' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let conversationId: string | null = null;
    let history: { role: 'user' | 'assistant'; content: string }[] = [];

    // Safely attempt database operations (without failing if DB is still synchronizing)
    try {
      let conversation = await prisma.conversation.findUnique({
        where: { sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { sessionId, channel },
          include: { messages: true },
        });
      }

      conversationId = conversation.id;

      // Save user message
      await prisma.message.create({
        data: { conversationId: conversation.id, role: 'user', content: message },
      });

      history = (conversation.messages || []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
    } catch (dbErr) {
      console.warn('Database operation skipped or failed:', dbErr);
    }

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let full = '';
        try {
          for await (const chunk of streamChatResponse(message, history)) {
            full += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err: any) {
          console.error('Streaming error:', err);
          controller.enqueue(encoder.encode('\n[Error generating response. Please check your API key]'));
        } finally {
          // Save assistant message to DB if available
          if (conversationId && full.trim()) {
            try {
              await prisma.message.create({
                data: { conversationId, role: 'assistant', content: full },
              });
            } catch (saveErr) {
              console.warn('Failed to save assistant message:', saveErr);
            }
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
