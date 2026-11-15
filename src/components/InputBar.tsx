import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { C } from '../theme';

export default function InputBar({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState('');

  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(t);
    setText('');
  };

  const active = text.trim().length > 0 && !disabled;

  return (
    <View style={s.wrap}>
      <TextInput
        style={s.input}
        placeholder="Tanya Winktly apa saja…"
        placeholderTextColor={C.textDim}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={8000}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[s.btn, !active && s.btnOff]}
        onPress={send}
        disabled={!active}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-up" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: C.bgAlt,
    color: C.text,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 130,
    borderWidth: 1,
    borderColor: C.border,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOff: { opacity: 0.35 },
});
