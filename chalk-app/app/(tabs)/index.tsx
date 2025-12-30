import React, { useState, useEffect } from 'react';
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
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { colors, typography, spacing, radius } from '@/constants/Colors';
import { layout } from '@/components/ui/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StudentPicker } from '@/components/ui/StudentPicker';
import { RatingSelector } from '@/components/ui/RatingSelector';
import { VoiceRecorder } from '@/components/ui/VoiceRecorder';
import { RatingNotification } from '@/components/ui/RatingNotification';
import { TopicPicker } from '@/components/ui/TopicPicker';
import { useData } from '@/lib/DataContext';
import { useZoomAuth, ZoomRecording } from '@/lib/useZoomAuth';
import { useAutoLessonDetection, createAutoLessonLog } from '@/lib/useAutoLessonDetection';
import {
  SparklesIcon, CheckCircleIcon, LightbulbIcon, TargetIcon,
  BookOpenIcon, EyeIcon, PlusIcon, XIcon, ChevronDownIcon
} from '@/components/Icons';
import { getTopicsForSubject, CurriculumTopic } from '@/data/curriculum';
import { generateLessonInsights, generateTopicRecommendations, TopicRecommendation } from '@/services/geminiService';
import { generateParentReport, formatReportForShare, generateShareToken, getReportShareUrl, saveReportHistory } from '@/services/reportService';
import { Share } from 'react-native';

const STRUGGLES = [
  { id: 'understanding', label: 'Understanding', Icon: LightbulbIcon },
  { id: 'practice', label: 'Practice', Icon: TargetIcon },
  { id: 'memory', label: 'Memory', Icon: BookOpenIcon },
  { id: 'focus', label: 'Focus', Icon: EyeIcon },
];

export default function LogScreen() {
  const { students, addStudent, removeStudent, addLessonLog, getLogsForDate, getLogsForStudent, activeSession, endSession, scheduledLessons, removeScheduledLesson } = useData();
  const zoomAuth = useZoomAuth();
  // Zero-Action: 자동 수업 감지
  const autoLesson = useAutoLessonDetection(students);

  // State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [rating, setRating] = useState<'good' | 'okay' | 'struggled' | null>(null);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [homework, setHomework] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [zoomRecordingUrl, setZoomRecordingUrl] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<ZoomRecording | null>(null);
  const [lessonDuration, setLessonDuration] = useState(60);

  // AI States
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [topicRecommendations, setTopicRecommendations] = useState<TopicRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // UI States
  const [showToast, setShowToast] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // Report States
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [reportShareUrl, setReportShareUrl] = useState('');
  const [currentReportData, setCurrentReportData] = useState<any>(null);
  const [currentLessonLogId, setCurrentLessonLogId] = useState<string | null>(null);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Derived
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = getLogsForDate(today);
  const topics = selectedStudent?.subject ? getTopicsForSubject(selectedStudent.subject) : [];
  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  // Recent Topics for Zero-Action UX
  const studentLogs = selectedStudentId ? getLogsForStudent(selectedStudentId) : [];
  const recentTopics = Array.from(new Set(studentLogs.map(l => l.topic))).slice(0, 3);

  // Active Session Effect
  useEffect(() => {
    if (activeSession) {
      setSelectedStudentId(activeSession.studentId);
    }
  }, [activeSession]);

  // Load topic recommendations when student changes
  useEffect(() => {
    if (selectedStudent) {
      loadTopicRecommendations();
    }
  }, [selectedStudentId]);

  // Fetch Zoom recordings when authenticated
  useEffect(() => {
    if (zoomAuth.isAuthenticated && zoomAuth.recordings.length === 0) {
      zoomAuth.fetchRecordings();
    }
  }, [zoomAuth.isAuthenticated]);

  const loadTopicRecommendations = async () => {
    if (!selectedStudent) return;

    const studentLogs = getLogsForStudent(selectedStudent.id);
    const previousTopics = studentLogs.map(l => l.topic).slice(0, 5);
    const lastRating = studentLogs[0]?.rating || 'okay';

    // Auto-fill last topic for this student with auto-increment
    if (studentLogs.length > 0 && !customTopic && !selectedTopicId) {
      const lastTopic = studentLogs[0].topic;
      // Check if topic has session number pattern (e.g., "이차방정식 2회차")
      const sessionMatch = lastTopic.match(/^(.+?)\s*(\d+)회차$/);
      if (sessionMatch) {
        const baseTopic = sessionMatch[1].trim();
        const nextSession = parseInt(sessionMatch[2]) + 1;
        setCustomTopic(`${baseTopic} ${nextSession}회차`);
      } else {
        // First time - add "2회차" if repeating same topic
        setCustomTopic(`${lastTopic} 2회차`);
      }
    }

    // Calculate student stats for personalized recommendations
    const goodCount = studentLogs.filter(l => l.rating === 'good').length;
    const goodRate = studentLogs.length > 0 ? goodCount / studentLogs.length : 0;
    const struggledTopics = studentLogs
      .filter(l => l.rating === 'struggled')
      .map(l => l.topic)
      .filter((v, i, a) => a.indexOf(v) === i);

    try {
      const recommendations = await generateTopicRecommendations(
        selectedStudent.name,
        selectedStudent.subject || 'General',
        previousTopics,
        lastRating,
        {
          grade: selectedStudent.grade,
          goal: selectedStudent.goal,
          goodRate,
          struggledTopics,
        }
      );
      setTopicRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  // Handlers
  const handleAddStudent = () => {
    setShowAddStudentModal(true);
  };

  const confirmAddStudent = () => {
    if (newStudentName.trim()) {
      const newStudent = addStudent({ name: newStudentName.trim() });
      setSelectedStudentId(newStudent.id);
      setNewStudentName('');
      setShowAddStudentModal(false);
    }
  };

  const toggleStruggle = (id: string) => {
    setStruggles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled && result.assets) {
      setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateInsights = async () => {
    if (!selectedStudent || !rating) return;

    setIsGeneratingInsights(true);
    try {
      const topic = selectedTopic?.nameKr || customTopic || 'General Review';
      const insights = await generateLessonInsights({
        studentName: selectedStudent.name,
        topic,
        rating,
        struggles,
        notes,
      });
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      Alert.alert('Error', 'Failed to generate AI insights.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setNotes(prev => prev ? `${prev}\n\n${text}` : text);
  };

  const showShareReportOption = async (
    student: any,
    topic: string,
    rating: string,
    notes: string,
    homework: string,
    lessonLogId: string
  ) => {
    setCurrentReportData({ student, topic, rating, notes, homework });
    setCurrentLessonLogId(lessonLogId);
    setShowReportModal(true);
    setIsGeneratingReport(true);

    try {
      const logs = getLogsForStudent(student.id);
      const report = await generateParentReport(
        { id: lessonLogId, topic, rating, duration: lessonDuration, notes, homeworkAssigned: homework } as any,
        student,
        logs as any
      );
      setGeneratedReport(report);

      const token = generateShareToken();
      setReportShareUrl(getReportShareUrl(token));
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate parent report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleShareReport = async () => {
    if (!generatedReport || !selectedStudent || !currentLessonLogId) return;

    try {
      const shareMessage = formatReportForShare(
        generatedReport,
        currentReportData.student.name,
        reportShareUrl
      );

      const result = await Share.share({
        message: shareMessage,
        title: `Lesson Report - ${currentReportData.student.name}`,
      });

      if (result.action === Share.sharedAction) {
        await saveReportHistory(currentLessonLogId, generatedReport, 'share_sheet');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const handleSave = () => {
    if (!selectedStudent) return;

    // Calculate duration if active session
    let duration = 60;
    if (activeSession) {
      const diff = Math.floor((Date.now() - activeSession.startTime) / 1000 / 60);
      duration = diff > 0 ? diff : 1;
      endSession();
    }

    const topic = selectedTopic?.nameKr || customTopic || 'General Review';
    const finalRating = rating || 'okay'; // Default to 'okay' if skipped

    const lessonLogId = addLessonLog({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration,
      topic,
      topicId: selectedTopicId || undefined,
      rating: finalRating,
      struggles,
      notes: activeSession ? `[Auto: ${duration}min] ${notes}` : notes,
      homeworkAssigned: homework,
      photos: photos.length > 0 ? photos : undefined,
      zoomRecordingUrl: zoomRecordingUrl || undefined,
      aiInsights: aiInsights || undefined,
    });

    // Mark today's schedule as completed (remove from upcoming)
    const todayDayOfWeek = new Date().getDay();
    const todaysSchedule = scheduledLessons.find(
      l => l.studentId === selectedStudent.id && l.day === todayDayOfWeek
    );
    if (todaysSchedule && !todaysSchedule.recurring) {
      removeScheduledLesson(todaysSchedule.id);
    }

    // Reset form
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    setSelectedStudentId(null);
    setSelectedTopicId(null);
    setCustomTopic('');
    setRating(null); // Reset rating for next lesson

    // Offer to share report with parent
    if (selectedStudent) {
      setTimeout(() => {
        showShareReportOption(selectedStudent, topic, finalRating, notes, homework, lessonLogId);
      }, 500);
    }
    setStruggles([]);
    setNotes('');
    setHomework('');
    setPhotos([]);
    setZoomRecordingUrl('');
    setAiInsights(null);
    setTopicRecommendations([]);
  };

  return (
    <SafeAreaView style={layout.container} edges={['top']}>
      {/* Zero-Action: 자동 수업 감지 후 1탭 평가 알림 */}
      <RatingNotification
        pendingLesson={autoLesson.getNextPendingLesson() ? {
          ...autoLesson.getNextPendingLesson()!,
          topic: autoLesson.getNextPendingLesson()?.topic ?? undefined,
        } : null}
        onRate={async (rating) => {
          const pending = autoLesson.getNextPendingLesson();
          if (pending) {
            const log = createAutoLessonLog(pending, rating);
            const logId = addLessonLog(log);
            await autoLesson.markAsRated(pending.eventId);
            // 자동 리포트 생성 및 발송 (학부모 연락처 있을 시)
            if (pending.student.parentContact) {
              showShareReportOption(pending.student, log.topic, rating, '', '', logId);
            }
          }
        }}
        onDismiss={() => { }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={layout.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.title}>Log Lesson</Text>
            </View>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Active Session Banner */}
          {activeSession && (
            <Card variant="glow" style={{ marginBottom: 24, borderColor: colors.accent.default }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={styles.recordingDot} />
                  <View>
                    <Text style={[typography.small, { color: colors.accent.default }]}>Lesson in Progress</Text>
                    <Text style={[typography.h3, { color: colors.text.primary }]}>{activeSession.studentName}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.endSessionBtn}
                  onPress={() => {
                    Alert.alert('End Session', 'End this lesson without saving?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'End', style: 'destructive', onPress: () => endSession() }
                    ]);
                  }}
                >
                  <Text style={styles.endSessionText}>End</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Today's Count */}
          {!activeSession && todaysLogs.length > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                Today <Text style={{ color: colors.accent.default, fontWeight: '700' }}>{todaysLogs.length}</Text> lessons logged
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

          {/* Empty State - No Students */}
          {students.length === 0 && (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>👋 Welcome to Chalk!</Text>
              <Text style={styles.emptyStateText}>
                Add your first student to start logging lessons.
              </Text>
              <Button
                title="Add Student"
                onPress={handleAddStudent}
                style={{ marginTop: spacing.lg }}
              />
            </Card>
          )}

          {selectedStudent && (
            <>
              {/* AI Topic Recommendations */}
              {topicRecommendations.length > 0 && !selectedTopicId && !customTopic && (
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.recommendationHeader}
                    onPress={() => setShowRecommendations(!showRecommendations)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <SparklesIcon size={16} color={colors.accent.default} />
                      <Text style={styles.recommendationTitle}>AI Recommended Topics</Text>
                    </View>
                    <ChevronDownIcon size={16} color={colors.text.muted} />
                  </TouchableOpacity>

                  {showRecommendations && (
                    <View style={styles.recommendationList}>
                      {topicRecommendations.map((rec, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.recommendationItem}
                          onPress={() => {
                            setCustomTopic(rec.topic);
                            setShowRecommendations(false);
                          }}
                        >
                          <View>
                            <Text style={styles.recTopic}>{rec.topic}</Text>
                            <Text style={styles.recReason}>{rec.reason}</Text>
                          </View>
                          <View style={[styles.difficultyBadge, {
                            backgroundColor: rec.difficulty === 'easy' ? colors.status.success + '20' :
                              rec.difficulty === 'hard' ? colors.status.error + '20' : colors.status.warning + '20'
                          }]}>
                            <Text style={[styles.difficultyText, {
                              color: rec.difficulty === 'easy' ? colors.status.success :
                                rec.difficulty === 'hard' ? colors.status.error : colors.status.warning
                            }]}>
                              {rec.difficulty === 'easy' ? 'Easy' : rec.difficulty === 'hard' ? 'Hard' : 'Medium'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Topic Picker - 단순화: TopicPicker만 사용 */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Topic</Text>

                {/* Recent Topics (Zero-Action Card) */}
                {recentTopics.length > 0 && !selectedTopicId && !customTopic && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {recentTopics.map((topic, i) => (
                      <TouchableOpacity
                        key={i}
                        style={{
                          backgroundColor: colors.bg.secondary,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          borderRadius: radius.md,
                          borderWidth: 1,
                          borderColor: colors.border.default,
                        }}
                        onPress={() => setCustomTopic(topic)}
                      >
                        <Text style={[typography.small, { color: colors.text.secondary }]}>{topic}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Smart TopicPicker with autocomplete */}
                <TopicPicker
                  value={customTopic}
                  onChange={(text) => {
                    setCustomTopic(text);
                    if (text) setSelectedTopicId(null);
                  }}
                  recentTopics={recentTopics}
                />
              </View>

              {/* Rating */}
              <RatingSelector value={rating} onChange={setRating} />

              {/* Struggles */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Struggles</Text>
                <View style={styles.struggleGrid}>
                  {STRUGGLES.map((item) => {
                    const isActive = struggles.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.struggleItem, isActive && styles.struggleItemActive]}
                        onPress={() => toggleStruggle(item.id)}
                      >
                        <item.Icon size={16} color={isActive ? colors.status.warning : colors.text.muted} />
                        <Text style={[styles.struggleText, isActive && styles.struggleTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Photo Attachments */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Photos</Text>
                <View style={styles.photoGrid}>
                  {photos.map((uri, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.photo} />
                      <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                        <XIcon size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {photos.length < 5 && (
                    <View style={styles.addPhotoButtons}>
                      <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhoto}>
                        <PlusIcon size={20} color={colors.text.muted} />
                        <Text style={styles.addPhotoText}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.addPhotoBtn} onPress={handleTakePhoto}>
                        <PlusIcon size={20} color={colors.text.muted} />
                        <Text style={styles.addPhotoText}>Camera</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Voice Memo */}
              <VoiceRecorder onTranscription={handleVoiceTranscription} />

              {/* Notes & AI */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Record lesson notes..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />

                {notes.length > 10 && rating && (
                  <Button
                    title="Generate AI Insights"
                    variant="ghost"
                    size="sm"
                    loading={isGeneratingInsights}
                    onPress={handleGenerateInsights}
                    icon={<SparklesIcon size={16} color={colors.accent.default} />}
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  />
                )}

                {aiInsights && (
                  <Card variant="glow" style={{ marginTop: 16 }}>
                    <View style={layout.row}>
                      <SparklesIcon size={16} color={colors.accent.default} />
                      <Text style={[typography.small, { color: colors.accent.default, marginLeft: 8 }]}>
                        AI Insights
                      </Text>
                    </View>
                    <Text style={styles.insightSummary}>{aiInsights.summary}</Text>

                    {aiInsights.nextSteps?.length > 0 && (
                      <View style={styles.insightSection}>
                        <Text style={styles.insightLabel}>Recommended for next lesson:</Text>
                        {aiInsights.nextSteps.map((step: string, i: number) => (
                          <Text key={i} style={styles.insightItem}>• {step}</Text>
                        ))}
                      </View>
                    )}

                    {aiInsights.encouragement && (
                      <Text style={styles.insightEncouragement}>{aiInsights.encouragement}</Text>
                    )}
                  </Card>
                )}
              </View>

              {/* Zoom Recording Selector */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Zoom Recording (optional)</Text>
                {zoomAuth.isAuthenticated && zoomAuth.recordings.length > 0 ? (
                  <View>
                    {zoomAuth.recordings.slice(0, 3).map((rec) => (
                      <TouchableOpacity
                        key={rec.id}
                        style={[
                          styles.recordingOption,
                          selectedRecording?.id === rec.id && styles.recordingOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedRecording(rec);
                          setLessonDuration(rec.duration || 60);
                          setZoomRecordingUrl(rec.recording_files?.[0]?.play_url || '');
                        }}
                      >
                        <View style={styles.recordingInfo}>
                          <Text style={styles.recordingTopic} numberOfLines={1}>{rec.topic}</Text>
                          <Text style={styles.recordingMeta}>
                            {new Date(rec.start_time).toLocaleDateString()} • {rec.duration} min
                          </Text>
                        </View>
                        {selectedRecording?.id === rec.id && (
                          <CheckCircleIcon size={18} color={colors.accent.default} />
                        )}
                      </TouchableOpacity>
                    ))}
                    {selectedRecording && (
                      <Text style={styles.autoDurationText}>
                        ✓ Duration auto-filled: {lessonDuration} min
                      </Text>
                    )}
                  </View>
                ) : null}
              </View>

              {/* Homework - 단순화: 한 줄 placeholder */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Homework (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 수학익힘책 32-35페이지"
                  placeholderTextColor={colors.text.muted}
                  value={homework}
                  onChangeText={setHomework}
                />
              </View>

              {/* Submit */}
              <View style={{ marginTop: spacing.xl }}>
                <Button
                  title={activeSession ? "End Lesson & Save" : "Save Lesson"}
                  onPress={handleSave}
                  disabled={!rating}
                />
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Student Modal */}
      <Modal
        visible={showAddStudentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Student</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter student name"
              placeholderTextColor={colors.text.muted}
              value={newStudentName}
              onChangeText={setNewStudentName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setNewStudentName('');
                  setShowAddStudentModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, !newStudentName.trim() && { opacity: 0.5 }]}
                onPress={confirmAddStudent}
                disabled={!newStudentName.trim()}
              >
                <Text style={styles.modalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Preview Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lesson Report</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <XIcon size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportScroll} showsVerticalScrollIndicator={false}>
              {isGeneratingReport ? (
                <View style={styles.reportLoading}>
                  <ActivityIndicator size="large" color={colors.accent.default} />
                  <Text style={styles.reportLoadingText}>Generating AI Report...</Text>
                </View>
              ) : (
                <View style={styles.reportContainer}>
                  <View style={styles.reportCard}>
                    <Text style={styles.reportHeader}>📚 Lesson Report</Text>
                    <View style={styles.reportDivider} />
                    <Text style={styles.reportContent}>{generatedReport}</Text>
                    <View style={styles.reportDivider} />
                    <Text style={styles.reportFooter}>Powered by Chalk</Text>
                  </View>

                  <View style={styles.reportLinkContainer}>
                    <Text style={styles.reportLinkLabel}>Share Link:</Text>
                    <Text style={styles.reportLink} numberOfLines={1}>{reportShareUrl}</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.default }, isGeneratingReport && { opacity: 0.5 }]}
                onPress={async () => {
                  if (generatedReport) {
                    const shareMessage = formatReportForShare(generatedReport, currentReportData?.student?.name || '', reportShareUrl);
                    // Use Share API as clipboard alternative
                    await Share.share({ message: shareMessage, title: 'Copy Report' });
                  }
                }}
                disabled={isGeneratingReport}
              >
                <Text style={styles.modalCancelText}>📋 Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, isGeneratingReport && { opacity: 0.5 }]}
                onPress={handleShareReport}
                disabled={isGeneratingReport}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.modalConfirmText}>Share Report</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Toast */}
      {showToast && (
        <View style={styles.toast}>
          <CheckCircleIcon size={20} color={colors.status.success} />
          <Text style={styles.toastText}>Saved!</Text>
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
    textTransform: 'uppercase',
  },
  // Topic Picker
  topicSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  topicText: {
    ...typography.body,
    color: colors.text.primary,
  },
  topicPlaceholder: {
    ...typography.body,
    color: colors.text.muted,
  },
  topicList: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  levelLabel: {
    ...typography.caption,
    color: colors.accent.default,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  topicItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  topicItemActive: {
    backgroundColor: colors.accent.default + '20',
  },
  topicItemText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  topicItemTextActive: {
    color: colors.accent.default,
    fontWeight: '600',
  },
  customTopicInput: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: spacing.sm,
    ...typography.body,
  },
  // Recommendations
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  recommendationTitle: {
    ...typography.small,
    color: colors.accent.default,
    fontWeight: '600',
  },
  recommendationList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  recTopic: {
    ...typography.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
  recReason: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Struggles
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
  // Photos
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 4,
  },
  // Notes
  notesInput: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    ...typography.body,
    borderColor: colors.border.default,
  },
  input: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...typography.body,
  },
  // AI Insights
  insightSummary: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  insightSection: {
    marginTop: spacing.md,
  },
  insightLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 4,
  },
  insightItem: {
    ...typography.small,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  insightEncouragement: {
    ...typography.caption,
    color: colors.accent.default,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  // Toast
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
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  modalInput: {
    ...typography.body,
    backgroundColor: colors.bg.base,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalCancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg.tertiary,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
  },
  modalConfirmText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  // Report Preview
  reportScroll: {
    maxHeight: 400,
  },
  reportLoading: {
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportLoadingText: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  reportContainer: {
    paddingVertical: spacing.md,
  },
  reportCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  reportHeader: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  reportDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  reportContent: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  reportFooter: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  reportLinkContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
  },
  reportLinkLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 4,
  },
  reportLink: {
    ...typography.small,
    color: colors.accent.default,
    textDecorationLine: 'underline',
  },
  // Sessions & Recordings
  recordingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  recordingOptionSelected: {
    borderColor: colors.accent.default,
    backgroundColor: colors.accent.default + '10',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTopic: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  recordingMeta: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.error,
  },
  autoDurationText: {
    ...typography.caption,
    color: colors.status.success,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  endSessionBtn: {
    backgroundColor: colors.status.error + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  endSessionText: {
    ...typography.small,
    color: colors.status.error,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyStateTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
