import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography, spacing, radius, shadows } from '@/constants/Colors';
import { PlusIcon } from '@/components/Icons';

interface StudentPickerProps {
  students: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (student: { id: string; name: string }) => void;
}

export function StudentPicker({ students, selectedId, onSelect, onAdd, onDelete }: StudentPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>STUDENT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {students.map((student) => {
          const isSelected = selectedId === student.id;
          return (
            <Pressable
              key={student.id}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(student.id)}
              onLongPress={() => onDelete(student)}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                  {student.name[0]}
                </Text>
              </View>
              <Text style={[styles.name, isSelected && styles.nameSelected]}>
                {student.name}
              </Text>
            </Pressable>
          );
        })}

        <Pressable style={styles.addButton} onPress={onAdd}>
          <PlusIcon size={14} color={colors.accent.default} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </ScrollView>
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
  scrollContent: {
    paddingRight: spacing.xl,
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: 8,
  },
  itemSelected: {
    backgroundColor: colors.accent.muted,
    borderColor: colors.accent.default,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: colors.accent.default,
  },
  avatarText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
  },
  avatarTextSelected: {
    color: colors.text.inverse,
  },
  name: {
    ...typography.small,
    color: colors.text.secondary,
  },
  nameSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    gap: 6,
  },
  addText: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
