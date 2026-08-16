import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface HeaderNavProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function HeaderNav({ searchQuery, setSearchQuery }: HeaderNavProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {/* Top Logo & Upload CTA */}
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>🎵</Text>
          <Text style={styles.logoText}>TV<Text style={styles.logoHighlight}>MUSIC</Text></Text>
        </View>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => router.push('/admin' as any)}
        >
          <Text style={styles.uploadBtnText}>☁️ + Upload Track</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bài hát, ca sĩ, album..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoIcon: { fontSize: 22, color: '#38BDF8' },
  logoText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 },
  logoHighlight: { color: '#06B6D4' },
  uploadBtn: { backgroundColor: '#7C3AED', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, shadowColor: '#7C3AED', shadowOpacity: 0.4, shadowRadius: 6 },
  uploadBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16162A', borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: '#26264A' },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 13, paddingVertical: 10 },
  clearIcon: { color: '#94A3B8', fontSize: 12, padding: 4 },
});
