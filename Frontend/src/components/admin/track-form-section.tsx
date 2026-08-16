import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface TrackFormSectionProps {
  title: string;
  setTitle: (t: string) => void;
  description: string;
  setDescription: (d: string) => void;
  artist: string;
  setArtist: (a: string) => void;
  disabled?: boolean;
}

export function TrackFormSection({
  title,
  setTitle,
  description,
  setDescription,
  artist,
  setArtist,
  disabled,
}: TrackFormSectionProps) {
  const [focusField, setFocusField] = useState<string | null>(null);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>3.</Text>
        <Text style={styles.cardTitle}>TRACK DETAILS</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <View style={[styles.inputBox, focusField === 'title' && styles.focused]}>
          <Text style={styles.icon}>✏️</Text>
          <TextInput
            style={styles.input}
            placeholder="Morning Study"
            placeholderTextColor="#64748B"
            value={title}
            onChangeText={setTitle}
            editable={!disabled}
            onFocus={() => setFocusField('title')}
            onBlur={() => setFocusField(null)}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <View style={[styles.inputBox, styles.textArea, focusField === 'desc' && styles.focused]}>
          <Text style={[styles.icon, { marginTop: 8 }]}>📄</Text>
          <TextInput
            style={[styles.input, styles.textAreaInput]}
            placeholder="Relaxing music for studying..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            editable={!disabled}
            onFocus={() => setFocusField('desc')}
            onBlur={() => setFocusField(null)}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Artist *</Text>
        <View style={[styles.inputBox, focusField === 'artist' && styles.focused]}>
          <Text style={styles.icon}>🎤</Text>
          <TextInput
            style={styles.input}
            placeholder="SimEnglish"
            placeholderTextColor="#64748B"
            value={artist}
            onChangeText={setArtist}
            editable={!disabled}
            onFocus={() => setFocusField('artist')}
            onBlur={() => setFocusField(null)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#16162A', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#26264A' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardNumber: { fontSize: 16, fontWeight: '800', color: '#7C3AED', marginRight: 6 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', flex: 1 },
  field: { marginBottom: 12 },
  label: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F1E', borderRadius: 10, borderWidth: 1, borderColor: '#26264A', paddingHorizontal: 10 },
  focused: { borderColor: '#06B6D4' },
  icon: { fontSize: 14, marginRight: 6 },
  input: { flex: 1, color: '#FFF', fontSize: 13, paddingVertical: 10 },
  textArea: { alignItems: 'flex-start', minHeight: 70 },
  textAreaInput: { textAlignVertical: 'top', paddingVertical: 6 },
});
