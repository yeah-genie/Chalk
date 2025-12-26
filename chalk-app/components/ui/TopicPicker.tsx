import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/Colors';

interface TopicPickerProps {
  value: string;
  onChange: (text: string) => void;
  recentTopics: string[];
}

export function TopicPicker({ value, onChange, recentTopics }: TopicPickerProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = recentTopics.filter(t =>
    t.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>WHAT DID YOU COVER?</Text>
      <View>
        <TextInput
          style={styles.input}
          placeholder="e.g. Quadratic Equations, Essay #3..."
          placeholderTextColor={colors.text.muted}
          value={value}
          onChangeText={(text) => {
            onChange(text);
            setShowSuggestions(text.length > 0);
          }}
          onFocus={() => setShowSuggestions(value.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />

        {showSuggestions && filtered.length > 0 && (
          <View style={styles.suggestions}>
            {filtered.map((topic, i) => (
              <Pressable
                key={i}
                style={styles.suggestionItem}
                onPress={() => {
                  onChange(topic);
                  setShowSuggestions(false);
                }}
              >
                <Text style={styles.suggestionText}>{topic}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['2xl'],
    zIndex: 10,
  },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.text.primary,
    ...typography.body,
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
    maxHeight: 200,
    zIndex: 20,
  },
  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  suggestionText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
