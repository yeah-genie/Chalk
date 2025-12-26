import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import Colors, { spacing, typography, radius, shadows } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Avatar } from './Avatar';
import { ChevronDownIcon, SearchIcon, CheckCircleIcon, XIcon } from '@/components/Icons';
import { Student, GRADE_NAMES } from '@/data/types';

interface StudentPickerProps {
  students: Student[];
  selectedId: string | null;
  onSelect: (studentId: string) => void;
  placeholder?: string;
}

export function StudentPicker({
  students,
  selectedId,
  onSelect,
  placeholder = '학생을 선택하세요',
}: StudentPickerProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStudent = students.find(s => s.id === selectedId);
  
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (studentId: string) => {
    onSelect(studentId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Trigger Button */}
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.backgroundTertiary,
            borderColor: selectedId ? colors.tint : colors.border,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
        onPress={() => setIsOpen(true)}
        accessibilityLabel={selectedStudent ? `${selectedStudent.name} 선택됨` : placeholder}
        accessibilityRole="button"
      >
        {selectedStudent ? (
          <View style={styles.selectedContent}>
            <Avatar
              name={selectedStudent.name}
              size="sm"
              variant="gradient"
              color="mint"
            />
            <View style={styles.selectedInfo}>
              <Text style={[styles.selectedName, { color: colors.text }]}>
                {selectedStudent.name}
              </Text>
              <Text style={[styles.selectedMeta, { color: colors.textMuted }]}>
                {GRADE_NAMES[selectedStudent.grade]} · {selectedStudent.subject}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: colors.textMuted }]}>
            {placeholder}
          </Text>
        )}
        <ChevronDownIcon size={20} color={colors.textMuted} />
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
        >
          <Animated.View
            entering={SlideInDown.springify()}
            style={[
              styles.modal,
              { backgroundColor: colors.backgroundElevated },
              shadows.lg,
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                학생 선택
              </Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <XIcon size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Search */}
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              <SearchIcon size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="이름으로 검색"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>

            {/* Student List */}
            <ScrollView 
              style={styles.list}
              showsVerticalScrollIndicator={false}
            >
              {filteredStudents.length === 0 ? (
                <View style={styles.emptySearch}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    검색 결과가 없습니다
                  </Text>
                </View>
              ) : (
                filteredStudents.map((student, idx) => (
                  <Pressable
                    key={student.id}
                    style={({ pressed }) => [
                      styles.studentItem,
                      {
                        backgroundColor: selectedId === student.id
                          ? colors.tint + '15'
                          : pressed
                          ? colors.backgroundHover
                          : 'transparent',
                        borderColor: selectedId === student.id
                          ? colors.tint
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelect(student.id)}
                    accessibilityLabel={`${student.name} 학생`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedId === student.id }}
                  >
                    <Avatar
                      name={student.name}
                      size="md"
                      variant={selectedId === student.id ? 'gradient' : 'ring'}
                      color="mint"
                    />
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: colors.text }]}>
                        {student.name}
                      </Text>
                      <Text style={[styles.studentMeta, { color: colors.textMuted }]}>
                        {GRADE_NAMES[student.grade]} · {student.subject} · {student.lessonsCount}회
                      </Text>
                    </View>
                    {selectedId === student.id && (
                      <CheckCircleIcon size={20} color={colors.tint} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  selectedName: {
    ...typography.bodyMedium,
  },
  selectedMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  placeholder: {
    ...typography.body,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '70%',
    paddingBottom: spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
  },
  studentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  studentName: {
    ...typography.bodyMedium,
  },
  studentMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  emptySearch: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
  },
});

