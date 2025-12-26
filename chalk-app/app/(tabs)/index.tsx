import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, spacing, radius } from '@/constants/Colors';
import { layout } from '@/components/ui/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StudentPicker } from '@/components/ui/StudentPicker';
import { RatingSelector } from '@/components/ui/RatingSelector';
import { TopicPicker } from '@/components/ui/TopicPicker';
import { useData } from '@/lib/DataContext';
import { SparklesIcon, CheckCircleIcon, LightbulbIcon, TargetIcon, BookOpenIcon, EyeIcon } from '@/components/Icons';

const RECENT_TOPICS = ['Quadratic Equations', 'Chapter 5', 'Essay Writing', 'Verb Tenses'];

const STRUGGLES = [
  { id: 'understanding', label: 'Understanding', Icon: LightbulbIcon },
  { id: 'practice', label: 'Practice', Icon: TargetIcon },
  { id: 'memory', label: 'Memory', Icon: BookOpenIcon },
  { id: 'focus', label: 'Focus', Icon: EyeIcon },
];

export default function LogScreen() {
  const { students, addStudent, removeStudent, addLessonLog, getLogsForDate } = useData();

  // State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [rating, setRating] = useState<'good' | 'okay' | 'struggled' | null>(null);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = getLogsForDate(today);

  // Handlers
  const handleAddStudent = () => {
    Alert.prompt('Add Student', 'Enter name', (text) => {
      if (text?.trim()) {
        const newStudent = addStudent({ name: text.trim() });
        setSelectedStudentId(newStudent.id);
      }
    });
  };

  const toggleStruggle = (id: string) => {
    setStruggles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleExtractInsights = () => {
    if (!notes.trim()) return;
    setIsExtracting(true);
    setTimeout(() => {
      setAiInsights(`Based on your notes, ${selectedStudent?.name} seems to struggle with application. Focus on practice problems next time.`);
      setIsExtracting(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!selectedStudent || !rating) return;

    addLessonLog({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      topic: topic || 'General Review',
      rating,
      struggles,
      notes,
      aiInsights: aiInsights || undefined,
    });

    // Reset form
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    setSelectedStudentId(null);
    setTopic('');
    setRating(null);
    setStruggles([]);
    setNotes('');
    setAiInsights(null);
  };

  return (
    <SafeAreaView style={layout.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Evening,</Text>
              <Text style={styles.title}>Log Lesson</Text>
            </View>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Today's Count */}
          {todaysLogs.length > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                <Text style={{ color: colors.accent.default, fontWeight: '700' }}>{todaysLogs.length}</Text> lessons logged today
              </Text>
            </View>
          )}

          {/* Student Picker */}
          <StudentPicker
            students={students}
            selectedId={selectedStudentId}
            onSelect={setSelectedStudentId}
            onAdd={handleAddStudent}
            onDelete={(s) => removeStudent(s.id)}
          />

          {selectedStudent && (
            <>
              {/* Topic */}
              <TopicPicker
                value={topic}
                onChange={setTopic}
                recentTopics={RECENT_TOPICS}
              />

              {/* Rating */}
              <RatingSelector
                value={rating}
                onChange={setRating}
              />

              {/* Struggles (Optional) */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ANY STRUGGLES?</Text>
                <View style={styles.struggleGrid}>
                  {STRUGGLES.map((item) => {
                    const isActive = struggles.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.struggleItem, isActive && styles.struggleItemActive]}
                        onPress={() => toggleStruggle(item.id)}
                      >
                        <item.Icon
                          size={16}
                          color={isActive ? colors.status.warning : colors.text.muted}
                        />
                        <Text style={[styles.struggleText, isActive && styles.struggleTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Notes & AI */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>NOTES</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Quick notes about progress..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />

                {notes.length > 10 && (
                  <Button
                    title="Generate AI Insights"
                    variant="ghost"
                    size="sm"
                    loading={isExtracting}
                    onPress={handleExtractInsights}
                    icon={<SparklesIcon size={16} color={colors.accent.default} />}
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  />
                )}

                {aiInsights && (
                  <Card variant="glow" style={{ marginTop: 16 }}>
                    <View style={layout.row}>
                      <SparklesIcon size={16} color={colors.accent.default} />
                      <Text style={[typography.small, { color: colors.accent.default, marginLeft: 8 }]}>AI Insight</Text>
                    </View>
                    <Text style={[typography.body, { color: colors.text.secondary, marginTop: 8, fontSize: 14 }]}>
                      {aiInsights}
                    </Text>
                  </Card>
                )}
              </View>

              {/* Submit Action */}
              <View style={{ marginTop: spacing.xl }}>
                <Button
                  title="Save Lesson Log"
                  onPress={handleSave}
                  disabled={!rating}
                />
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast */}
      {showToast && (
        <View style={styles.toast}>
          <CheckCircleIcon size={20} color={colors.status.success} />
          <Text style={styles.toastText}>Lesson Saved!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.body,
    color: colors.text.muted,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  dateBadge: {
    backgroundColor: colors.bg.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dateText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  statsRow: {
    marginBottom: spacing.xl,
  },
  statsText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  struggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  struggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: 6,
  },
  struggleItemActive: {
    borderColor: colors.status.warning,
    backgroundColor: `${colors.status.warning}15`,
  },
  struggleText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  struggleTextActive: {
    color: colors.status.warning,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border.default,
    ...typography.body,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: colors.bg.elevated,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  toastText: {
    ...typography.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
