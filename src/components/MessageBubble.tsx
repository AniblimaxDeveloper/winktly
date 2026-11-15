import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { C } from '../theme';
import { Message } from '../store';

export default function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  const copy = async () => {
    await Clipboard.setStringAsync(msg.content);
    Alert.alert('✅ Tersalin', 'Pesan berhasil disalin ke clipboard.');
  };

  return (
    <View style={[s.wrap, isUser && s.wrapUser]}>
      <View style={[s.avatar, isUser ? s.avatarUser : s.avatarAI]}>
        <Text style={s.avatarText}>{isUser ? 'U' : 'W'}</Text>
      </View>
      <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAI]}>
          {isUser ? (
            <Text style={s.userText}>{msg.content}</Text>
          ) : (
            <Markdown style={md}>{msg.content || '▍'}</Markdown>
          )}
        </View>
        {!isUser && msg.content.length > 0 && (
          <TouchableOpacity style={s.copyBtn} onPress={copy}>
            <Text style={s.copyText}>📋 Salin</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', marginVertical: 6, paddingHorizontal: 12, gap: 8 },
  wrapUser: { flexDirection: 'row-reverse' },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  avatarUser: { backgroundColor: C.primary },
  avatarAI: { backgroundColor: C.accent },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: C.userBubble, borderTopRightRadius: 4 },
  bubbleAI: { backgroundColor: C.aiBubble, borderTopLeftRadius: 4, borderWidth: 1, borderColor: C.border },
  userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  copyBtn: { paddingHorizontal: 6, paddingVertical: 4, marginTop: 2 },
  copyText: { color: C.textDim, fontSize: 11 },
});

const md = {
  body: { color: C.text, fontSize: 15, lineHeight: 23 },
  heading1: { color: C.text, fontSize: 20, fontWeight: '800' as const, marginVertical: 8 },
  heading2: { color: C.text, fontSize: 18, fontWeight: '700' as const, marginVertical: 6 },
  heading3: { color: C.text, fontSize: 16, fontWeight: '600' as const, marginVertical: 4 },
  strong: { color: C.text, fontWeight: '700' as const },
  em: { color: C.text, fontStyle: 'italic' as const },
  link: { color: C.primaryHi },
  code_inline: { backgroundColor: C.surfaceHi, color: C.primaryHi, paddingHorizontal: 5, borderRadius: 4, fontFamily: 'monospace', fontSize: 13 },
  code_block: { backgroundColor: C.bgAlt, color: C.text, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.border, fontFamily: 'monospace', fontSize: 13, marginVertical: 6 },
  fence: { backgroundColor: C.bgAlt, color: C.text, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.border, fontFamily: 'monospace', fontSize: 13, marginVertical: 6 },
  blockquote: { backgroundColor: C.surfaceHi, borderLeftColor: C.primary, borderLeftWidth: 3, paddingLeft: 10, marginVertical: 4, paddingVertical: 4 },
  bullet_list: { color: C.text },
  ordered_list: { color: C.text },
  list_item: { color: C.text, marginVertical: 2 },
  hr: { backgroundColor: C.border, height: 1, marginVertical: 8 },
};
