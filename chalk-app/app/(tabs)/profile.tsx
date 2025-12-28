import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/constants/Colors';
import { layout } from '@/components/ui/Theme';
import { Card } from '@/components/ui/Card';
import { IntegrationCard, IntegrationStatus } from '@/components/ui/IntegrationCard';
import { useGoogleAuth } from '@/lib/useGoogleAuth';
import { useZoomAuth } from '@/lib/useZoomAuth';
import { useStripeAuth } from '@/lib/useStripeAuth';
import { useNotifications } from '@/lib/useNotifications';
import { ChevronRightIcon, UsersIcon } from '@/components/Icons';
import { StudentManager } from '@/components/ui/StudentManager';
import { useData } from '@/lib/DataContext';

// Logo images
const GoogleCalendarLogo = require('@/assets/images/google-calendar.png');
const ZoomLogo = require('@/assets/images/zoom.png');
const StripeLogo = require('@/assets/images/stripe.png');

type ServiceKey = 'google' | 'zoom' | 'stripe';

interface ConnectionState {
  status: IntegrationStatus;
  error?: string;
}

export default function AccountScreen() {
  const googleAuth = useGoogleAuth();
  const zoomAuth = useZoomAuth();
  const stripeAuth = useStripeAuth();
  const notifications = useNotifications();
  const { students, lessonLogs, scheduledLessons } = useData();

  // Get display name from connected accounts
  const displayName = googleAuth.user?.name || zoomAuth.user?.name || 'Tutor';
  const displayEmail = googleAuth.user?.email || zoomAuth.user?.email || 'Connect Google to sync';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T';

  // Connection states for each service
  const [connectionStates, setConnectionStates] = useState<Record<ServiceKey, ConnectionState>>({
    google: { status: 'idle' },
    zoom: { status: 'idle' },
    stripe: { status: 'idle' },
  });

  const [showStudentManager, setShowStudentManager] = useState(false);

  // Update status when auth state changes
  useEffect(() => {
    setConnectionStates(prev => ({
      ...prev,
      google: {
        status: googleAuth.isAuthenticated ? 'connected' :
          !googleAuth.isReady ? 'idle' : prev.google.status === 'connecting' ? 'connecting' : 'idle'
      },
    }));
  }, [googleAuth.isAuthenticated, googleAuth.isReady]);

  useEffect(() => {
    setConnectionStates(prev => ({
      ...prev,
      zoom: {
        status: zoomAuth.isAuthenticated ? 'connected' :
          prev.zoom.status === 'connecting' ? 'connecting' : 'idle'
      },
    }));
  }, [zoomAuth.isAuthenticated]);

  useEffect(() => {
    setConnectionStates(prev => ({
      ...prev,
      stripe: {
        status: stripeAuth.isAuthenticated ? 'connected' :
          prev.stripe.status === 'connecting' ? 'connecting' : 'idle'
      },
    }));
  }, [stripeAuth.isAuthenticated]);

  const handleConnect = async (service: ServiceKey, signInFn: () => Promise<void>) => {
    // Update to connecting state
    setConnectionStates(prev => ({
      ...prev,
      [service]: { status: 'connecting' },
    }));

    try {
      await signInFn();

      // Show success animation briefly
      setConnectionStates(prev => ({
        ...prev,
        [service]: { status: 'success' },
      }));

      // Then transition to connected state
      setTimeout(() => {
        setConnectionStates(prev => ({
          ...prev,
          [service]: { status: 'connected' },
        }));
      }, 1500);

      // Request notification permission after Zoom connection
      if (service === 'zoom') {
        notifications.requestPermission();
      }

    } catch (error: any) {
      const errorMessage = error?.message || 'Connection failed.';
      setConnectionStates(prev => ({
        ...prev,
        [service]: { status: 'error', error: errorMessage },
      }));
    }
  };

  const handleDisconnect = async (service: ServiceKey, signOutFn: () => Promise<void>) => {
    try {
      await signOutFn();
      setConnectionStates(prev => ({
        ...prev,
        [service]: { status: 'idle' },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect.');
    }
  };

  // Export all data as JSON
  const handleExportData = async () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        students,
        lessonLogs,
        scheduledLessons,
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      await Share.share({
        message: jsonString,
        title: 'Chalk Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  // Log out - clear all tokens
  const handleLogOut = async () => {
    Alert.alert(
      'Log Out',
      'This will sign out of all connected services and clear local data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out of all services
              if (googleAuth.isAuthenticated) await googleAuth.signOut();
              if (zoomAuth.isAuthenticated) await zoomAuth.signOut();
              if (stripeAuth.isAuthenticated) await stripeAuth.signOut();

              // Clear AsyncStorage
              await AsyncStorage.clear();

              // Reset connection states
              setConnectionStates({
                google: { status: 'idle' },
                zoom: { status: 'idle' },
                stripe: { status: 'idle' },
              });

              Alert.alert('Success', 'Logged out successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out completely.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={layout.container} edges={['top']}>
      <ScrollView contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={typography.h1}>Account</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={typography.h3}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            </View>
          </View>
          {(googleAuth.isAuthenticated || zoomAuth.isAuthenticated || stripeAuth.isAuthenticated) && (
            <View style={styles.badgeRow}>
              <View style={styles.proBadge}>
                <Text style={styles.proText}>VERIFIED</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Integrations Section */}
        <Text style={styles.sectionTitle}>INTEGRATIONS</Text>
        <Text style={styles.sectionSubtitle}>Connect services to verify your portfolio</Text>

        {/* Google Calendar */}
        <IntegrationCard
          name="Google Calendar"
          description="Sync your lesson schedule"
          logo={GoogleCalendarLogo}
          status={connectionStates.google.status}
          connectedInfo={googleAuth.user?.email}
          errorMessage={connectionStates.google.error}
          onConnect={() => handleConnect('google', googleAuth.signIn)}
          onDisconnect={() => handleDisconnect('google', googleAuth.signOut)}
          onRetry={() => handleConnect('google', googleAuth.signIn)}
        />

        {/* Zoom */}
        <IntegrationCard
          name="Zoom"
          description="Import video lesson records"
          logo={ZoomLogo}
          status={connectionStates.zoom.status}
          connectedInfo={zoomAuth.user?.email}
          errorMessage={connectionStates.zoom.error}
          onConnect={() => handleConnect('zoom', zoomAuth.signIn)}
          onDisconnect={() => handleDisconnect('zoom', zoomAuth.signOut)}
          onRetry={() => handleConnect('zoom', zoomAuth.signIn)}
        />

        {/* Stripe */}
        <IntegrationCard
          name="Stripe"
          description="Import your payment history"
          logo={StripeLogo}
          status={connectionStates.stripe.status}
          connectedInfo={stripeAuth.account?.id}
          errorMessage={connectionStates.stripe.error}
          onConnect={() => handleConnect('stripe', stripeAuth.signIn)}
          onDisconnect={() => handleDisconnect('stripe', stripeAuth.signOut)}
          onRetry={() => handleConnect('stripe', stripeAuth.signIn)}
        />

        {/* Students Section */}
        <Text style={styles.sectionTitle}>STUDENTS</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingItem} onTouchEnd={() => setShowStudentManager(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <UsersIcon size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Manage Students</Text>
            </View>
            <ChevronRightIcon size={20} color={colors.text.secondary} />
          </View>
        </Card>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>SETTINGS</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <Text style={styles.settingLabel}>Export Data</Text>
            <ChevronRightIcon size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleLogOut}>
            <Text style={[styles.settingLabel, { color: colors.status.error }]}>Log Out</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.versionText}>Version 1.0.2 (Build 14)</Text>

      </ScrollView>

      {/* Student Manager Modal */}
      <StudentManager
        visible={showStudentManager}
        onClose={() => setShowStudentManager(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  profileCard: {
    marginBottom: spacing['2xl'],
    padding: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.bg.base,
  },
  profileEmail: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  proBadge: {
    backgroundColor: colors.accent.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.accent.default,
  },
  proText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent.default,
    letterSpacing: 1,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  settingsCard: {
    marginBottom: spacing.xl,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 15,
  },
  versionText: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
