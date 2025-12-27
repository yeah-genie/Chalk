import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/Colors';
import { Card } from './Card';
import { Button } from './Button';
import { SparklesIcon, ShareIcon } from '@/components/Icons';
import { generateParentReport } from '@/services/geminiService';

interface LessonLogSummary {
    topic: string;
    rating: string;
    date: string;
    notes?: string;
}

interface ParentReportCardProps {
    studentName: string;
    studentId: string;
    logs: LessonLogSummary[];
}

export function ParentReportCard({ studentName, studentId, logs }: ParentReportCardProps) {
    const [report, setReport] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const recentLogs = logs.slice(0, 5);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const generatedReport = await generateParentReport(studentName, recentLogs);
            setReport(generatedReport);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate report.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!report) return;

        const fullReport = `
📚 ${studentName} Learning Report

${report}

---
Recent Lessons:
${recentLogs.map(l => `• ${l.date}: ${l.topic} (${l.rating === 'good' ? '✅ Good' : l.rating === 'okay' ? '⚠️ Okay' : '❌ Struggled'})`).join('\n')}

Chalk - Portfolio App for Tutors
    `.trim();

        try {
            await Share.share({
                message: fullReport,
                title: `${studentName} Learning Report`,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share.');
        }
    };

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Parent Report</Text>
                <Text style={styles.subtitle}>{studentName}</Text>
            </View>

            {logs.length === 0 ? (
                <Text style={styles.emptyText}>No lesson records.</Text>
            ) : (
                <>
                    {/* Recent Lessons Summary */}
                    <View style={styles.lessonsSection}>
                        <Text style={styles.sectionLabel}>Recent Lessons</Text>
                        {recentLogs.map((log, i) => (
                            <View key={i} style={styles.lessonRow}>
                                <View style={[styles.ratingDot, {
                                    backgroundColor: log.rating === 'good' ? colors.status.success :
                                        log.rating === 'okay' ? colors.status.warning : colors.status.error
                                }]} />
                                <Text style={styles.lessonTopic}>{log.topic}</Text>
                                <Text style={styles.lessonDate}>{log.date}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Generate Report */}
                    {!report ? (
                        <Button
                            title="Generate AI Report"
                            variant="secondary"
                            size="sm"
                            loading={isGenerating}
                            onPress={handleGenerate}
                            icon={<SparklesIcon size={16} color={colors.accent.default} />}
                            style={{ marginTop: spacing.md }}
                        />
                    ) : (
                        <View style={styles.reportSection}>
                            <View style={styles.reportHeader}>
                                <SparklesIcon size={14} color={colors.accent.default} />
                                <Text style={styles.reportLabel}>AI Generated Report</Text>
                            </View>
                            <Text style={styles.reportText}>{report}</Text>

                            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                                <ShareIcon size={16} color={colors.accent.default} />
                                <Text style={styles.shareText}>Share with Parent</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.md,
    },
    title: {
        ...typography.h3,
        color: colors.text.primary,
    },
    subtitle: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: 2,
    },
    emptyText: {
        ...typography.body,
        color: colors.text.muted,
        textAlign: 'center',
        paddingVertical: spacing.lg,
    },
    lessonsSection: {
        marginBottom: spacing.md,
    },
    sectionLabel: {
        ...typography.caption,
        color: colors.text.muted,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: 8,
    },
    ratingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    lessonTopic: {
        ...typography.small,
        color: colors.text.primary,
        flex: 1,
    },
    lessonDate: {
        ...typography.caption,
        color: colors.text.muted,
    },
    reportSection: {
        marginTop: spacing.md,
        backgroundColor: colors.bg.tertiary,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
    },
    reportLabel: {
        ...typography.caption,
        color: colors.accent.default,
        fontWeight: '600',
    },
    reportText: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    shareText: {
        ...typography.small,
        color: colors.accent.default,
        fontWeight: '600',
    },
});
