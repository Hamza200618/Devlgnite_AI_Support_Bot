import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { retrieveContext } from './retriever';
import { SYSTEM_PROMPT } from './prompts';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* streamChatResponse(
  query: string,
  history: { role: 'user' | 'assistant'; content: string }[],
) {
  // 1. Retrieve relevant chunks (catch error gracefully if Pinecone is not yet initialized)
  let chunks: any[] = [];
  try {
    if (process.env.PINECONE_API_KEY) {
      chunks = await retrieveContext(query);
    }
  } catch (e) {
    console.warn('Vector retrieval skipped or not configured:', e);
  }

  const context = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');

  // 2. Build system prompt
  const historyText = history.map((m) => `${m.role}: ${m.content}`).join('\n');
  const systemMessage = SYSTEM_PROMPT
    .replace('{COMPANY_NAME}', 'DevIgnite Studio')
    .replace('{COMPANY_DESCRIPTION}', 'a SaaS development studio')
    .replace('{CONTEXT}', context || 'No knowledge base documents uploaded yet.')
    .replace('{HISTORY}', historyText);

  // 3. Check for Google Gemini vs OpenAI
  const googleKey = process.env.GOOGLE_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (googleKey) {
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: systemMessage,
    });

    const chatHistory = history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    // Retry with exponential backoff on 503 / 429 temporary spikes
    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessageStream(query);

        let streamedAny = false;
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            streamedAny = true;
            yield text;
          }
        }

        if (streamedAny) return chunks;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini attempt ${attempt} failed (will retry if temporary):`, err.message);
        if (attempt < 3 && (err.message?.includes('503') || err.message?.includes('429'))) {
          await sleep(1000 * attempt); // wait 1s, then 2s
          continue;
        }
        break;
      }
    }

    if (lastError) {
      console.error('Final Gemini Error:', lastError);
      yield `\n[AI busy: Temporary high demand on Google servers. Please try again in a moment.]`;
    }
    return chunks;
  }

  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemMessage },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: query },
      ];

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) yield text;
      }
    } catch (err: any) {
      console.error('OpenAI Error:', err);
      yield `\n[AI Error: ${err.message || 'Unable to connect to OpenAI.'}]`;
    }
    return chunks;
  }

  // Fallback if no keys configured
  yield "Hello! I am DevIgnite AI. Please configure your `GOOGLE_API_KEY` or `OPENAI_API_KEY` in `.env` to enable live AI responses.";
  return chunks;
}