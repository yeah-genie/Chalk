import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { spacing, typography, radius, shadows } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from '@/components/Icons';
import { ToastType } from '@/data/types';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, dismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircleIcon size={20} color={colors.success} />,
          bgColor: colors.successMuted,
          borderColor: colors.success,
        };
      case 'error':
        return {
          icon: <XIcon size={20} color={colors.error} />,
          bgColor: colors.errorMuted,
          borderColor: colors.error,
        };
      case 'warning':
        return {
          icon: <AlertCircleIcon size={20} color={colors.warning} />,
          bgColor: colors.warningMuted,
          borderColor: colors.warning,
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon size={20} color={colors.info} />,
          bgColor: colors.infoMuted,
          borderColor: colors.info,
        };
    }
  };

  if (!visible) return null;

  const { icon, bgColor, borderColor } = getIconAndColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing.md,
          backgroundColor: colors.backgroundElevated,
          borderColor: borderColor,
        },
        shadows.md,
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        )}
      </View>
      <Pressable
        onPress={dismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.closeButton}
      >
        <XIcon size={16} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

// Toast Hook
import { useState, useCallback as useCallbackHook } from 'react';

export function useToast() {
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
  });

  const showToast = useCallbackHook(
    (type: ToastType, title: string, message?: string) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );

  const hideToast = useCallbackHook(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    success: (title: string, message?: string) => showToast('success', title, message),
    error: (title: string, message?: string) => showToast('error', title, message),
    warning: (title: string, message?: string) => showToast('warning', title, message),
    info: (title: string, message?: string) => showToast('info', title, message),
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    zIndex: 9999,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.bodyMedium,
  },
  message: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
});

