import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

// Mock Icon for Microphone (using simple circle/shapes if icon not available, or assume VideoIcon style)
// We'll use a simple visual representation for now or import an icon if available.
import { Svg, Circle, Path, Rect } from 'react-native-svg';

function MicIcon({ size = 24, color = colors.text.primary, active = false }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="9" y="3" width="6" height="12" rx="3" fill={active ? colors.status.error : "none"} stroke={active ? colors.status.error : color} strokeWidth="2" />
            <Path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke={active ? colors.status.error : color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M12 18V22M8 22H16" stroke={active ? colors.status.error : color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
    );
}

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
}

export function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleToggleRecord = () => {
        if (isRecording) {
            // Stop recording logic
            setIsRecording(false);
            setIsProcessing(true);

            // Simulate processing
            setTimeout(() => {
                setIsProcessing(false);
                onTranscription("Student showed good understanding of quadratic formulas but struggled with factoring large numbers. Assigned pg. 42 #1-10 for homework.");
            }, 1500);
        } else {
            // Start recording
            setIsRecording(true);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>VOICE MEMO</Text>
                {isRecording && (
                    <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>{formatTime(duration)}</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonActive,
                    isProcessing && styles.recordButtonProcessing
                ]}
                onPress={handleToggleRecord}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <Text style={styles.processingText}>Transcribing...</Text>
                ) : (
                    <View style={styles.buttonContent}>
                        <MicIcon size={24} color={isRecording ? colors.status.error : colors.accent.default} active={isRecording} />
                        <Text style={[
                            styles.buttonText,
                            isRecording ? { color: colors.status.error } : { color: colors.accent.default }
                        ]}>
                            {isRecording ? "Stop Recording" : "Tap to Record Summary"}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    label: {
        ...typography.caption,
        color: colors.text.muted,
        letterSpacing: 1,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.status.error,
    },
    recordingText: {
        ...typography.caption,
        color: colors.status.error,
        fontVariant: ['tabular-nums'],
    },
    recordButton: {
        backgroundColor: colors.bg.secondary,
        paddingVertical: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
    },
    recordButtonActive: {
        borderColor: colors.status.error,
        backgroundColor: `${colors.status.error}10`,
        borderStyle: 'solid',
    },
    recordButtonProcessing: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        ...typography.small,
        fontWeight: '600',
    },
    processingText: {
        ...typography.small,
        color: colors.text.secondary,
    },
});
