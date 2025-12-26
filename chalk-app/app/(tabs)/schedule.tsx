import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors, typography, spacing, radius } from '@/constants/Colors';
import { layout } from '@/components/ui/Theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useData } from '@/lib/DataContext';
import { CalendarIcon, ClockIcon, VideoIcon, CheckCircleIcon, UsersIcon } from '@/components/Icons';

// Mock Upcoming Lessons
const UPCOMING_LESSONS = [
  { id: '1', studentId: 'mock1', studentName: 'Alice', time: '14:00', subject: 'Math (Calculus)', link: 'https://zoom.us/j/123456789', homeworkDue: 'pg. 42 #1-10' },
  { id: '2', studentId: 'mock2', studentName: 'Brian', time: '16:30', subject: 'Physics', link: 'https://meet.google.com/abc-defg-hij', homeworkDue: 'Read Chapter 4' },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const { lessonLogs, startSession, activeSession } = useData();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const handleStartClass = (lesson: typeof UPCOMING_LESSONS[0]) => {
    if (activeSession) {
        Alert.alert('Session Active', 'You already have an active class. Please finish it first.');
        return;
    }

    Alert.alert(
      'Start Class?',
      `Launch Zoom for ${lesson.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            startSession(lesson.studentId, lesson.studentName);
            // Linking.openURL(lesson.link).catch(err => console.error("Couldn't load page", err));
            router.push('/(tabs)/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={layout.container} edges={['top']}>
      <View style={layout.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.h1}>Schedule</Text>
          <TouchableOpacity style={styles.calendarBtn} onPress={() => Alert.alert('Sync', 'Connect Google Calendar coming soon!')}>
            <CalendarIcon size={20} color={colors.accent.default} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* UPCOMING VIEW */}
          {activeTab === 'upcoming' && (
            <View style={styles.list}>
              {/* Integration Banner */}
              <Card variant="glass" style={styles.banner}>
                <View style={layout.row}>
                  <CalendarIcon size={20} color={colors.text.secondary} />
                  <Text style={styles.bannerText}>Sync with Google Calendar</Text>
                </View>
                <Button
                  title="Connect"
                  size="sm"
                  variant="outline"
                  onPress={() => Alert.alert('Coming Soon', 'Calendar integration is in Phase 2 roadmap.')}
                />
              </Card>

              <Text style={styles.sectionTitle}>TODAY</Text>
              {UPCOMING_LESSONS.map((lesson) => (
                <Card key={lesson.id} style={styles.lessonCard}>
                  <View style={styles.lessonRow}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{lesson.time}</Text>
                      <View style={styles.verticalLine} />
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.studentName}>{lesson.studentName}</Text>
                      <Text style={styles.subject}>{lesson.subject}</Text>
                      {/* Homework Due Display */}
                      {lesson.homeworkDue && (
                          <View style={styles.homeworkBadge}>
                              <CheckCircleIcon size={12} color={colors.status.warning} />
                              <Text style={styles.homeworkText}>Due: {lesson.homeworkDue}</Text>
                          </View>
                      )}
                    </View>
                  </View>
                  <Button
                    title="Start Class"
                    size="sm"
                    icon={<VideoIcon size={16} color={colors.bg.base} />}
                    onPress={() => handleStartClass(lesson)}
                    style={{ marginTop: 12 }}
                  />
                </Card>
              ))}
            </View>
          )}

          {/* HISTORY VIEW */}
          {activeTab === 'history' && (
            <View style={styles.list}>
              {lessonLogs.length === 0 ? (
                <View style={styles.emptyState}>
                  <ClockIcon size={48} color={colors.bg.tertiary} />
                  <Text style={styles.emptyText}>No lessons logged yet.</Text>
                </View>
              ) : (
                [...lessonLogs].reverse().map((log) => (
                  <Card key={log.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                        <View style={layout.row}>
                            <UsersIcon size={14} color={colors.accent.default} />
                            <Text style={styles.historyName}>{log.studentName}</Text>
                        </View>
                        <Text style={styles.historyDate}>{log.date}</Text>
                    </View>
                    <Text style={styles.historyTopic}>{log.topic}</Text>

                    {/* Tags */}
                    <View style={styles.tagRow}>
                        <View style={[styles.ratingTag, { borderColor: getRatingColor(log.rating) }]}>
                            <Text style={[styles.tagText, { color: getRatingColor(log.rating) }]}>
                                {log.rating?.toUpperCase()}
                            </Text>
                        </View>
                        {log.homeworkAssigned && (
                            <View style={styles.homeworkTag}>
                                <Text style={styles.homeworkTagText}>HW: {log.homeworkAssigned}</Text>
                            </View>
                        )}
                    </View>
                  </Card>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function getRatingColor(rating: string | undefined) {
    if (rating === 'good') return colors.status.success;
    if (rating === 'okay') return colors.status.warning;
    if (rating === 'struggled') return colors.status.error;
    return colors.text.muted;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  calendarBtn: {
    padding: 8,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    padding: 4,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.bg.elevated,
  },
  tabText: {
    ...typography.small,
    color: colors.text.muted,
  },
  tabTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  list: {
    gap: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bannerText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  lessonCard: {
    padding: 16,
  },
  lessonRow: {
    flexDirection: 'row',
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text.primary,
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.bg.tertiary,
    marginTop: 4,
    borderRadius: 1,
  },
  lessonInfo: {
    flex: 1,
    paddingBottom: 8,
  },
  studentName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subject: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  homeworkBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 4,
  },
  homeworkText: {
      ...typography.caption,
      color: colors.status.warning,
  },

  // History
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
  },
  historyCard: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyName: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: 6,
  },
  historyDate: {
    ...typography.caption,
    color: colors.text.muted,
  },
  historyTopic: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  homeworkTag: {
    backgroundColor: colors.bg.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  homeworkTagText: {
    fontSize: 10,
    color: colors.text.secondary,
  },
});
