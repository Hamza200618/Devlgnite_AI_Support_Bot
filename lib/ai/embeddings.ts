import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getEmbeddingClient() {
  const googleKey = process.env.GOOGLE_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (googleKey) {
    return { type: 'google' as const, client: new GoogleGenerativeAI(googleKey) };
  }
  if (openaiKey) {
    return { type: 'openai' as const, client: new OpenAI({ apiKey: openaiKey }) };
  }
  return null;
}

export async function embedText(text: string): Promise<number[]> {
  const ai = getEmbeddingClient();
  if (!ai) {
    throw new Error('No AI API key found (provide GOOGLE_API_KEY or OPENAI_API_KEY).');
  }

  if (ai.type === 'google') {
    const model = ai.client.getGenerativeModel({ model: 'text-embedding-004' });
    const res = await model.embedContent(text);
    return res.embedding.values;
  }

  const res = await ai.client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const ai = getEmbeddingClient();
  if (!ai) {
    throw new Error('No AI API key found (provide GOOGLE_API_KEY or OPENAI_API_KEY).');
  }

  if (ai.type === 'google') {
    const model = ai.client.getGenerativeModel({ model: 'text-embedding-004' });
    const results: number[][] = [];
    for (const text of texts) {
      const res = await model.embedContent(text);
      results.push(res.embedding.values);
    }
    return results;
  }

  const res = await ai.client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}