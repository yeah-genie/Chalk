import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Colors, { spacing, typography, radius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Avatar } from '@/components/ui/Avatar';
import { Toast, useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ChevronRightIcon,
  CheckCircleIcon,
  XIcon,
  SendIcon,
} from '@/components/Icons';
import { 
  MOCK_LESSONS, 
  MOCK_STUDENTS, 
  generateMonthlySummary,
  getStudentById,
} from '@/data/mockData';
import { LessonRecord, GRADE_NAMES } from '@/data/types';

type TabType = 'lessons' | 'income';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<LessonRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2024-12');

  const tabBarHeight = 64 + Math.max(insets.bottom, 16) + 20;
  
  const sortedLessons = useMemo(() => 
    [...MOCK_LESSONS].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  []);
  
  const monthlySummary = useMemo(() => 
    generateMonthlySummary(selectedMonth),
  [selectedMonth]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toast.toast.visible}
        type={toast.toast.type}
        title={toast.toast.title}
        message={toast.toast.message}
        onDismiss={toast.hideToast}
      />

      {/* Background */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={[
            colorScheme === 'dark' ? 'rgba(0, 212, 170, 0.06)' : 'rgba(0, 212, 170, 0.03)',
            'transparent',
          ]}
          style={styles.glow}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: tabBarHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Text style={[styles.title, { color: colors.text }]}>기록</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            수업 히스토리 & 급여 관리
          </Text>
        </Animated.View>

        {/* Tab Switcher */}
        <Animated.View 
          entering={FadeInDown.delay(150).springify()}
          style={styles.tabContainer}
        >
          <View style={[styles.tabWrapper, { backgroundColor: colors.backgroundTertiary }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'lessons' && { backgroundColor: colors.tint },
              ]}
              onPress={() => setActiveTab('lessons')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'lessons' ? '#fff' : colors.textMuted },
              ]}>
                수업 기록
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'income' && { backgroundColor: colors.tint },
              ]}
              onPress={() => setActiveTab('income')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'income' ? '#fff' : colors.textMuted },
              ]}>
                급여 현황
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Content */}
        {activeTab === 'lessons' ? (
          <View style={styles.section}>
            {sortedLessons.length === 0 ? (
              <EmptyState
                type="lessons"
                title="수업 기록이 없어요"
                description="수업을 기록하면 여기에 표시됩니다"
              />
            ) : (
              sortedLessons.map((lesson, idx) => {
                const student = getStudentById(lesson.studentId);
                return (
                  <Animated.View
                    key={lesson.id}
                    entering={FadeInDown.delay(200 + idx * 30).springify()}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.lessonCard,
                        { 
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.cardBorder,
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        },
                      ]}
                      onPress={() => setSelectedLesson(lesson)}
                    >
                      <View style={styles.lessonHeader}>
                        <Avatar 
                          name={student?.name || '?'} 
                          size="md" 
                          variant="gradient" 
                        />
                        <View style={styles.lessonInfo}>
                          <Text style={[styles.lessonStudent, { color: colors.text }]}>
                            {student?.name}
                          </Text>
                          <Text style={[styles.lessonDate, { color: colors.textMuted }]}>
                            {formatDate(lesson.date)} · {lesson.startTime} - {lesson.endTime}
                          </Text>
                        </View>
                        <ChevronRightIcon size={20} color={colors.textMuted} />
                      </View>

                      {lesson.topic && (
                        <Text style={[styles.lessonTopic, { color: colors.textSecondary }]}>
                          📚 {lesson.topic}
                        </Text>
                      )}

                      <View style={styles.lessonFooter}>
                        <View style={styles.badges}>
                          {lesson.parentMessageSent && (
                            <View style={[styles.badge, { backgroundColor: colors.brandMuted }]}>
                              <CheckCircleIcon size={12} color={colors.tint} />
                              <Text style={[styles.badgeText, { color: colors.tint }]}>전송완료</Text>
                            </View>
                          )}
                          {lesson.isPaid ? (
                            <View style={[styles.badge, { backgroundColor: colors.brandMuted }]}>
                              <Text style={[styles.badgeText, { color: colors.tint }]}>결제완료</Text>
                            </View>
                          ) : (
                            <View style={[styles.badge, { backgroundColor: colors.warningMuted }]}>
                              <Text style={[styles.badgeText, { color: colors.warning }]}>미결제</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.lessonFee, { color: colors.text }]}>
                          {formatCurrency(lesson.totalFee || 0)}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {/* Monthly Summary */}
            <GlowCard variant="neon" glowColor="mint" style={styles.summaryCard}>
              <Text style={[styles.summaryMonth, { color: colors.textMuted }]}>
                {selectedMonth} 현황
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.tint }]}>
                    {monthlySummary.totalLessons}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>수업</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.tint }]}>
                    {monthlySummary.totalHours.toFixed(1)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>시간</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.tint }]}>
                    {(monthlySummary.totalEarnings / 10000).toFixed(0)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>만원</Text>
                </View>
              </View>

              <View style={styles.earningsBreakdown}>
                <View style={styles.earningsRow}>
                  <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>결제 완료</Text>
                  <Text style={[styles.earningsValue, { color: colors.tint }]}>
                    {formatCurrency(monthlySummary.paidEarnings)}
                  </Text>
                </View>
                <View style={styles.earningsRow}>
                  <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>미결제</Text>
                  <Text style={[styles.earningsValue, { color: colors.warning }]}>
                    {formatCurrency(monthlySummary.unpaidEarnings)}
                  </Text>
                </View>
              </View>
            </GlowCard>

            {/* Student Breakdown */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              학생별 내역
            </Text>
            {monthlySummary.studentBreakdown.map((record, idx) => (
              <Animated.View
                key={record.studentId}
                entering={FadeInDown.delay(300 + idx * 50).springify()}
              >
                <GlowCard variant="glass" style={styles.studentIncomeCard}>
                  <View style={styles.studentIncomeHeader}>
                    <Avatar name={record.studentName} size="md" variant="ring" />
                    <View style={styles.studentIncomeInfo}>
                      <Text style={[styles.studentIncomeName, { color: colors.text }]}>
                        {record.studentName}
                      </Text>
                      <Text style={[styles.studentIncomeMeta, { color: colors.textMuted }]}>
                        {record.lessonCount}회 · {record.totalHours.toFixed(1)}시간
                      </Text>
                    </View>
                    <View style={styles.studentIncomeAmount}>
                      <Text style={[styles.studentIncomeTotal, { color: colors.text }]}>
                        {formatCurrency(record.totalAmount)}
                      </Text>
                      {record.unpaidAmount > 0 && (
                        <Text style={[styles.studentIncomeUnpaid, { color: colors.warning }]}>
                          미결제 {formatCurrency(record.unpaidAmount)}
                        </Text>
                      )}
                    </View>
                  </View>
                </GlowCard>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Lesson Detail Modal */}
      <Modal
        visible={!!selectedLesson}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedLesson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElevated }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                수업 상세
              </Text>
              <Pressable onPress={() => setSelectedLesson(null)}>
                <XIcon size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            {selectedLesson && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {(() => {
                  const student = getStudentById(selectedLesson.studentId);
                  return (
                    <>
                      <View style={styles.detailProfile}>
                        <Avatar name={student?.name || '?'} size="xl" variant="gradient" />
                        <Text style={[styles.detailName, { color: colors.text }]}>
                          {student?.name}
                        </Text>
                        <Text style={[styles.detailDate, { color: colors.textMuted }]}>
                          {formatDate(selectedLesson.date)} · {selectedLesson.startTime} - {selectedLesson.endTime}
                        </Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>학습 내용</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {selectedLesson.topic || '-'}
                        </Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>메모</Text>
                        <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                          {selectedLesson.memo || '-'}
                        </Text>
                      </View>

                      {selectedLesson.aiFeedback && (
                        <View style={styles.detailSection}>
                          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>학부모 전송 메시지</Text>
                          <GlowCard variant="neon" glowColor="mint">
                            <Text style={[styles.detailFeedback, { color: colors.textSecondary }]}>
                              {selectedLesson.aiFeedback}
                            </Text>
                          </GlowCard>
                        </View>
                      )}

                      <View style={styles.detailSection}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>금액</Text>
                        <View style={styles.feeRow}>
                          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>
                            {selectedLesson.durationMinutes}분 × {formatCurrency(selectedLesson.hourlyRate || 0)}/시간
                          </Text>
                          <Text style={[styles.feeTotal, { color: colors.tint }]}>
                            {formatCurrency(selectedLesson.totalFee || 0)}
                          </Text>
                        </View>
                      </View>

                      {!selectedLesson.parentMessageSent && (
                        <NeonButton
                          title="학부모에게 전송"
                          variant="gradient"
                          glowColor="mint"
                          icon={<SendIcon size={18} color="#fff" />}
                          onPress={() => {
                            toast.success('전송 완료', '학부모에게 메시지를 보냈어요');
                            setSelectedLesson(null);
                          }}
                          fullWidth
                          style={{ marginTop: spacing.lg }}
                        />
                      )}
                    </>
                  );
                })()}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 300,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -150,
    left: '50%',
    marginLeft: -250,
    width: 500,
    height: 400,
    borderRadius: 250,
  },
  content: { paddingHorizontal: spacing.lg },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  tabContainer: { marginBottom: spacing.xl },
  tabWrapper: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tabText: { ...typography.bodyMedium },
  section: { marginBottom: spacing.xxl },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  lessonCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonInfo: { flex: 1, marginLeft: spacing.md },
  lessonStudent: { ...typography.bodyMedium },
  lessonDate: { ...typography.caption, marginTop: 2 },
  lessonTopic: {
    ...typography.body,
    marginTop: spacing.md,
    marginLeft: 48,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginLeft: 48,
  },
  badges: { flexDirection: 'row', gap: spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: { ...typography.caption },
  lessonFee: { ...typography.bodyMedium, fontWeight: '600' },
  summaryCard: { marginBottom: spacing.md },
  summaryMonth: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  summaryLabel: { ...typography.caption, marginTop: 4 },
  earningsBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,212,170,0.2)',
    paddingTop: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  earningsLabel: { ...typography.body },
  earningsValue: { ...typography.bodyMedium },
  studentIncomeCard: { marginBottom: spacing.md },
  studentIncomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentIncomeInfo: { flex: 1, marginLeft: spacing.md },
  studentIncomeName: { ...typography.bodyMedium },
  studentIncomeMeta: { ...typography.caption, marginTop: 2 },
  studentIncomeAmount: { alignItems: 'flex-end' },
  studentIncomeTotal: { ...typography.bodyMedium, fontWeight: '600' },
  studentIncomeUnpaid: { ...typography.caption, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h2 },
  detailProfile: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  detailName: { ...typography.h2, marginTop: spacing.md },
  detailDate: { ...typography.body, marginTop: spacing.xs },
  detailSection: { marginBottom: spacing.lg },
  detailLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  detailValue: { ...typography.body },
  detailFeedback: { ...typography.bodySmall, lineHeight: 20 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: { ...typography.body },
  feeTotal: { ...typography.h3 },
});

