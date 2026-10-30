// src/services/gemini.ts
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
].filter(Boolean) as string[];;

export async function callGeminiWithFallback(contents: any[], systemInstructionText: string): Promise<string> {
  const models = ['gemini-2.0-flash', 'gemini-3.5-flash-lite'];
  let lastErrorMessage = '';

  for (const apiKey of GEMINI_API_KEYS) {
    if (!apiKey) continue;
    const ai = new GoogleGenAI({ apiKey });

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction: systemInstructionText },
        });
        if (response.text) return response.text;
      } catch (err: any) {
        lastErrorMessage = err?.message || JSON.stringify(err);
        const isQuotaExhausted =
          err?.status === 429 ||
          lastErrorMessage.includes('RESOURCE_EXHAUSTED') ||
          lastErrorMessage.includes('Quota exceeded');

        if (isQuotaExhausted) break;
        if (err?.status === 400 || lastErrorMessage.includes('400')) throw new Error(lastErrorMessage);
      }
    }
  }
  throw new Error(lastErrorMessage || 'All API keys or models exhausted.');
}