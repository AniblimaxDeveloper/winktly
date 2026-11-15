import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = { id: string; role: 'user' | 'assistant'; content: string; ts: number };
export type Conversation = { id: string; title: string; messages: Message[]; ts: number };

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  apiKey: string;
  model: string;
  systemPrompt: string;
  hydrate: () => Promise<void>;
  save: () => Promise<void>;
  newChat: () => void;
  setActive: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
  deleteConversation: (id: string) => void;
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
  setSystemPrompt: (p: string) => void;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const KEY = 'winktly_state_v1';

export const useChat = create<ChatState>((set, get) => ({
  conversations: [],
  activeId: null,
  apiKey: '',
  model: 'llama-3.3-70b-versatile',
  systemPrompt:
    'Kamu adalah Winktly — asisten AI cerdas, profesional, serba bisa, dengan penalaran kritis mendalam. Jawab dengan jelas, terstruktur, akurat, dan mendalam. Gunakan markdown untuk formatting. Jika pengguna meminta kode, berikan kode yang lengkap dan bisa langsung dijalankan.',

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
          systemPrompt: d.systemPrompt ?? get().systemPrompt,
        });
      }
    } catch {}
  },

  save: async () => {
    const { conversations, activeId, apiKey, model, systemPrompt } = get();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ conversations, activeId, apiKey, model, systemPrompt })
    );
  },

  newChat: () => {
    const conv: Conversation = {
      id: uid(),
      title: 'Percakapan Baru',
      messages: [],
      ts: Date.now(),
    };
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
        const title =
          c.messages.length === 0 && msg.role === 'user'
            ? msg.content.slice(0, 40)
            : c.title;
        return { ...c, messages, title };
      }),
    });
    get().save();
  },

  updateMessage: (id, content) => {
    const { activeId, conversations } = get();
    set({
      conversations: conversations.map((c) =>
        c.id === activeId
          ? { ...c, messages: c.messages.map((m) => (m.id === id ? { ...m, content } : m)) }
          : c
      ),
    });
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
  setSystemPrompt: (p) => { set({ systemPrompt: p }); get().save(); },
}));
