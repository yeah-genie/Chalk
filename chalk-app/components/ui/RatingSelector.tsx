import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/Colors';
import { SmileFaceIcon, MehFaceIcon, SadFaceIcon } from '@/components/Icons';

interface RatingSelectorProps {
  value: 'good' | 'okay' | 'struggled' | null;
  onChange: (value: 'good' | 'okay' | 'struggled') => void;
}

const OPTIONS = [
  { id: 'good', label: 'Nailed it', Icon: SmileFaceIcon, color: colors.status.success },
  { id: 'okay', label: 'Needs Review', Icon: MehFaceIcon, color: colors.status.warning },
  { id: 'struggled', label: 'Struggled', Icon: SadFaceIcon, color: colors.status.error },
] as const;

export function RatingSelector({ value, onChange }: RatingSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>HOW DID IT GO?</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <Pressable
              key={option.id}
              style={[
                styles.option,
                isSelected && { backgroundColor: `${option.color}15`, borderColor: option.color }
              ]}
              onPress={() => onChange(option.id)}
            >
              <option.Icon
                size={28}
                color={isSelected ? option.color : colors.text.muted}
              />
              <Text style={[
                styles.optionLabel,
                isSelected && { color: option.color }
              ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['2xl'],
  },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  optionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});
