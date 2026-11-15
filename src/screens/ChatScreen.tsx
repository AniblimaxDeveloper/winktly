import React, { useRef, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChat, Message } from '../store';
import { chatCompletion } from '../ai';
import { C } from '../theme';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default function ChatScreen() {
  const { conversations, activeId, newChat, addMessage, updateMessage, clearCurrentChat, apiKey, model, temperature, maxTokens, personas, activePersonaId, setActivePersona } = useChat();
  const active = conversations.find((c) => c.id === activeId);
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];
  
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => { if (!activeId) newChat(); }, []);

  const scrollDown = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const typewriter = (id: string, fullText: string) => {
    let i = 0;
    const step = Math.max(1, Math.ceil(fullText.length / 400));
    const interval = setInterval(() => {
      i += step;
      updateMessage(id, fullText.slice(0, i));
      scrollDown();
      if (i >= fullText.length) clearInterval(interval);
    }, 14);
  };

  const onSend = async (text: string) => {
    if (!apiKey) return Alert.alert('🔑 API Key Kosong', 'Buka tab Settings dan masukkan API key Groq kamu.');
    if (!active) return;

    const userMsg: Message = { id: uid(), role: 'user', content: text, ts: Date.now() };
    addMessage(userMsg);
    scrollDown();
    setLoading(true);

    const aiId = uid();
    addMessage({ id: aiId, role: 'assistant', content: '', ts: Date.now() });

    try {
      const history = [...active.messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatCompletion({ 
        apiKey, model, messages: history, 
        systemPrompt: activePersona.prompt, temperature, maxTokens 
      });
      typewriter(aiId, reply);
    } catch (e: any) {
      updateMessage(aiId, `⚠️ **Error:** ${e.message ?? 'Gagal menghubungi AI'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert('Bersihkan Chat?', 'Semua pesan di percakapan ini akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: clearCurrentChat }
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <LinearGradient colors={[C.surface, C.bg]} style={s.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={s.title}>Winktly</Text>
            <View style={s.dot} />
          </View>
          <Text style={s.subtitle}>{model} • {activePersona.name} {loading ? '• mengetik…' : ''}</Text>
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={handleClear}><Ionicons name="trash" size={18} color={C.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={s.newBtn} onPress={() => newChat()}><Ionicons name="add" size={18} color={C.text} /><Text style={s.newText}>Baru</Text></TouchableOpacity>
      </LinearGradient>

      {/* Persona Selector Horizontal Scroll */}
      <View style={s.personaBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {personas.map(p => (
            <TouchableOpacity key={p.id} style={[s.personaChip, activePersonaId === p.id && s.personaChipActive]} onPress={() => setActivePersona(p.id)}>
              <Text style={s.personaIcon}>{p.icon}</Text>
              <Text style={[s.personaName, activePersonaId === p.id && { color: C.primaryHi }]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!active || active.messages.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{activePersona.icon}</Text>
            <Text style={s.emptyTitle}>{activePersona.name}</Text>
            <Text style={s.emptyText}>Siap membantu Anda dengan keahlian khusus. Mulai ketik pesan di bawah.</Text>
          </View>
        ) : (
          <FlatList ref={listRef} data={active.messages} keyExtractor={(m) => m.id} renderItem={({ item }) => <MessageBubble msg={item} />} contentContainerStyle={{ paddingVertical: 8, paddingBottom: 20 }} onContentSizeChange={scrollDown} removeClippedSubviews={false} />
        )}
        <InputBar onSend={onSend} disabled={loading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  title: { color: C.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
  subtitle: { color: C.textMuted, fontSize: 11, marginTop: 2 },
  iconBtn: { padding: 8 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.surfaceHi, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  newText: { color: C.text, fontSize: 13, fontWeight: '600' },
  personaBar: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  personaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  personaChipActive: { backgroundColor: C.surfaceHi, borderColor: C.primary },
  personaIcon: { fontSize: 14 },
  personaName: { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: C.text, fontSize: 24, fontWeight: '800', marginBottom: 10 },
  emptyText: { color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
