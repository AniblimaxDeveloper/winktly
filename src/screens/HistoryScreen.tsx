import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../store';
import { C } from '../theme';

export default function HistoryScreen({ navigation }: any) {
  const { conversations, setActive, deleteConversation } = useChat();

  const open = (id: string) => {
    setActive(id);
    navigation.navigate('Chat');
  };

  const del = (id: string, title: string) => {
    Alert.alert('Hapus percakapan?', `"${title}" akan dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteConversation(id) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Riwayat</Text>
        <Text style={s.count}>{conversations.length} percakapan</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="chatbubbles-outline" size={52} color={C.textDim} />
          <Text style={s.emptyText}>Belum ada percakapan</Text>
          <Text style={s.emptyHint}>Mulai chat baru di tab Chat</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.item}
              onPress={() => open(item.id)}
              onLongPress={() => del(item.id, item.title)}
              activeOpacity={0.7}
            >
              <View style={s.itemIcon}>
                <Ionicons name="chatbubble-ellipses" size={18} color={C.primaryHi} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.itemSub}>
                  {item.messages.length} pesan • {new Date(item.ts).toLocaleDateString('id-ID')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => del(item.id, item.title)} style={s.del}>
                <Ionicons name="trash-outline" size={18} color={C.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  title: { color: C.text, fontSize: 22, fontWeight: '800' },
  count: { color: C.textMuted, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
  emptyHint: { color: C.textDim, fontSize: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  itemSub: { color: C.textMuted, fontSize: 11, marginTop: 4 },
  del: { padding: 8 },
});
