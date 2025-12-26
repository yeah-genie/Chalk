import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors, { radius, spacing, shadows } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PencilIcon, UsersIcon, ChartIcon, ClockIcon } from '@/components/Icons';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const tabBarHeight = 64;
  const tabBarBottom = Math.max(insets.bottom, 16);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: tabBarBottom,
          left: 16,
          right: 16,
          height: tabBarHeight,
          borderRadius: radius.xxl,
          backgroundColor: colorScheme === 'dark' 
            ? 'rgba(18, 30, 25, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          paddingBottom: 0,
          paddingTop: 0,
          ...shadows.lg,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '수업',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme}>
              <PencilIcon size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: '학생',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme}>
              <UsersIcon size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme}>
              <ClockIcon size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: '포트폴리오',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme}>
              <ChartIcon size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ 
  focused, 
  colorScheme,
  children 
}: { 
  focused: boolean; 
  colorScheme: 'light' | 'dark';
  children: React.ReactNode;
}) {
  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerFocused,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
  },
});
