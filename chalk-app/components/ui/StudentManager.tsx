import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useData, Student } from '@/lib/DataContext';
import { XIcon, DollarIcon, UsersIcon, CheckCircleIcon } from '@/components/Icons';

const STUDENT_COLORS = [
    '#00D4AA', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#3B82F6'
];

interface StudentManagerProps {
    visible: boolean;
    onClose: () => void;
}

export function StudentManager({ visible, onClose }: StudentManagerProps) {
    const { students, addStudent, updateStudent, removeStudent } = useData();
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [taxRate, setTaxRate] = useState('0');
    const [parentContact, setParentContact] = useState('');
    const [selectedColor, setSelectedColor] = useState(STUDENT_COLORS[0]);

    const resetForm = () => {
        setName('');
        setSubject('');
        setHourlyRate('');
        setTaxRate('0');
        setParentContact('');
        setSelectedColor(STUDENT_COLORS[0]);
        setEditingStudent(null);
        setShowAddForm(false);
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setName(student.name);
        setSubject(student.subject || '');
        setHourlyRate(student.hourlyRate?.toString() || '');
        setTaxRate(((student.taxRate || 0) * 100).toString());
        setParentContact(student.parentContact || '');
        setSelectedColor(student.color || STUDENT_COLORS[0]);
        setShowAddForm(true);
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter student name');
            return;
        }

        const studentData = {
            name: name.trim(),
            subject: subject.trim() || undefined,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
            taxRate: taxRate ? parseFloat(taxRate) / 100 : undefined,
            parentContact: parentContact.trim() || undefined,
            color: selectedColor,
        };

        if (editingStudent) {
            updateStudent(editingStudent.id, studentData);
        } else {
            addStudent(studentData);
        }

        resetForm();
    };

    const handleDelete = (student: Student) => {
        Alert.alert(
            'Delete Student',
            `Remove ${student.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeStudent(student.id) }
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Students</Text>
                        <TouchableOpacity onPress={onClose}>
                            <XIcon size={24} color={colors.text.muted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* Add/Edit Form */}
                        {showAddForm ? (
                            <Card style={styles.formCard}>
                                <Text style={styles.formTitle}>
                                    {editingStudent ? 'Edit Student' : 'Add Student'}
                                </Text>

                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Student name"
                                    placeholderTextColor={colors.text.muted}
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Text style={styles.label}>Subject</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Math, English, Science..."
                                    placeholderTextColor={colors.text.muted}
                                    value={subject}
                                    onChangeText={setSubject}
                                />

                                <Text style={styles.label}>Hourly Rate ($)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="40"
                                    placeholderTextColor={colors.text.muted}
                                    value={hourlyRate}
                                    onChangeText={setHourlyRate}
                                    keyboardType="numeric"
                                />

                                <Text style={styles.label}>Tax Rate (%)</Text>
                                <View style={styles.taxRow}>
                                    {['0', '3.3', '8.8'].map(rate => (
                                        <TouchableOpacity
                                            key={rate}
                                            style={[styles.taxChip, taxRate === rate && styles.taxChipActive]}
                                            onPress={() => setTaxRate(rate)}
                                        >
                                            <Text style={[styles.taxChipText, taxRate === rate && styles.taxChipTextActive]}>
                                                {rate}%
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Parent Contact</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone or email"
                                    placeholderTextColor={colors.text.muted}
                                    value={parentContact}
                                    onChangeText={setParentContact}
                                />

                                <Text style={styles.label}>Color</Text>
                                <View style={styles.colorRow}>
                                    {STUDENT_COLORS.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotActive]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            {selectedColor === color && <CheckCircleIcon size={12} color="#fff" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.formActions}>
                                    <Button title="Cancel" variant="ghost" onPress={resetForm} style={{ flex: 1 }} />
                                    <Button title={editingStudent ? 'Save' : 'Add'} onPress={handleSave} style={{ flex: 1 }} />
                                </View>
                            </Card>
                        ) : (
                            <Button
                                title="Add Student"
                                variant="secondary"
                                onPress={() => setShowAddForm(true)}
                                style={{ marginBottom: spacing.lg }}
                            />
                        )}

                        {/* Student List */}
                        {students.map(student => (
                            <Card key={student.id} style={styles.studentCard}>
                                <TouchableOpacity onPress={() => handleEdit(student)} onLongPress={() => handleDelete(student)}>
                                    <View style={styles.studentRow}>
                                        <View style={[styles.avatar, { backgroundColor: student.color || colors.accent.default }]}>
                                            <Text style={styles.avatarText}>{student.name[0]}</Text>
                                        </View>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>{student.name}</Text>
                                            <Text style={styles.studentMeta}>
                                                {student.subject || 'General'}
                                                {student.hourlyRate && ` · $${student.hourlyRate}/hr`}
                                                {student.taxRate && ` · ${(student.taxRate * 100).toFixed(1)}% tax`}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Card>
                        ))}

                        {students.length === 0 && !showAddForm && (
                            <View style={styles.empty}>
                                <UsersIcon size={48} color={colors.bg.tertiary} />
                                <Text style={styles.emptyText}>No students yet</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.bg.base,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    title: {
        ...typography.h2,
        color: colors.text.primary,
    },
    body: {
        padding: spacing.lg,
    },
    // Form
    formCard: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
    },
    formTitle: {
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.caption,
        color: colors.text.muted,
        marginBottom: spacing.xs,
        marginTop: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        ...typography.body,
        backgroundColor: colors.bg.secondary,
        borderRadius: radius.md,
        padding: spacing.md,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    taxRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    taxChip: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: radius.md,
        backgroundColor: colors.bg.secondary,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    taxChipActive: {
        backgroundColor: colors.accent.default + '20',
        borderColor: colors.accent.default,
    },
    taxChipText: {
        ...typography.small,
        color: colors.text.secondary,
    },
    taxChipTextActive: {
        color: colors.accent.default,
        fontWeight: '600',
    },
    colorRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorDotActive: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    formActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    // Student Card
    studentCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    studentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        ...typography.body,
        color: colors.text.primary,
        fontWeight: '600',
    },
    studentMeta: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: 2,
    },
    // Empty
    empty: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    emptyText: {
        ...typography.body,
        color: colors.text.muted,
        marginTop: spacing.md,
    },
});
