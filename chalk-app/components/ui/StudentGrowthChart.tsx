import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/Colors';
import { Card } from './Card';

interface GrowthDataPoint {
    date: string;
    rating: 'good' | 'okay' | 'struggled';
}

interface StudentGrowthChartProps {
    data: GrowthDataPoint[];
    studentName: string;
}

const ratingToValue = (rating: string): number => {
    switch (rating) {
        case 'good': return 3;
        case 'okay': return 2;
        case 'struggled': return 1;
        default: return 2;
    }
};

const ratingToColor = (rating: string): string => {
    switch (rating) {
        case 'good': return colors.status.success;
        case 'okay': return colors.status.warning;
        case 'struggled': return colors.status.error;
        default: return colors.text.muted;
    }
};

export function StudentGrowthChart({ data, studentName }: StudentGrowthChartProps) {
    // Take last 10 lessons
    const recentData = data.slice(-10);

    if (recentData.length === 0) {
        return (
            <Card style={styles.card}>
                <Text style={styles.title}>{studentName}'s Growth</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No lesson records yet</Text>
                </View>
            </Card>
        );
    }

    // Calculate stats
    const avgRating = recentData.reduce((sum, d) => sum + ratingToValue(d.rating), 0) / recentData.length;
    const goodCount = recentData.filter(d => d.rating === 'good').length;
    const trend = recentData.length >= 2
        ? ratingToValue(recentData[recentData.length - 1].rating) - ratingToValue(recentData[0].rating)
        : 0;

    return (
        <Card style={styles.card}>
            <Text style={styles.title}>{studentName}'s Growth</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{recentData.length}</Text>
                    <Text style={styles.statLabel}>Lessons</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(goodCount / recentData.length * 100)}%</Text>
                    <Text style={styles.statLabel}>Understanding</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: trend > 0 ? colors.status.success : trend < 0 ? colors.status.error : colors.text.primary }]}>
                        {trend > 0 ? '↑ Up' : trend < 0 ? '↓ Down' : '→ Stable'}
                    </Text>
                    <Text style={styles.statLabel}>Trend</Text>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <View style={styles.chartYAxis}>
                    <Text style={styles.yLabel}>Good</Text>
                    <Text style={styles.yLabel}>Okay</Text>
                    <Text style={styles.yLabel}>Struggled</Text>
                </View>
                <View style={styles.chartBars}>
                    {recentData.map((point, index) => (
                        <View key={index} style={styles.barWrapper}>
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: `${(ratingToValue(point.rating) / 3) * 100}%`,
                                            backgroundColor: ratingToColor(point.rating),
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.barDate}>
                                {new Date(point.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    emptyState: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.text.muted,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        ...typography.h2,
        color: colors.text.primary,
    },
    statLabel: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: 2,
    },
    chartContainer: {
        flexDirection: 'row',
        height: 120,
    },
    chartYAxis: {
        width: 50,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    yLabel: {
        fontSize: 9,
        color: colors.text.muted,
    },
    chartBars: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        gap: 4,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    barBackground: {
        width: '80%',
        height: 80,
        backgroundColor: colors.bg.tertiary,
        borderRadius: radius.sm,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: radius.sm,
    },
    barDate: {
        fontSize: 8,
        color: colors.text.muted,
        marginTop: 4,
        textAlign: 'center',
    },
});
