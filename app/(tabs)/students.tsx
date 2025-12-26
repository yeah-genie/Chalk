import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Colors, { spacing, typography, radius, shadows } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Avatar } from '@/components/ui/Avatar';
import { Toast, useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  PlusIcon,
  ChevronRightIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SearchIcon,
} from '@/components/Icons';
import { MOCK_STUDENTS, getTopicsByGrade, getTopicByCode } from '@/data/mockData';
import { Student, GradeLevel, GRADE_NAMES, GRADE_OPTIONS } from '@/data/types';

export default function StudentsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 2단계 폼
  const [step, setStep] = useState(1);
  const [newStudent, setNewStudent] = useState({
    name: '',
    subject: '수학',
    grade: 'MIDDLE_1' as GradeLevel,
    phone: '',
    targetTopic: '',
  });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveStudent = () => {
    if (!newStudent.name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    const newId = (students.length + 1).toString();
    const student: Student = {
      id: newId,
      name: newStudent.name,
      subject: newStudent.subject,
      grade: newStudent.grade,
      currentTopic: newStudent.targetTopic || undefined,
      lessonsCount: 0,
      phone: newStudent.phone,
    };

    setStudents([...students, student]);
    toast.success('학생 추가 완료', `${newStudent.name} 학생이 등록되었어요`);
    resetModal();
  };

  const resetModal = () => {
    setShowAddModal(false);
    setStep(1);
    setNewStudent({
      name: '',
      subject: '수학',
      grade: 'MIDDLE_1',
      phone: '',
      targetTopic: '',
    });
  };

  const tabBarHeight = 64 + Math.max(insets.bottom, 16) + 20;
  const gradeTopics = getTopicsByGrade(newStudent.grade);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toast */}
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
            colorScheme === 'dark' ? 'rgba(0, 245, 212, 0.06)' : 'rgba(0, 245, 212, 0.04)',
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>학생 관리</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                총 {students.length}명의 학생
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={[styles.statNumber, { color: colors.tint }]}>
                {students.reduce((sum, s) => sum + s.lessonsCount, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>총 수업</Text>
            </View>
          </View>
        </Animated.View>

        {/* Search */}
        {students.length > 0 && (
          <Animated.View 
            entering={FadeInDown.delay(150).springify()}
            style={styles.searchSection}
          >
            <View style={[styles.searchContainer, { backgroundColor: colors.backgroundTertiary }]}>
              <SearchIcon size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="이름으로 검색"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </Animated.View>
        )}

        {/* Student List */}
        {students.length === 0 ? (
          <EmptyState
            type="students"
            title="아직 학생이 없어요"
            description="첫 학생을 등록하고 수업을 시작해보세요"
            actionLabel="학생 추가하기"
            onAction={() => setShowAddModal(true)}
          />
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptySearch}>
            <Text style={[styles.emptySearchText, { color: colors.textMuted }]}>
              "{searchQuery}" 검색 결과가 없습니다
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              내 학생
            </Text>

            {filteredStudents.map((student, idx) => (
              <Animated.View
                key={student.id}
                entering={FadeInDown.delay(200 + idx * 50).springify()}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.studentCard,
                    { 
                      backgroundColor: colors.backgroundTertiary,
                      borderColor: colors.border,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={() => {
                    setSelectedStudent(student);
                    setShowDetailModal(true);
                  }}
                  accessibilityLabel={`${student.name} 학생, ${GRADE_NAMES[student.grade]}, ${student.lessonsCount}회 수업 완료`}
                  accessibilityRole="button"
                >
                  <Avatar 
                    name={student.name} 
                    size="lg"
                    variant="gradient"
                    color="mint"
                  />

                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: colors.text }]}>
                      {student.name}
                    </Text>
                    <Text style={[styles.studentMeta, { color: colors.textMuted }]}>
                      {GRADE_NAMES[student.grade]} · {student.subject}
                    </Text>

                    <View style={styles.badges}>
                      <View style={[styles.lessonBadge, { backgroundColor: colors.tint + '15' }]}>
                        <CheckCircleIcon size={12} color={colors.tint} />
                        <Text style={[styles.badgeText, { color: colors.tint }]}>
                          {student.lessonsCount}회
                        </Text>
                      </View>

                      {student.diagnosis && student.diagnosis.gaps.length > 0 && (
                        <View style={[styles.gapBadge, { backgroundColor: colors.warning + '15' }]}>
                          <AlertCircleIcon size={12} color={colors.warning} />
                          <Text style={[styles.badgeText, { color: colors.warning }]}>
                            결손 {student.diagnosis.gaps.length}개
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <ChevronRightIcon size={20} color={colors.textMuted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        style={[styles.fabContainer, { bottom: tabBarHeight - 20 }]}
      >
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
          accessibilityLabel="새 학생 추가"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <PlusIcon size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Add Student Modal - 2단계로 축소 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElevated }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {step === 1 ? '새 학생 추가' : '학습 목표 설정 (선택)'}
              </Text>
              <TouchableOpacity 
                onPress={resetModal} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="닫기"
              >
                <XIcon size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Step Indicator - 2단계 */}
            <View style={styles.stepIndicator}>
              {[1, 2].map(s => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    { 
                      backgroundColor: s <= step ? colors.tint : colors.border,
                      width: s === step ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Step 1: 기본 정보 + 학년 */}
              {step === 1 && (
                <Animated.View entering={FadeInDown.springify()}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>이름 *</Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: colors.backgroundTertiary, 
                        color: colors.text,
                        borderColor: newStudent.name ? colors.tint : colors.border,
                      }]}
                      placeholder="학생 이름"
                      placeholderTextColor={colors.textMuted}
                      value={newStudent.name}
                      onChangeText={text => setNewStudent(prev => ({ ...prev, name: text }))}
                      accessibilityLabel="학생 이름"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>학년 *</Text>
                    <View style={styles.gradeGrid}>
                      {GRADE_OPTIONS.map(grade => (
                        <Pressable
                          key={grade}
                          style={[
                            styles.gradeChip,
                            {
                              backgroundColor: newStudent.grade === grade
                                ? colors.tint
                                : colors.backgroundTertiary,
                              borderColor: newStudent.grade === grade
                                ? colors.tint
                                : colors.border,
                            },
                          ]}
                          onPress={() => setNewStudent(prev => ({ ...prev, grade, targetTopic: '' }))}
                          accessibilityLabel={GRADE_NAMES[grade]}
                          accessibilityState={{ selected: newStudent.grade === grade }}
                        >
                          <Text
                            style={[
                              styles.gradeChipText,
                              { color: newStudent.grade === grade ? '#fff' : colors.text },
                            ]}
                          >
                            {GRADE_NAMES[grade]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>학부모 연락처</Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: colors.backgroundTertiary, 
                        color: colors.text,
                        borderColor: colors.border,
                      }]}
                      placeholder="010-1234-5678"
                      placeholderTextColor={colors.textMuted}
                      value={newStudent.phone}
                      onChangeText={text => setNewStudent(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                      accessibilityLabel="학부모 연락처"
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <NeonButton
                      title="바로 등록"
                      variant="outline"
                      glowColor="mint"
                      onPress={handleSaveStudent}
                      disabled={!newStudent.name.trim()}
                      style={{ flex: 1 }}
                    />
                    <NeonButton
                      title="목표 설정"
                      variant="gradient"
                      glowColor="mint"
                      icon={<ChevronRightIcon size={18} color="#fff" />}
                      iconPosition="right"
                      onPress={() => setStep(2)}
                      disabled={!newStudent.name.trim()}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Animated.View>
              )}

              {/* Step 2: 목표 단원 설정 (선택) */}
              {step === 2 && (
                <Animated.View entering={FadeInDown.springify()}>
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {GRADE_NAMES[newStudent.grade]} 과정에서 학습할 단원을 선택하세요.
                    {'\n'}나중에 설정할 수도 있어요.
                  </Text>

                  <View style={styles.topicList}>
                    <Pressable
                      style={[
                        styles.topicCard,
                        {
                          backgroundColor: !newStudent.targetTopic
                            ? colors.tint + '15'
                            : colors.backgroundTertiary,
                          borderColor: !newStudent.targetTopic
                            ? colors.tint
                            : colors.border,
                        },
                      ]}
                      onPress={() => setNewStudent(prev => ({ ...prev, targetTopic: '' }))}
                    >
                      <Text style={[styles.topicName, { color: colors.text }]}>
                        나중에 설정할게요
                      </Text>
                    </Pressable>

                    {gradeTopics.map(topic => (
                      <Pressable
                        key={topic.code}
                        style={[
                          styles.topicCard,
                          {
                            backgroundColor: newStudent.targetTopic === topic.code
                              ? colors.tint + '15'
                              : colors.backgroundTertiary,
                            borderColor: newStudent.targetTopic === topic.code
                              ? colors.tint
                              : colors.border,
                          },
                        ]}
                        onPress={() => setNewStudent(prev => ({ ...prev, targetTopic: topic.code }))}
                        accessibilityLabel={`${topic.name}, 약 ${topic.estimatedHours}시간`}
                        accessibilityState={{ selected: newStudent.targetTopic === topic.code }}
                      >
                        <View style={styles.topicHeader}>
                          <Text style={[styles.topicName, { color: colors.text }]}>
                            {topic.name}
                          </Text>
                          {newStudent.targetTopic === topic.code && (
                            <CheckCircleIcon size={18} color={colors.tint} />
                          )}
                        </View>
                        <Text style={[styles.topicMeta, { color: colors.textMuted }]}>
                          약 {topic.estimatedHours}시간 · {'★'.repeat(topic.difficulty)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <NeonButton
                    title="학생 등록 완료"
                    variant="gradient"
                    glowColor="mint"
                    icon={<CheckCircleIcon size={18} color="#fff" />}
                    onPress={handleSaveStudent}
                    fullWidth
                    style={{ marginTop: spacing.lg }}
                  />
                </Animated.View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElevated }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedStudent?.name} 학생
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <XIcon size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailProfile}>
                  <Avatar name={selectedStudent.name} size="xl" variant="gradient" />
                  <Text style={[styles.detailName, { color: colors.text }]}>
                    {selectedStudent.name}
                  </Text>
                  <Text style={[styles.detailMeta, { color: colors.textMuted }]}>
                    {GRADE_NAMES[selectedStudent.grade]} · {selectedStudent.subject}
                  </Text>
                  {selectedStudent.phone && (
                    <Text style={[styles.detailPhone, { color: colors.textSecondary }]}>
                      📞 {selectedStudent.phone}
                    </Text>
                  )}
                </View>

                <View style={styles.detailStatsRow}>
                  <GlowCard variant="glass" style={styles.detailStatCard} contentStyle={styles.detailStatContent}>
                    <Text style={[styles.detailStatValue, { color: colors.tint }]}>
                      {selectedStudent.lessonsCount}
                    </Text>
                    <Text style={[styles.detailStatLabel, { color: colors.textMuted }]}>
                      완료 수업
                    </Text>
                  </GlowCard>
                  <GlowCard variant="glass" style={styles.detailStatCard} contentStyle={styles.detailStatContent}>
                    <Text style={[styles.detailStatValue, { color: colors.tintSecondary }]}>
                      {selectedStudent.diagnosis?.estimatedWeeks || '-'}주
                    </Text>
                    <Text style={[styles.detailStatLabel, { color: colors.textMuted }]}>
                      예상 기간
                    </Text>
                  </GlowCard>
                </View>

                {selectedStudent.currentTopic && (
                  <View style={styles.currentTopicSection}>
                    <Text style={[styles.sectionLabelSmall, { color: colors.textMuted }]}>
                      현재 학습 단원
                    </Text>
                    <GlowCard variant="neon" glowColor="mint">
                      <Text style={[styles.currentTopicName, { color: colors.text }]}>
                        {getTopicByCode(selectedStudent.currentTopic)?.name || selectedStudent.currentTopic}
                      </Text>
                    </GlowCard>
                  </View>
                )}

                {selectedStudent.diagnosis && selectedStudent.diagnosis.gaps.length > 0 && (
                  <View style={styles.gapsSection}>
                    <Text style={[styles.sectionLabelSmall, { color: colors.textMuted }]}>
                      진단된 결손
                    </Text>
                    {selectedStudent.diagnosis.gaps.map(gap => (
                      <View
                        key={gap.topicCode}
                        style={[styles.gapItem, { backgroundColor: colors.backgroundTertiary }]}
                      >
                        <View style={[styles.severityDot, {
                          backgroundColor: gap.severity === 'CRITICAL' ? colors.error : colors.warning,
                        }]} />
                        <View style={styles.gapInfo}>
                          <Text style={[styles.gapName, { color: colors.text }]}>
                            {gap.topicName}
                          </Text>
                          <Text style={[styles.gapMeta, { color: colors.textMuted }]}>
                            {GRADE_NAMES[gap.grade]} · {gap.estimatedHours}시간
                          </Text>
                        </View>
                        <Text style={[styles.gapSeverity, {
                          color: gap.severity === 'CRITICAL' ? colors.error : colors.warning,
                        }]}>
                          {gap.severity === 'CRITICAL' ? '필수' : '권장'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
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
  content: {
    paddingHorizontal: spacing.lg,
  },
  header: { marginBottom: spacing.xl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  statBadge: {
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  section: { marginBottom: spacing.xxl },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  sectionLabelSmall: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  studentInfo: { flex: 1, marginLeft: spacing.lg },
  studentName: { ...typography.h3 },
  studentMeta: { ...typography.bodySmall, marginTop: 2 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  lessonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  gapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: { ...typography.caption },
  emptySearch: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptySearchText: {
    ...typography.body,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
  },
  fab: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h2 },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  stepDot: {
    height: 8,
    borderRadius: radius.full,
  },
  stepDescription: {
    ...typography.body,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { ...typography.label, marginBottom: spacing.sm },
  input: {
    padding: spacing.lg,
    borderRadius: radius.md,
    fontSize: 16,
    borderWidth: 1.5,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gradeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  gradeChipText: { ...typography.bodySmall, fontWeight: '600' },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  topicList: { gap: spacing.sm },
  topicCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicName: { ...typography.bodyMedium },
  topicMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  detailProfile: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  detailName: {
    ...typography.h2,
    marginTop: spacing.md,
  },
  detailMeta: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  detailPhone: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
  detailStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  detailStatCard: {
    flex: 1,
  },
  detailStatContent: {
    alignItems: 'center',
  },
  detailStatValue: {
    ...typography.h1,
  },
  detailStatLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  currentTopicSection: {
    marginBottom: spacing.xl,
  },
  currentTopicName: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  gapsSection: { marginBottom: spacing.lg },
  gapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  gapInfo: { flex: 1, marginLeft: spacing.md },
  gapName: { ...typography.body },
  gapMeta: { ...typography.caption, marginTop: 2 },
  gapSeverity: {
    ...typography.caption,
    fontWeight: '700',
  },
});
