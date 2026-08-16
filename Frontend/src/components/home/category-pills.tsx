import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CATEGORIES = [
  'Tất cả',
  '🔥 Thịnh Hành',
  '🎧 Lo-Fi & Study',
  '⚡ EDM & Bass',
  '🌿 Acoustic & Chill',
  '🧘 Deep Focus',
  '☁️ Cloudinary Videos',
];

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function CategoryPills({
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelectCategory(cat)}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 18, paddingRight: 16 },
  pill: { backgroundColor: '#16162A', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#26264A' },
  pillSelected: { backgroundColor: '#7C3AED', borderColor: '#C084FC' },
  pillText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  pillTextSelected: { color: '#FFFFFF', fontWeight: '700' },
});
