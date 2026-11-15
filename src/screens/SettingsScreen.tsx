import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useChat } from '../store';
import { MODELS } from '../ai';
import { C } from '../theme';

export default function SettingsScreen() {
  const { apiKey, setApiKey, model, setModel, temperature, setTemperature, maxTokens, setMaxTokens, personas, deletePersona } = useChat();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const saveKey = () => { setApiKey(keyInput.trim()); Alert.alert('✅ Tersimpan', 'API key berhasil disimpan.'); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <Text style={s.title}>Pengaturan</Text>

        <Text style={s.label}>🔑 API Key (Groq)</Text>
        <View style={s.inputRow}>
          <TextInput style={s.input} value={keyInput} onChangeText={setKeyInput} placeholder="gsk_..." placeholderTextColor={C.textDim} secureTextEntry={!showKey} autoCapitalize="none" />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowKey(!showKey)}><Ionicons name={showKey ? 'eye-off' : 'eye'} size={20} color={C.textMuted} /></TouchableOpacity>
        </View>
        <TouchableOpacity style={s.btn} onPress={saveKey}><Text style={s.btnText}>Simpan API Key</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://console.groq.com/keys')}><Text style={s.link}>→ Dapatkan API key gratis</Text></TouchableOpacity>

        <Text style={s.label}>🧠 Model AI</Text>
        {MODELS.map((m) => (
          <TouchableOpacity key={m.id} style={[s.model, model === m.id && s.modelActive]} onPress={() => setModel(m.id)} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.modelName}>{m.name}</Text>
                <View style={s.badge}><Text style={s.badgeText}>{m.badge}</Text></View>
              </View>
              <Text style={s.modelDesc}>{m.desc}</Text>
            </View>
            {model === m.id && <Ionicons name="checkmark-circle" size={22} color={C.primaryHi} />}
          </TouchableOpacity>
        ))}

        <Text style={s.label}>🎛️ Parameter Lanjutan</Text>
        <View style={s.sliderBox}>
          <View style={s.rowBetween}>
            <Text style={s.sliderLabel}>Kreativitas (Temperature)</Text>
            <Text style={s.sliderVal}>{temperature.toFixed(1)}</Text>
          </View>
          <Slider minimumValue={0} maximumValue={1.5} step={0.1} value={temperature} onValueChange={setTemperature} minimumTrackTintColor={C.primary} maximumTrackTintColor={C.border} thumbTintColor={C.primaryHi} />
          <Text style={s.hint}>Rendah = Fokus/Akurat. Tinggi = Kreatif/Liar.</Text>
        </View>

        <View style={s.sliderBox}>
          <View style={s.rowBetween}>
            <Text style={s.sliderLabel}>Batas Panjang (Max Tokens)</Text>
            <Text style={s.sliderVal}>{maxTokens}</Text>
          </View>
          <Slider minimumValue={512} maximumValue={8192} step={256} value={maxTokens} onValueChange={setMaxTokens} minimumTrackTintColor={C.primary} maximumTrackTintColor={C.border} thumbTintColor={C.primaryHi} />
        </View>

        <Text style={s.label}>🎭 Kelola Persona AI</Text>
        {personas.map(p => (
          <View key={p.id} style={s.personaRow}>
            <Text style={{ fontSize: 20 }}>{p.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.modelName}>{p.name}</Text>
              <Text style={s.modelDesc} numberOfLines={1}>{p.prompt}</Text>
            </View>
            {p.id !== 'default' && (
              <TouchableOpacity onPress={() => Alert.alert('Hapus?', `Hapus persona ${p.name}?`, [{ text: 'Batal' }, { text: 'Hapus', style: 'destructive', onPress: () => deletePersona(p.id) }])}>
                <Ionicons name="trash-outline" size={18} color={C.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={s.footer}>
          <Text style={s.version}>Winktly v2.0.0 Pro</Text>
          <Text style={s.versionSub}>Powered by Groq & Llama 3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  title: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  label: { color: C.textMuted, fontSize: 12, fontWeight: '700', marginTop: 22, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: C.surface, color: C.text, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: C.border },
  eyeBtn: { padding: 10, marginLeft: 4 },
  btn: { backgroundColor: C.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  link: { color: C.primaryHi, fontSize: 12, marginTop: 10 },
  model: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  modelActive: { borderColor: C.primary, backgroundColor: C.surfaceHi },
  modelName: { color: C.text, fontSize: 14, fontWeight: '600' },
  modelDesc: { color: C.textMuted, fontSize: 11, marginTop: 3 },
  badge: { backgroundColor: C.surfaceHi, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: C.border },
  badgeText: { color: C.primaryHi, fontSize: 9, fontWeight: '700' },
  sliderBox: { backgroundColor: C.surface, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderLabel: { color: C.text, fontSize: 13, fontWeight: '600' },
  sliderVal: { color: C.primaryHi, fontSize: 13, fontWeight: '800' },
  hint: { color: C.textDim, fontSize: 10, marginTop: 4 },
  personaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border, gap: 10 },
  footer: { alignItems: 'center', marginTop: 40, gap: 4 },
  version: { color: C.textDim, fontSize: 12, fontWeight: '600' },
  versionSub: { color: C.textDim, fontSize: 10 },
});
