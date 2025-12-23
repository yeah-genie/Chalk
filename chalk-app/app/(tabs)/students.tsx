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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors, { spacing, typography } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  PlusIcon,
  ChevronRightIcon,
  XIcon,
  CheckCircleIcon,
  SparklesIcon,
  AlertCircleIcon,
} from '@/components/Icons';
import {
  MATH_TOPICS,
  getTopicsByGrade,
  diagnoseGaps,
  getAllPrerequisites,
  getStrugglesForTopic,
} from '@/services/curriculum/data';
import { GRADE_NAMES, GradeLevel, Topic } from '@/services/curriculum/types';

// Student type
interface Student {
  id: string;
  name: string;
  subject: string;
  grade: GradeLevel;
  currentTopic?: string;
  lessonsCount: number;
  initial: string;
  diagnosis?: {
    gaps: { topic: Topic; severity: 'CRITICAL' | 'MODERATE' | 'MINOR' }[];
    estimatedWeeks: number;
  };
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: '김민수',
    subject: '수학',
    grade: 'MIDDLE_2',
    currentTopic: 'LINEAR-FUNC',
    lessonsCount: 12,
    initial: 'M',
    diagnosis: {
      gaps: [
        { topic: MATH_TOPICS.find(t => t.code === 'COORDINATES')!, severity: 'CRITICAL' },
        { topic: MATH_TOPICS.find(t => t.code === 'LINEAR-EQ-1')!, severity: 'MODERATE' },
      ],
      estimatedWeeks: 6,
    },
  },
  {
    id: '2',
    name: '이서연',
    subject: '영어',
    grade: 'HIGH_1',
    lessonsCount: 8,
    initial: 'S',
  },
  {
    id: '3',
    name: '박지훈',
    subject: '수학',
    grade: 'MIDDLE_1',
    currentTopic: 'LINEAR-EQ-1',
    lessonsCount: 5,
    initial: 'J',
  },
];

// Grade options for picker
const GRADE_OPTIONS: GradeLevel[] = [
  'ELEMENTARY_5', 'ELEMENTARY_6',
  'MIDDLE_1', 'MIDDLE_2', 'MIDDLE_3',
  'HIGH_1', 'HIGH_2', 'HIGH_3',
];

export default function StudentsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // New student form
  const [step, setStep] = useState(1);
  const [newStudent, setNewStudent] = useState({
    name: '',
    subject: '수학',
    grade: 'MIDDLE_1' as GradeLevel,
    phone: '',
    targetTopic: '',
    currentLevel: 'LOW' as 'HIGH' | 'MID' | 'LOW',
  });

  // Diagnosis state
  const [diagnosisResult, setDiagnosisResult] = useState<{
    gaps: { topic: Topic; severity: 'CRITICAL' | 'MODERATE' | 'MINOR' }[];
    struggles: string[];
    estimatedWeeks: number;
  } | null>(null);

  const handleStartDiagnosis = () => {
    if (!newStudent.targetTopic) return;

    // Run diagnosis
    const gaps = diagnoseGaps(newStudent.targetTopic, []);
    const targetTopic = MATH_TOPICS.find(t => t.code === newStudent.targetTopic);
    const struggles = getStrugglesForTopic(newStudent.targetTopic);

    const totalHours = gaps.reduce((sum, g) => sum + g.topic.estimatedHours, 0) +
      (targetTopic?.estimatedHours || 0);

    setDiagnosisResult({
      gaps,
      struggles: struggles.map(s => s.description),
      estimatedWeeks: Math.ceil(totalHours / 4), // 주 4시간 기준
    });

    setStep(3);
  };

  const handleSaveStudent = () => {
    const newId = (students.length + 1).toString();
    const student: Student = {
      id: newId,
      name: newStudent.name,
      subject: newStudent.subject,
      grade: newStudent.grade,
      currentTopic: newStudent.targetTopic,
      lessonsCount: 0,
      initial: newStudent.name.charAt(0),
      diagnosis: diagnosisResult ? {
        gaps: diagnosisResult.gaps,
        estimatedWeeks: diagnosisResult.estimatedWeeks,
      } : undefined,
    };

    setStudents([...students, student]);
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
      currentLevel: 'LOW',
    });
    setDiagnosisResult(null);
  };

  const gradeTopics = getTopicsByGrade(newStudent.grade);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glow */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.12)', 'transparent']}
          style={styles.glow}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>학생 관리</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            총 {students.length}명의 학생
          </Text>
        </View>

        {/* Student List */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            내 학생
          </Text>

          {students.map(student => (
            <TouchableOpacity
              key={student.id}
              style={[styles.studentCard, { backgroundColor: colors.backgroundTertiary }]}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedStudent(student);
                setShowDiagnosisModal(true);
              }}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{student.initial}</Text>
              </LinearGradient>

              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.text }]}>
                  {student.name}
                </Text>
                <Text style={[styles.studentMeta, { color: colors.textMuted }]}>
                  {GRADE_NAMES[student.grade]} · {student.subject}
                </Text>

                <View style={styles.badges}>
                  <View style={styles.lessonBadge}>
                    <CheckCircleIcon size={12} color={colors.tint} />
                    <Text style={[styles.badgeText, { color: colors.tint }]}>
                      {student.lessonsCount}회
                    </Text>
                  </View>

                  {student.diagnosis && student.diagnosis.gaps.length > 0 && (
                    <View style={[styles.gapBadge, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                      <AlertCircleIcon size={12} color="#FBBF24" />
                      <Text style={[styles.badgeText, { color: '#FBBF24' }]}>
                        결손 {student.diagnosis.gaps.length}개
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <ChevronRightIcon size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <PlusIcon size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Student Modal with Diagnosis */}
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
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {step === 1 && '새 학생 추가'}
                {step === 2 && '학습 목표 설정'}
                {step === 3 && '📊 AI 진단 결과'}
              </Text>
              <TouchableOpacity onPress={resetModal}>
                <XIcon size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {[1, 2, 3].map(s => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    { backgroundColor: s <= step ? colors.tint : colors.border },
                  ]}
                />
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>이름</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
                      placeholder="학생 이름"
                      placeholderTextColor={colors.textMuted}
                      value={newStudent.name}
                      onChangeText={text => setNewStudent(prev => ({ ...prev, name: text }))}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>학년</Text>
                    <View style={styles.gradeGrid}>
                      {GRADE_OPTIONS.map(grade => (
                        <TouchableOpacity
                          key={grade}
                          style={[
                            styles.gradeChip,
                            {
                              backgroundColor: newStudent.grade === grade
                                ? colors.tint
                                : colors.backgroundTertiary,
                            },
                          ]}
                          onPress={() => setNewStudent(prev => ({ ...prev, grade }))}
                        >
                          <Text
                            style={[
                              styles.gradeChipText,
                              { color: newStudent.grade === grade ? '#fff' : colors.text },
                            ]}
                          >
                            {GRADE_NAMES[grade]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>학부모 연락처</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
                      placeholder="010-1234-5678"
                      placeholderTextColor={colors.textMuted}
                      value={newStudent.phone}
                      onChangeText={text => setNewStudent(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.nextButton, { opacity: newStudent.name ? 1 : 0.5 }]}
                    onPress={() => setStep(2)}
                    disabled={!newStudent.name}
                  >
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>다음: 학습 목표 설정</Text>
                      <ChevronRightIcon size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2: Target Topic Selection */}
              {step === 2 && (
                <>
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {GRADE_NAMES[newStudent.grade]} 과정에서 목표 단원을 선택하세요.
                    {'\n'}AI가 필요한 선수학습을 자동으로 진단합니다.
                  </Text>

                  <View style={styles.topicList}>
                    {gradeTopics.map(topic => (
                      <TouchableOpacity
                        key={topic.code}
                        style={[
                          styles.topicCard,
                          {
                            backgroundColor: newStudent.targetTopic === topic.code
                              ? 'rgba(16, 185, 129, 0.15)'
                              : colors.backgroundTertiary,
                            borderColor: newStudent.targetTopic === topic.code
                              ? colors.tint
                              : 'transparent',
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() => setNewStudent(prev => ({ ...prev, targetTopic: topic.code }))}
                      >
                        <Text style={[styles.topicName, { color: colors.text }]}>
                          {topic.name}
                        </Text>
                        <View style={styles.topicMeta}>
                          <Text style={[styles.topicHours, { color: colors.textMuted }]}>
                            약 {topic.estimatedHours}시간
                          </Text>
                          <View style={[styles.difficultyBadge, {
                            backgroundColor: topic.difficulty >= 4
                              ? 'rgba(239, 68, 68, 0.15)'
                              : topic.difficulty >= 3
                                ? 'rgba(251, 191, 36, 0.15)'
                                : 'rgba(34, 197, 94, 0.15)',
                          }]}>
                            <Text style={{
                              fontSize: 11,
                              color: topic.difficulty >= 4
                                ? '#EF4444'
                                : topic.difficulty >= 3
                                  ? '#FBBF24'
                                  : '#22C55E',
                            }}>
                              {'★'.repeat(topic.difficulty)}
                            </Text>
                          </View>
                        </View>
                        {topic.prerequisites.length > 0 && (
                          <Text style={[styles.prereqText, { color: colors.textMuted }]}>
                            선수: {topic.prerequisites.length}개 단원
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.diagnoseButton, { opacity: newStudent.targetTopic ? 1 : 0.5 }]}
                    onPress={handleStartDiagnosis}
                    disabled={!newStudent.targetTopic}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#6366F1']}
                      style={styles.diagnoseButtonGradient}
                    >
                      <SparklesIcon size={18} color="#fff" />
                      <Text style={styles.diagnoseButtonText}>AI 진단 시작</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 3: Diagnosis Result */}
              {step === 3 && diagnosisResult && (
                <>
                  <View style={[styles.resultCard, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                    <Text style={[styles.resultTitle, { color: colors.tint }]}>
                      📋 {newStudent.name} 학생 진단 완료
                    </Text>

                    <View style={styles.resultStats}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {diagnosisResult.gaps.length}개
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                          보충 필요
                        </Text>
                      </View>
                      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          약 {diagnosisResult.estimatedWeeks}주
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                          예상 기간
                        </Text>
                      </View>
                    </View>
                  </View>

                  {diagnosisResult.gaps.length > 0 && (
                    <View style={styles.gapsSection}>
                      <Text style={[styles.gapsSectionTitle, { color: colors.text }]}>
                        🔍 발견된 결손 단원
                      </Text>

                      {diagnosisResult.gaps.map((gap, idx) => (
                        <View
                          key={gap.topic.code}
                          style={[styles.gapItem, { backgroundColor: colors.backgroundTertiary }]}
                        >
                          <View style={[
                            styles.severityDot,
                            {
                              backgroundColor: gap.severity === 'CRITICAL'
                                ? '#EF4444'
                                : gap.severity === 'MODERATE'
                                  ? '#FBBF24'
                                  : '#22C55E',
                            },
                          ]} />
                          <View style={styles.gapInfo}>
                            <Text style={[styles.gapName, { color: colors.text }]}>
                              {gap.topic.name}
                            </Text>
                            <Text style={[styles.gapMeta, { color: colors.textMuted }]}>
                              {GRADE_NAMES[gap.topic.grade]} · {gap.topic.estimatedHours}시간
                            </Text>
                          </View>
                          <Text style={[styles.gapSeverity, {
                            color: gap.severity === 'CRITICAL'
                              ? '#EF4444'
                              : gap.severity === 'MODERATE'
                                ? '#FBBF24'
                                : '#22C55E',
                          }]}>
                            {gap.severity === 'CRITICAL' ? '필수' : gap.severity === 'MODERATE' ? '권장' : '참고'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {diagnosisResult.struggles.length > 0 && (
                    <View style={styles.tipsSection}>
                      <Text style={[styles.tipsSectionTitle, { color: colors.text }]}>
                        ⚠️ 자주 발생하는 어려움
                      </Text>
                      {diagnosisResult.struggles.slice(0, 2).map((struggle, idx) => (
                        <Text
                          key={idx}
                          style={[styles.tipText, { color: colors.textSecondary }]}
                        >
                          • {struggle}
                        </Text>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveStudent}>
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      style={styles.saveButtonGradient}
                    >
                      <CheckCircleIcon size={18} color="#fff" />
                      <Text style={styles.saveButtonText}>학생 등록 완료</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        visible={showDiagnosisModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDiagnosisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedStudent?.name} 학생
              </Text>
              <TouchableOpacity onPress={() => setShowDiagnosisModal(false)}>
                <XIcon size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.detailCard, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>학년/과목</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {GRADE_NAMES[selectedStudent.grade]} · {selectedStudent.subject}
                  </Text>
                </View>

                {selectedStudent.currentTopic && (
                  <View style={[styles.detailCard, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>현재 학습 단원</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {MATH_TOPICS.find(t => t.code === selectedStudent.currentTopic)?.name || selectedStudent.currentTopic}
                    </Text>
                  </View>
                )}

                <View style={[styles.detailCard, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>완료한 수업</Text>
                  <Text style={[styles.detailValue, { color: colors.tint }]}>
                    {selectedStudent.lessonsCount}회
                  </Text>
                </View>

                {selectedStudent.diagnosis && selectedStudent.diagnosis.gaps.length > 0 && (
                  <View style={styles.gapsSection}>
                    <Text style={[styles.gapsSectionTitle, { color: colors.text }]}>
                      📊 진단된 결손
                    </Text>
                    {selectedStudent.diagnosis.gaps.map(gap => (
                      <View
                        key={gap.topic.code}
                        style={[styles.gapItem, { backgroundColor: colors.backgroundTertiary }]}
                      >
                        <View style={[styles.severityDot, {
                          backgroundColor: gap.severity === 'CRITICAL' ? '#EF4444' : '#FBBF24',
                        }]} />
                        <View style={styles.gapInfo}>
                          <Text style={[styles.gapName, { color: colors.text }]}>
                            {gap.topic.name}
                          </Text>
                          <Text style={[styles.gapMeta, { color: colors.textMuted }]}>
                            {GRADE_NAMES[gap.topic.grade]}
                          </Text>
                        </View>
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
    height: 200,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 300,
    borderRadius: 200,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySmall, marginTop: spacing.xs },
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48, height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  studentInfo: { flex: 1, marginLeft: spacing.md },
  studentName: { ...typography.body, fontWeight: '600' },
  studentMeta: { ...typography.caption, marginTop: 2 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  lessonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { ...typography.caption, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56, height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
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
    marginBottom: spacing.lg,
  },
  stepDot: {
    width: 8, height: 8,
    borderRadius: 4,
  },
  stepDescription: {
    ...typography.body,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { ...typography.caption, marginBottom: spacing.xs },
  input: {
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 15,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gradeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  gradeChipText: { ...typography.bodySmall, fontWeight: '500' },
  topicList: { gap: spacing.sm, marginBottom: spacing.lg },
  topicCard: {
    padding: spacing.md,
    borderRadius: 12,
  },
  topicName: { ...typography.body, fontWeight: '600' },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  topicHours: { ...typography.caption },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prereqText: { ...typography.caption, marginTop: 4 },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  nextButtonText: {
    color: '#fff',
    ...typography.body,
    fontWeight: '600',
  },
  diagnoseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  diagnoseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  diagnoseButtonText: {
    color: '#fff',
    ...typography.body,
    fontWeight: '600',
  },
  resultCard: {
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  resultTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, marginTop: 4 },
  statDivider: { width: 1, height: 40 },
  gapsSection: { marginBottom: spacing.lg },
  gapsSectionTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  gapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  severityDot: {
    width: 8, height: 8,
    borderRadius: 4,
  },
  gapInfo: { flex: 1, marginLeft: spacing.md },
  gapName: { ...typography.body, fontWeight: '500' },
  gapMeta: { ...typography.caption, marginTop: 2 },
  gapSeverity: {
    ...typography.caption,
    fontWeight: '600',
  },
  tipsSection: { marginBottom: spacing.lg },
  tipsSectionTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    marginBottom: 4,
    lineHeight: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  saveButtonText: {
    color: '#fff',
    ...typography.body,
    fontWeight: '600',
  },
  detailCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
  },
});
