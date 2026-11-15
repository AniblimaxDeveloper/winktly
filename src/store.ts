import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = { id: string; role: 'user' | 'assistant'; content: string; ts: number };
export type Conversation = { id: string; title: string; messages: Message[]; ts: number };
export type Persona = { id: string; name: string; icon: string; prompt: string };

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  personas: Persona[];
  activePersonaId: string;
  hydrate: () => Promise<void>;
  save: () => Promise<void>;
  newChat: () => void;
  setActive: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
  clearCurrentChat: () => void;
  deleteConversation: (id: string) => void;
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
  setTemperature: (t: number) => void;
  setMaxTokens: (m: number) => void;
  addPersona: (p: Persona) => void;
  deletePersona: (id: string) => void;
  setActivePersona: (id: string) => void;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const KEY = 'winktly_state_v2';

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'default', name: 'Winktly Core', icon: '✨', prompt: 'Kamu adalah Winktly — asisten AI cerdas, profesional, serba bisa, dengan penalaran kritis mendalam. Jawab dengan jelas, terstruktur, akurat, dan mendalam. Gunakan markdown untuk formatting.' },
  { id: 'coder', name: 'Master Coder', icon: '💻', prompt: 'Kamu adalah Senior Software Engineer. Fokus pada penulisan kode yang bersih, aman, dan efisien. Selalu berikan penjelasan singkat di luar blok kode.' },
  { id: 'writer', name: 'Creative Writer', icon: '✍️', prompt: 'Kamu adalah penulis kreatif profesional. Gunakan bahasa yang indah, imajinatif, dan mendalam. Cocok untuk puisi, cerita, atau copywriting.' },
  { id: 'analyst', name: 'Data Analyst', icon: '📊', prompt: 'Kamu adalah analis data ahli. Berikan jawaban berbasis data, logis, gunakan poin-poin, dan sertakan kesimpulan yang tajam.' },
];

export const useChat = create<ChatState>((set, get) => ({
  conversations: [],
  activeId: null,
  apiKey: '',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 4096,
  personas: DEFAULT_PERSONAS,
  activePersonaId: 'default',

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        set({
          conversations: d.conversations ?? [],
          activeId: d.activeId ?? null,
          apiKey: d.apiKey ?? '',
          model: d.model ?? 'llama-3.3-70b-versatile',
          temperature: d.temperature ?? 0.7,
          maxTokens: d.maxTokens ?? 4096,
          personas: d.personas ?? DEFAULT_PERSONAS,
          activePersonaId: d.activePersonaId ?? 'default',
        });
      }
    } catch {}
  },

  save: async () => {
    const state = get();
    await AsyncStorage.setItem(KEY, JSON.stringify({
      conversations: state.conversations,
      activeId: state.activeId,
      apiKey: state.apiKey,
      model: state.model,
      temperature: state.temperature,
      maxTokens: state.maxTokens,
      personas: state.personas,
      activePersonaId: state.activePersonaId,
    }));
  },

  newChat: () => {
    const conv: Conversation = { id: uid(), title: 'Percakapan Baru', messages: [], ts: Date.now() };
    set((s) => ({ conversations: [conv, ...s.conversations], activeId: conv.id }));
    get().save();
  },

  setActive: (id) => { set({ activeId: id }); get().save(); },

  addMessage: (msg) => {
    const { activeId, conversations } = get();
    if (!activeId) return;
    set({
      conversations: conversations.map((c) => {
        if (c.id !== activeId) return c;
        const messages = [...c.messages, msg];
        const title = c.messages.length === 0 && msg.role === 'user' ? msg.content.slice(0, 40) : c.title;
        return { ...c, messages, title };
      }),
    });
    get().save();
  },

  updateMessage: (id, content) => {
    const { activeId, conversations } = get();
    set({
      conversations: conversations.map((c) =>
        c.id === activeId ? { ...c, messages: c.messages.map((m) => (m.id === id ? { ...m, content } : m)) } : c
      ),
    });
  },

  clearCurrentChat: () => {
    const { activeId, conversations } = get();
    set({
      conversations: conversations.map((c) => c.id === activeId ? { ...c, messages: [] } : c)
    });
    get().save();
  },

  deleteConversation: (id) => {
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }));
    get().save();
  },

  setApiKey: (k) => { set({ apiKey: k }); get().save(); },
  setModel: (m) => { set({ model: m }); get().save(); },
  setTemperature: (t) => { set({ temperature: t }); get().save(); },
  setMaxTokens: (m) => { set({ maxTokens: m }); get().save(); },
  
  addPersona: (p) => {
    set((s) => ({ personas: [...s.personas, p] }));
    get().save();
  },
  deletePersona: (id) => {
    if (id === 'default') return;
    set((s) => ({ personas: s.personas.filter((p) => p.id !== id), activePersonaId: s.activePersonaId === id ? 'default' : s.activePersonaId }));
    get().save();
  },
  setActivePersona: (id) => { set({ activePersonaId: id }); get().save(); },
}));
