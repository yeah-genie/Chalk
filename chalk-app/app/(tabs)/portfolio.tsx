import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '@/constants/Colors';
import { layout } from '@/components/ui/Theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useData } from '@/lib/DataContext';
import { useGoogleAuth } from '@/lib/useGoogleAuth';
import { useZoomAuth } from '@/lib/useZoomAuth';
import { useStripeAuth } from '@/lib/useStripeAuth';
import {
  ChartIcon, ClockIcon, UsersIcon, VerifiedBadge, CheckCircleIcon,
  ShareIcon, FireIcon, CrownIcon, TrendingUpIcon, DiamondIcon
} from '@/components/Icons';
import { StudentGrowthChart } from '@/components/ui/StudentGrowthChart';
import { ParentReportCard } from '@/components/ui/ParentReportCard';
import { AnnualReport } from '@/components/ui/AnnualReport';

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_lesson', name: 'First Lesson', desc: 'You logged your first lesson', icon: FireIcon, requirement: 1 },
  { id: 'ten_lessons', name: '10 Lessons', desc: 'Completed 10 lessons', icon: TrendingUpIcon, requirement: 10 },
  { id: 'fifty_lessons', name: '50 Lessons', desc: 'Completed 50 lessons', icon: CrownIcon, requirement: 50 },
  { id: 'hundred_lessons', name: '100 Lessons', desc: '100 lessons! Amazing!', icon: DiamondIcon, requirement: 100 },
];

export default function PortfolioScreen() {
  const { lessonLogs, students, getLogsForStudent } = useData();
  const googleAuth = useGoogleAuth();
  const zoomAuth = useZoomAuth();
  const stripeAuth = useStripeAuth();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Statistics
  const totalSessions = lessonLogs.length;
  const totalDuration = lessonLogs.reduce((sum, log) => sum + (log.duration || 60), 0) / 60;
  const totalStudents = students.length;

  // Weekly activity data (real data)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = lessonLogs.filter(log => log.date === dateStr).length;
      days.push({
        label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        count,
        isToday: i === 0,
      });
    }
    return days;
  }, [lessonLogs]);

  // Achievements earned
  const earnedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => totalSessions >= a.requirement);
  }, [totalSessions]);

  // Share portfolio
  const handleShare = async () => {
    const verifications = [];
    if (googleAuth.isAuthenticated) verifications.push('✓ Google Calendar Verified');
    if (zoomAuth.isAuthenticated) verifications.push('✓ Zoom Verified');
    if (stripeAuth.isAuthenticated) verifications.push('✓ Stripe Payment Verified');

    const content = `
📚 Chalk Tutor Portfolio

👤 Tutor Portfolio
📊 ${totalSessions} Lessons Completed
⏱️ ${totalDuration.toFixed(1)} Hours of Teaching
👨‍🎓 ${totalStudents} Students

${verifications.length > 0 ? '\n🔐 Verifications\n' + verifications.join('\n') : ''}

${earnedAchievements.length > 0 ? '\n🏆 Achievements\n' + earnedAchievements.map(a => `• ${a.name}`).join('\n') : ''}

---
Chalk - Portfolio App for Tutors
    `.trim();

    try {
      await Share.share({
        message: content,
        title: 'Chalk Portfolio',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share.');
    }
  };

  return (
    <SafeAreaView style={layout.container} edges={['top']}>
      <ScrollView contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={typography.h1}>Portfolio</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <ShareIcon size={20} color={colors.accent.default} />
          </TouchableOpacity>
        </View>

        {/* Verification Badges */}
        <View style={styles.badgesRow}>
          {googleAuth.isAuthenticated && (
            <View style={styles.badge}>
              <VerifiedBadge size={14} color={colors.accent.default} />
              <Text style={styles.badgeText}>Google</Text>
            </View>
          )}
          {zoomAuth.isAuthenticated && (
            <View style={styles.badge}>
              <VerifiedBadge size={14} color="#2D8CFF" />
              <Text style={styles.badgeText}>Zoom</Text>
            </View>
          )}
          {stripeAuth.isAuthenticated && (
            <View style={styles.badge}>
              <VerifiedBadge size={14} color="#635BFF" />
              <Text style={styles.badgeText}>Stripe</Text>
            </View>
          )}
        </View>

        {/* Hero Stats */}
        <View style={styles.heroGrid}>
          <Card variant="glow" style={styles.heroCard}>
            <View style={styles.iconCircle}>
              <ChartIcon size={24} color={colors.accent.default} />
            </View>
            <Text style={styles.heroValue}>{totalSessions}</Text>
            <Text style={styles.heroLabel}>Total Lessons</Text>
          </Card>
          <Card style={styles.heroCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F59E0B20' }]}>
              <ClockIcon size={24} color={colors.status.warning} />
            </View>
            <Text style={styles.heroValue}>{totalDuration.toFixed(1)}h</Text>
            <Text style={styles.heroLabel}>Hours</Text>
          </Card>
        </View>

        {/* Weekly Activity (Real Data) */}
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <Card style={styles.chartCard}>
          <View style={styles.chartBars}>
            {weeklyData.map((day, i) => (
              <View key={i} style={styles.barContainer}>
                <Text style={styles.barCount}>{day.count > 0 ? day.count : ''}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(day.count * 20, 8),
                      backgroundColor: day.isToday ? colors.accent.default :
                        day.count > 0 ? colors.bg.tertiary : colors.border.light,
                    }
                  ]}
                />
                <Text style={[styles.barLabel, day.isToday && { color: colors.accent.default }]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map(achievement => {
            const isEarned = totalSessions >= achievement.requirement;
            const Icon = achievement.icon;
            return (
              <View
                key={achievement.id}
                style={[styles.achievementCard, !isEarned && styles.achievementLocked]}
              >
                <View style={[styles.achievementIcon, isEarned && { backgroundColor: colors.accent.default + '20' }]}>
                  <Icon size={24} color={isEarned ? colors.accent.default : colors.text.muted} />
                </View>
                <Text style={[styles.achievementName, !isEarned && { color: colors.text.muted }]}>
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDesc}>
                  {isEarned ? achievement.desc : `${achievement.requirement} needed`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Students Section */}
        <Text style={styles.sectionTitle}>Students</Text>
        <Card style={styles.studentsCard}>
          <View style={styles.studentStatRow}>
            <View style={layout.row}>
              <UsersIcon size={20} color={colors.text.secondary} />
              <Text style={styles.studentStatLabel}>Total Students</Text>
            </View>
            <Text style={typography.h3}>{totalStudents}</Text>
          </View>
          {students.map((s, index) => {
            const studentLogs = getLogsForStudent(s.id);
            const isLast = index === students.length - 1;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.studentRow, isLast && { borderBottomWidth: 0 }]}
                onPress={() => setSelectedStudentId(selectedStudentId === s.id ? null : s.id)}
              >
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentInitials}>{s.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{s.name}</Text>
                  <Text style={styles.studentStats}>{studentLogs.length} lessons</Text>
                </View>
                <Text style={styles.studentSubject}>{s.subject || 'General'}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Selected Student Growth Chart & Report */}
        {selectedStudentId && (
          <View style={styles.studentDetails}>
            <StudentGrowthChart
              studentName={students.find(s => s.id === selectedStudentId)?.name || ''}
              data={getLogsForStudent(selectedStudentId).map(log => ({
                date: log.date,
                rating: log.rating,
              }))}
            />
            <View style={{ height: spacing.md }} />
            <ParentReportCard
              studentId={selectedStudentId}
              studentName={students.find(s => s.id === selectedStudentId)?.name || ''}
              logs={getLogsForStudent(selectedStudentId).slice(0, 5).map(log => ({
                topic: log.topic,
                rating: log.rating,
                date: log.date,
                notes: log.notes,
              }))}
            />
          </View>
        )}

        {/* Annual Income Report */}
        <Text style={styles.sectionTitle}>ANNUAL REPORT</Text>
        <AnnualReport />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shareBtn: {
    padding: 10,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  heroGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  heroCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.default + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroValue: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 32,
  },
  heroLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderRadius: radius.sm,
    minHeight: 4,
  },
  barLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 8,
  },
  barCount: {
    fontSize: 10,
    color: colors.accent.default,
    fontWeight: '600',
  },
  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  achievementName: {
    ...typography.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
  achievementDesc: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  // Students
  studentsCard: {
    marginBottom: spacing.xl,
  },
  studentStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  studentStatLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  studentInitials: {
    color: colors.bg.base,
    fontWeight: '700',
    fontSize: 14,
  },
  studentName: {
    ...typography.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
  studentStats: {
    ...typography.caption,
    color: colors.text.muted,
  },
  studentSubject: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  studentDetails: {
    marginBottom: spacing.xl,
  },
});
