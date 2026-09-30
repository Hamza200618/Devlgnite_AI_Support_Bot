import { getIndex } from './pinecone';
import { embedText } from './embeddings';

export interface RetrievedChunk {
  text: string;
  score: number;
  source: string;
}

export async function retrieveContext(query: string, topK = 5): Promise<RetrievedChunk[]> {
  const index = await getIndex();
  const vector = await embedText(query);

  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return (results.matches ?? [])
    .filter((m) => (m.score ?? 0) > 0.7) // only confident matches
    .map((m) => ({
      text: (m.metadata?.text as string) ?? '',
      score: m.score ?? 0,
      source: (m.metadata?.source as string) ?? 'unknown',
    }));
}