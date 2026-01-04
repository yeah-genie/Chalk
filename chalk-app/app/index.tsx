import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../constants/theme';
import { useStore } from '../lib/store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ===================================
// CHALK DASHBOARD - Web Design Match
// ===================================

function getScoreColor(score: number): string {
    if (score >= 80) return colors.status.success;
    if (score >= 60) return colors.accent.primary;
    if (score >= 40) return colors.status.warning;
    if (score >= 20) return colors.status.error;
    return colors.text.muted;
}

const Skeleton = ({ width, height, borderRadius = radius.md }: { width: any, height: number, borderRadius?: number }) => {
    const opacity = React.useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={{
                width,
                height,
                backgroundColor: colors.bg.card,
                borderRadius,
                opacity,
            }}
        />
    );
};

export default function Dashboard() {
    const {
        students,
        sessions,
        isLoading,
        fetchStudents,
        fetchSessions,
    } = useStore();

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchSessions();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchStudents(), fetchSessions()]);
        setRefreshing(false);
    }, []);

    // Stats - Calculate from real data
    const totalStudents = students?.length || 0;
    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
    const avgMastery = students?.length
        ? Math.round(students.reduce((sum, s) => sum + (s.mastery_score || 0), 0) / students.length)
        : 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <View style={styles.statusRow}>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>TRUST ENGINE ACTIVE</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={() => router.push('/students/add')}
                            testID="add-student-button-top"
                            accessibilityLabel="add-student-button-top"
                        >
                            <Ionicons name="add-outline" size={22} color={colors.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={() => router.push('/settings')}
                            testID="settings-button"
                            accessibilityLabel="settings-button"
                        >
                            <Ionicons name="settings-outline" size={20} color={colors.text.muted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* AI Scribe Button */}
                <TouchableOpacity
                    style={styles.scribeButton}
                    onPress={() => router.push('/recording')}
                    testID="start-ai-scribe-button"
                    accessibilityLabel="start-ai-scribe-button"
                >
                    <View style={styles.scribeIcon}>
                        <Ionicons name="mic" size={20} color="#000" />
                    </View>
                    <Text style={styles.scribeText}>START AI SCRIBE</Text>
                </TouchableOpacity>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard} testID="stat-card-students">
                        <Text style={styles.statLabel}>MANAGED MINDS</Text>
                        {isLoading ? <Skeleton width={40} height={28} /> : <Text style={styles.statValue}>{totalStudents}</Text>}
                    </View>
                    <View style={styles.statCard} testID="stat-card-sessions">
                        <Text style={styles.statLabel}>AI SCRIBED</Text>
                        {isLoading ? <Skeleton width={40} height={28} /> : <Text style={styles.statValue}>{completedSessions}</Text>}
                    </View>
                    <View style={styles.statCard} testID="stat-card-mastery">
                        <Text style={styles.statLabel}>GLOBAL MASTERY</Text>
                        {isLoading ? (
                            <Skeleton width={60} height={28} />
                        ) : (
                            <View>
                                <Text style={[styles.statValue, { color: getScoreColor(avgMastery) }]}>
                                    {avgMastery}%
                                </Text>
                                <Text style={styles.statSubValue}>Based on AI analysis</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Recent Students */}
                <Text style={styles.sectionLabel}>RECENT STUDENTS</Text>
                <View style={styles.card}>
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <View key={i} style={[styles.studentRow, i < 3 && styles.studentRowBorder]}>
                                <View style={styles.studentLeft}>
                                    <Skeleton width={40} height={40} borderRadius={20} />
                                    <View style={{ gap: 4 }}>
                                        <Skeleton width={100} height={16} />
                                        <Skeleton width={60} height={12} />
                                    </View>
                                </View>
                                <Skeleton width={40} height={24} borderRadius={4} />
                            </View>
                        ))
                    ) : (
                        students?.slice(0, 5).map((student, index) => (
                            <TouchableOpacity
                                key={student.id}
                                style={[
                                    styles.studentRow,
                                    index < (students.length - 1) && styles.studentRowBorder,
                                ]}
                                onPress={() => router.push(`/students/${student.id}`)}
                                testID={`student-row-${student.id}`}
                                accessibilityLabel={`student-row-${student.name}`}
                            >
                                <View style={styles.studentLeft}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{student.name[0]}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentMeta}>{student.subject}</Text>
                                    </View>
                                </View>
                                <View style={styles.masteryBadge}>
                                    <Text style={[styles.masteryText, { color: getScoreColor(student.mastery_score || 0) }]}>
                                        {student.mastery_score || 0}%
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    {(!students || students.length === 0) && (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="people-outline" size={48} color={colors.accent.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Start Your Teaching Journey</Text>
                            <Text style={styles.emptyText}>
                                Add your first student to begin building your Unfakeable Portfolio
                            </Text>
                            <TouchableOpacity
                                style={styles.addButtonLarge}
                                onPress={() => router.push('/students/add')}
                                testID="add-student-button"
                                accessibilityLabel="add-student-button"
                            >
                                <Ionicons name="add-circle" size={20} color="#000" />
                                <Text style={styles.addButtonText}>Add Your First Student</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* View All Students */}
                <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => router.push('/students')}
                    testID="view-all-students-button"
                    accessibilityLabel="view-all-students-button"
                >
                    <Text style={styles.viewAllText}>View All Students</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.accent.primary} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: colors.accent.muted,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent.primary,
        marginRight: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        color: colors.accent.primary,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    headerBtn: {
        padding: spacing.sm,
        backgroundColor: colors.bg.card,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },

    // AI Scribe Button
    scribeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent.primary,
        borderRadius: radius.xl,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    scribeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    scribeText: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#000',
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        color: colors.text.muted,
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text.primary,
    },
    statSubValue: {
        fontSize: 8,
        fontWeight: '600',
        color: colors.text.muted,
        marginTop: 2,
    },

    // Section
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        color: colors.text.muted,
        marginBottom: spacing.md,
    },

    // Card
    card: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        overflow: 'hidden',
    },

    // Student Row
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    studentRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    studentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.border.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
    },
    studentMeta: {
        fontSize: 13,
        color: colors.text.muted,
    },
    masteryBadge: {
        backgroundColor: colors.accent.muted,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    masteryText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Empty State
    emptyState: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyIcon: {
        marginBottom: spacing.lg,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.text.muted,
        marginBottom: spacing.xl,
        textAlign: 'center',
        lineHeight: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        gap: 4,
    },
    addButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        gap: spacing.sm,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },

    // View All
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        gap: spacing.xs,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.accent.primary,
    },
});
