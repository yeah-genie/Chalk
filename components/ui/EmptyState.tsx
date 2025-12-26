import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import Colors, { spacing, typography, radius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { NeonButton } from './NeonButton';
import { EmptyStudentsIcon, EmptyLessonsIcon, PlusIcon } from '@/components/Icons';

interface EmptyStateProps {
  type: 'students' | 'lessons' | 'custom';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  customIcon?: React.ReactNode;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  customIcon,
}: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const renderIcon = () => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'students':
        return <EmptyStudentsIcon size={80} color={colors.textMuted} />;
      case 'lessons':
        return <EmptyLessonsIcon size={80} color={colors.textMuted} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.delay(200)}
      style={styles.container}
    >
      <View style={styles.iconWrapper}>
        {renderIcon()}
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: colors.textMuted }]}>
        {description}
      </Text>
      
      {actionLabel && onAction && (
        <NeonButton
          title={actionLabel}
          variant="outline"
          glowColor="orange"
          icon={<PlusIcon size={18} color={colors.tint} />}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  iconWrapper: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 160,
  },
});

