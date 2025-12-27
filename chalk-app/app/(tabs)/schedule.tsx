import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors, typography, spacing, radius } from '@/constants/Colors';
import { layout } from '@/components/ui/Theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useData, ScheduledLesson } from '@/lib/DataContext';
import { useGoogleAuth } from '@/lib/useGoogleAuth';
import { SettlementView } from '@/components/ui/SettlementView';
import {
  CalendarIcon, ClockIcon, VideoIcon, CheckCircleIcon, UsersIcon,
  PlusIcon, XIcon, ChevronRightIcon, DollarIcon
} from '@/components/Icons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = [
  colors.accent.default,
  '#6366F1', // indigo
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#8B5CF6', // violet
];

export default function ScheduleScreen() {
  const router = useRouter();
  const { students, scheduledLessons, addScheduledLesson, removeScheduledLesson, updateScheduledLesson, lessonLogs, startSession, activeSession } = useData();
  const googleAuth = useGoogleAuth();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'week' | 'settle' | 'history'>('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ScheduledLesson | null>(null);

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedTime, setSelectedTime] = useState('16:00');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isRecurring, setIsRecurring] = useState(true);
  const [subject, setSubject] = useState('');

  // Fetch Google Calendar events on mount
  useEffect(() => {
    if (googleAuth.isAuthenticated && !googleAuth.isLoadingEvents) {
      googleAuth.fetchEvents();
    }
  }, [googleAuth.isAuthenticated]);

  // Filter today's lessons
  const today = new Date().getDay();
  const todaysLessons = scheduledLessons.filter(lesson => lesson.day === today);

  // Week view data
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i);
    return {
      day: i,
      date: date.getDate(),
      lessons: scheduledLessons.filter(l => l.day === i),
    };
  });

  const handleStartClass = (lesson: ScheduledLesson) => {
    if (activeSession) {
      Alert.alert('Lesson in Progress', 'You already have an active lesson. Please end it first.');
      return;
    }

    Alert.alert(
      'Start Lesson',
      `Start lesson with ${lesson.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            startSession(lesson.studentId, lesson.studentName);
            router.push('/');
          }
        }
      ]
    );
  };

  const handleAddLesson = () => {
    if (!selectedStudentId) {
      Alert.alert('Error', 'Please select a student.');
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    if (editingLesson) {
      updateScheduledLesson(editingLesson.id, {
        studentId: selectedStudentId,
        studentName: student.name,
        day: selectedDay,
        time: selectedTime,
        duration: selectedDuration,
        recurring: isRecurring,
        subject: subject || student.subject,
      });
    } else {
      addScheduledLesson({
        studentId: selectedStudentId,
        studentName: student.name,
        day: selectedDay,
        time: selectedTime,
        duration: selectedDuration,
        recurring: isRecurring,
        subject: subject || student.subject,
      });
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEditLesson = (lesson: ScheduledLesson) => {
    setEditingLesson(lesson);
    setSelectedStudentId(lesson.studentId);
    setSelectedDay(lesson.day);
    setSelectedTime(lesson.time);
    setSelectedDuration(lesson.duration);
    setIsRecurring(lesson.recurring);
    setSubject(lesson.subject || '');
    setShowAddModal(true);
  };

  const handleDeleteLesson = (lesson: ScheduledLesson) => {
    Alert.alert(
      'Delete Lesson',
      `Delete ${lesson.studentName}'s ${DAYS[lesson.day]} lesson?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeScheduledLesson(lesson.id) }
      ]
    );
  };

  const resetForm = () => {
    setEditingLesson(null);
    setSelectedStudentId(null);
    setSelectedDay(new Date().getDay());
    setSelectedTime('16:00');
    setSelectedDuration(60);
    setIsRecurring(true);
    setSubject('');
  };

  const getStudentColor = (studentId: string) => {
    const index = students.findIndex(s => s.id === studentId);
    return COLORS[index % COLORS.length];
  };

  return (
    <SafeAreaView style={layout.container} edges={['top']}>
      <View style={layout.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.h1}>Schedule</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {googleAuth.isAuthenticated && (
              <View style={styles.syncBadge}>
                <CheckCircleIcon size={12} color={colors.status.success} />
                <Text style={styles.syncText}>Google Synced</Text>
              </View>
            )}
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
              <PlusIcon size={20} color={colors.accent.default} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {[
            { key: 'upcoming', label: 'Today' },
            { key: 'week', label: 'Week' },
            { key: 'settle', label: 'Settle' },
            { key: 'history', label: 'History' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* UPCOMING VIEW */}
          {activeTab === 'upcoming' && (
            <View style={styles.list}>
              {/* Google Calendar Events */}
              {googleAuth.calendarEvents.length > 0 && (
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={styles.sectionLabel}>FROM GOOGLE CALENDAR</Text>
                  {googleAuth.calendarEvents.slice(0, 3).map((event) => {
                    const startDate = new Date(event.start);
                    const isToday = startDate.toDateString() === new Date().toDateString();
                    if (!isToday) return null;
                    return (
                      <Card key={event.id} style={styles.calendarEventCard}>
                        <View style={styles.eventRow}>
                          <CalendarIcon size={16} color={colors.accent.default} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.eventTitle}>{event.summary}</Text>
                            <Text style={styles.eventTime}>
                              {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              )}
              {/* Google Calendar Banner */}
              {!googleAuth.isAuthenticated && (
                <Card variant="glass" style={styles.banner}>
                  <View style={layout.row}>
                    <CalendarIcon size={20} color={colors.text.secondary} />
                    <Text style={styles.bannerText}>Connect Google Calendar</Text>
                  </View>
                  <Button
                    title="Connect"
                    size="sm"
                    variant="outline"
                    onPress={googleAuth.signIn}
                  />
                </Card>
              )}

              <Text style={styles.sectionTitle}>Today ({DAYS[today]})</Text>
              {todaysLessons.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No lessons scheduled for today</Text>
                  <Button
                    title="Add Lesson"
                    size="sm"
                    variant="secondary"
                    onPress={() => setShowAddModal(true)}
                    style={{ marginTop: spacing.md }}
                  />
                </Card>
              ) : (
                todaysLessons.map((lesson) => (
                  <Card key={lesson.id} style={styles.lessonCard}>
                    <TouchableOpacity
                      style={styles.lessonRow}
                      onPress={() => handleEditLesson(lesson)}
                      onLongPress={() => handleDeleteLesson(lesson)}
                    >
                      <View style={styles.timeContainer}>
                        <View style={[styles.colorDot, { backgroundColor: getStudentColor(lesson.studentId) }]} />
                        <Text style={styles.timeText}>{lesson.time}</Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.studentName}>{lesson.studentName}</Text>
                        <Text style={styles.subjectText}>{lesson.subject || 'General'}</Text>
                        {lesson.homeworkDue && (
                          <View style={styles.homeworkBadge}>
                            <CheckCircleIcon size={12} color={colors.status.warning} />
                            <Text style={styles.homeworkText}>HW: {lesson.homeworkDue}</Text>
                          </View>
                        )}
                      </View>
                      <ChevronRightIcon size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                    <Button
                      title="Start Lesson"
                      size="sm"
                      icon={<VideoIcon size={16} color={colors.bg.base} />}
                      onPress={() => handleStartClass(lesson)}
                      style={{ marginTop: 12 }}
                    />
                  </Card>
                ))
              )}
            </View>
          )}

          {/* WEEK VIEW */}
          {activeTab === 'week' && (
            <View style={styles.weekContainer}>
              {weekDays.map(({ day, date, lessons }) => (
                <View key={day} style={[styles.dayColumn, day === today && styles.dayColumnToday]}>
                  <View style={styles.dayHeader}>
                    <Text style={[styles.dayLabel, day === today && styles.dayLabelToday]}>
                      {DAYS[day]}
                    </Text>
                    <Text style={[styles.dateLabel, day === today && styles.dateLabelToday]}>
                      {date}
                    </Text>
                  </View>
                  <View style={styles.dayLessons}>
                    {lessons.map(lesson => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[styles.weekLesson, { backgroundColor: getStudentColor(lesson.studentId) + '20', borderLeftColor: getStudentColor(lesson.studentId) }]}
                        onPress={() => handleEditLesson(lesson)}
                      >
                        <Text style={styles.weekLessonTime}>{lesson.time}</Text>
                        <Text style={styles.weekLessonName} numberOfLines={1}>{lesson.studentName}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* SETTLE VIEW */}
          {activeTab === 'settle' && (
            <SettlementView />
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
                [...lessonLogs].slice(0, 20).map((log) => (
                  <Card key={log.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <View style={layout.row}>
                        <View style={[styles.colorDot, { backgroundColor: getStudentColor(log.studentId) }]} />
                        <Text style={styles.historyName}>{log.studentName}</Text>
                      </View>
                      <Text style={styles.historyDate}>{log.date}</Text>
                    </View>
                    <Text style={styles.historyTopic}>{log.topic}</Text>
                    <View style={styles.tagRow}>
                      <View style={[styles.ratingTag, { borderColor: getRatingColor(log.rating) }]}>
                        <Text style={[styles.tagText, { color: getRatingColor(log.rating) }]}>
                          {log.rating === 'good' ? 'Good' : log.rating === 'okay' ? 'Okay' : 'Struggled'}
                        </Text>
                      </View>
                      <Text style={styles.durationText}>{log.duration}min</Text>
                    </View>
                  </Card>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </View>

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                <XIcon size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Student Selection */}
              <Text style={styles.fieldLabel}>Student</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentScroll}>
                {students.map(student => (
                  <TouchableOpacity
                    key={student.id}
                    style={[styles.studentChip, selectedStudentId === student.id && { backgroundColor: getStudentColor(student.id) + '30', borderColor: getStudentColor(student.id) }]}
                    onPress={() => setSelectedStudentId(student.id)}
                  >
                    <Text style={[styles.studentChipText, selectedStudentId === student.id && { color: getStudentColor(student.id) }]}>
                      {student.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Day Selection */}
              <Text style={styles.fieldLabel}>Day</Text>
              <View style={styles.daysRow}>
                {DAYS.map((day, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
                    onPress={() => setSelectedDay(i)}
                  >
                    <Text style={[styles.dayChipText, selectedDay === i && styles.dayChipTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time */}
              <Text style={styles.fieldLabel}>Time</Text>
              <View style={styles.timeRow}>
                {['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeChipText, selectedTime === time && styles.timeChipTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Duration */}
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {[30, 60, 90, 120].map(dur => (
                  <TouchableOpacity
                    key={dur}
                    style={[styles.durationChip, selectedDuration === dur && styles.durationChipActive]}
                    onPress={() => setSelectedDuration(dur)}
                  >
                    <Text style={[styles.durationChipText, selectedDuration === dur && styles.durationChipTextActive]}>
                      {dur}min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subject */}
              <Text style={styles.fieldLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Math, English, Science..."
                placeholderTextColor={colors.text.muted}
                value={subject}
                onChangeText={setSubject}
              />

              {/* Recurring */}
              <TouchableOpacity
                style={styles.recurringRow}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View style={[styles.checkbox, isRecurring && styles.checkboxActive]}>
                  {isRecurring && <CheckCircleIcon size={14} color={colors.accent.default} />}
                </View>
                <Text style={styles.recurringText}>Repeat weekly</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              {editingLesson && (
                <Button
                  title="Delete"
                  variant="ghost"
                  onPress={() => {
                    handleDeleteLesson(editingLesson);
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{ flex: 1 }}
                />
              )}
              <Button
                title={editingLesson ? 'Save' : 'Add'}
                onPress={handleAddLesson}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    padding: 8,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  syncText: {
    fontSize: 10,
    color: colors.status.success,
    fontWeight: '600',
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
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
  },
  lessonCard: {
    padding: 16,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  timeText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text.primary,
  },
  lessonInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subjectText: {
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
  // Week view
  weekContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dayColumn: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: 4,
    minHeight: 200,
  },
  dayColumnToday: {
    backgroundColor: colors.accent.default + '10',
    borderWidth: 1,
    borderColor: colors.accent.default + '30',
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
  },
  dayLabelToday: {
    color: colors.accent.default,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '700',
  },
  dateLabelToday: {
    color: colors.accent.default,
  },
  dayLessons: {
    paddingTop: 4,
    gap: 4,
  },
  weekLesson: {
    padding: 4,
    borderRadius: 4,
    borderLeftWidth: 2,
  },
  weekLessonTime: {
    fontSize: 8,
    color: colors.text.muted,
  },
  weekLessonName: {
    fontSize: 9,
    color: colors.text.primary,
    fontWeight: '600',
  },
  // History
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 16,
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
    alignItems: 'center',
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
  durationText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg.base,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  studentScroll: {
    flexDirection: 'row',
  },
  studentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.bg.secondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  studentChipText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dayChipActive: {
    backgroundColor: colors.accent.default + '20',
    borderColor: colors.accent.default,
  },
  dayChipText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  dayChipTextActive: {
    color: colors.accent.default,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  timeChipActive: {
    backgroundColor: colors.accent.default + '20',
    borderColor: colors.accent.default,
  },
  timeChipText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  timeChipTextActive: {
    color: colors.accent.default,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  durationChipActive: {
    backgroundColor: colors.accent.default + '20',
    borderColor: colors.accent.default,
  },
  durationChipText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  durationChipTextActive: {
    color: colors.accent.default,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...typography.body,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accent.default + '20',
    borderColor: colors.accent.default,
  },
  recurringText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calendarEventCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.bg.tertiary,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.default,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  eventTime: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
