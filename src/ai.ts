const BASE_URL = 'https://api.groq.com/openai/v1';

export type AIModel = { id: string; name: string; desc: string; badge: string };
export const MODELS: AIModel[] = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Paling pintar & mendalam', badge: 'PRO' },
  { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 8B',  desc: 'Super cepat & ringan',   badge: 'FAST' },
  { id: 'gemma2-9b-it',            name: 'Gemma 2 9B',    desc: 'Google Gemma, seimbang', badge: 'GOOGLE' },
  { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8x7B',  desc: 'Context 32k, dokumen panjang', badge: 'LONG' },
];

export async function chatCompletion(opts: {
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const { apiKey, model, messages, systemPrompt, temperature = 0.7, maxTokens = 4096 } = opts;

  const finalMessages = systemPrompt?.trim()
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: finalMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Respons AI kosong');
  return content;
}
