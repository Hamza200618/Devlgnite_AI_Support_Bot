import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getIndex } from '@/lib/ai/pinecone';
import { embedBatch } from '@/lib/ai/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { title, type, sourceUrl, content } = await req.json();

  const source = await prisma.knowledgeSource.create({
    data: { title, type, sourceUrl, content, status: 'processing' },
  });

  try {
    // 1. Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });
    const docs = await splitter.createDocuments([content || '']);

    // 2. Embed
    const vectors = await embedBatch(docs.map((d) => d.pageContent));

    // 3. Upsert to Pinecone
    const index = await getIndex();
    await index.upsert(
      docs.map((d, i) => ({
        id: `${source.id}-${i}`,
        values: vectors[i],
        metadata: {
          text: d.pageContent,
          source: sourceUrl || title,
          sourceId: source.id,
        },
      })),
    );

    // 4. Update status
    await prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: 'ready', chunkCount: docs.length },
    });

    return NextResponse.json({ ok: true, chunks: docs.length });
  } catch (err) {
    await prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: 'failed' },
    });
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}