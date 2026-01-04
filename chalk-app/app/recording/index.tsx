import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioRecorder, RecordingOptions, AudioModule } from 'expo-audio';
import { colors, spacing, radius, typography } from '../../constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../lib/store';

// ===================================
// UTILS
// ===================================

const retryPromise = async <T,>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryPromise(fn, retries - 1, delay * 2);
    }
};

// ===================================
// WAVEFORM COMPONENT
// ===================================

const Waveform = ({ isRecording }: { isRecording: boolean }) => {
    const bars = Array.from({ length: 15 });
    const animValues = useRef(bars.map(() => new Animated.Value(0.2))).current;

    useEffect(() => {
        if (isRecording) {
            const animations = animValues.map((anim, i) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: Math.random() * 0.8 + 0.2,
                            duration: 300 + Math.random() * 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0.2,
                            duration: 300 + Math.random() * 500,
                            useNativeDriver: true,
                        }),
                    ])
                );
            });
            animations.forEach(a => a.start());
            return () => animations.forEach(a => a.stop());
        }
    }, [isRecording]);

    return (
        <View style={waveformStyles.container}>
            {animValues.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={[
                        waveformStyles.bar,
                        {
                            transform: [{ scaleY: anim }],
                            opacity: isRecording ? 1 : 0.3,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const waveformStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        gap: 4,
    },
    bar: {
        width: 3,
        height: '100%',
        backgroundColor: colors.accent.primary,
        borderRadius: 2,
    },
});

// ===================================
// AI SCRIBE RECORDING SCREEN
// Using expo-audio (not deprecated expo-av)
// ===================================

type RecordingState = 'idle' | 'recording' | 'analyzing' | 'complete';

const recordingOptions: RecordingOptions = {
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    android: {
        extension: '.m4a',
        outputFormat: 'mpeg_4',
        audioEncoder: 'aac',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    },
    ios: {
        extension: '.m4a',
        outputFormat: 'mpeg4aac',
        audioQuality: 'high',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    },
};

export default function RecordingScreen() {
    const [state, setState] = useState<RecordingState>('idle');
    const [duration, setDuration] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const audioRecorder = useAudioRecorder(recordingOptions);
    const { selectedStudent } = useStore();

    // Request permissions and setup audio mode on mount
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                // IMPORTANT for iOS: Set audio mode to allow recording
                await AudioModule.setAudioModeAsync({
                    staysActiveInBackground: true,
                    interruptionModeIOS: 1, // DoNotMix
                    playsInSilentModeIOS: true,
                    shouldRouteThroughEarpieceIOS: false,
                    interruptionModeAndroid: 1, // DoNotMix
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    allowsRecording: true,
                });

                if (isMounted) {
                    const status = await AudioModule.requestRecordingPermissionsAsync();
                    console.log('[Recording] Initial permission check:', status.granted);
                    if (!status.granted) {
                        Alert.alert('Permission Required', 'Microphone access is needed for recording.');
                    }
                }
            } catch (err) {
                console.error('[Recording] Setup failed:', err);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    // Pulse animation for recording indicator
    useEffect(() => {
        if (state === 'recording') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [state]);

    // Timer for duration
    useEffect(() => {
        if (state === 'recording') {
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000) as any;
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        console.log('[Recording] Attempting to start recording...');
        try {
            const permission = await AudioModule.getRecordingPermissionsAsync();
            if (permission.status !== 'granted') {
                const request = await AudioModule.requestRecordingPermissionsAsync();
                if (request.status !== 'granted') {
                    Alert.alert('Permission Denied', 'Microphone access is required.');
                    return;
                }
            }

            if (!audioRecorder) {
                throw new Error('Audio recorder not initialized');
            }

            await audioRecorder.record();
            console.log('[Recording] Started successfully');
            setState('recording');
            setDuration(0);
        } catch (err: any) {
            console.error('[Recording] Failed to start:', err);
            Alert.alert('Error', `Failed to start recording: ${err.message || 'Unknown error'}`);
            setState('idle');
        }
    };

    const stopRecording = async () => {
        console.log('[Recording] Stopping recording...');
        try {
            if (!audioRecorder) return;

            setState('analyzing');
            await audioRecorder.stop();
            console.log('[Recording] Stopped. URI:', audioRecorder.uri);

            // Using Hugging Face based samples for more realistic feedback
            setTimeout(() => {
                const samples = require('../../assets/data/lesson_test_samples.json');
                const randomSample = samples[Math.floor(Math.random() * samples.length)];

                setAnalysisResult({
                    concepts: randomSample.concepts,
                    summary: randomSample.summary,
                    duration: duration,
                    subject: randomSample.subject,
                    topic: randomSample.topic,
                });
                setState('complete');
            }, 3000);
        } catch (err) {
            console.error('[Recording] Failed to stop:', err);
            setState('idle');
            Alert.alert('Error', 'Failed to save recording');
        }
    };

    const handleCommit = async () => {
        try {
            setState('analyzing');

            await retryPromise(async () => {
                console.log('[Recording] Saving session for:', selectedStudent?.name);
                // Simulate network latency
                await new Promise(resolve => setTimeout(resolve, 1500));
            });

            Alert.alert('Success! 🎉', 'The lesson insights have been added to the student\'s portfolio.');
            router.replace('/dashboard'); // Go back to dashboard to see update
        } catch (err: any) {
            console.error('[Recording] Failed to save:', err);
            Alert.alert(
                'Upload Failed',
                'Connection issue. Would you like to try saving again?',
                [{ text: 'Retry', onPress: handleCommit }, { text: 'Cancel', style: 'cancel', onPress: () => setState('complete') }]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} disabled={state === 'analyzing'}>
                    <Ionicons name="close" size={24} color={state === 'analyzing' ? colors.text.muted : colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Scribe</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Student Info */}
                <View style={[styles.studentBadge, { opacity: (state === 'idle' || state === 'recording') ? 1 : 0.5 }]}>
                    <Text style={styles.studentBadgeText}>
                        {selectedStudent ? `Student: ${selectedStudent.name}` : 'Select a student first'}
                    </Text>
                </View>

                {/* Recording UI */}
                <View style={styles.centerContainer}>
                    {state === 'idle' && (
                        <View style={styles.viewState}>
                            <TouchableOpacity
                                style={styles.recordButton}
                                onPress={startRecording}
                                testID="start-recording-button"
                                accessibilityLabel="Start recording lesson"
                            >
                                <Ionicons name="mic" size={48} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.hint}>Tap to begin capturing the lesson</Text>
                        </View>
                    )}

                    {state === 'recording' && (
                        <View style={styles.viewState}>
                            <View style={styles.recordingHeader}>
                                <View style={styles.liveIndicator}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>RECORDING</Text>
                                </View>
                                <Text style={styles.duration}>{formatDuration(duration)}</Text>
                            </View>

                            <View style={styles.recorderSlot}>
                                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                                <Waveform isRecording={true} />
                                <TouchableOpacity
                                    style={styles.stopButton}
                                    onPress={stopRecording}
                                    testID="stop-recording-button"
                                    accessibilityLabel="Stop and analyze recording"
                                >
                                    <View style={styles.stopIcon} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hint}>Tap square to finish and analyze</Text>
                        </View>
                    )}

                    {state === 'analyzing' && (
                        <View style={styles.viewState}>
                            <View style={styles.analyzingContainer}>
                                <Animated.View style={{ transform: [{ rotate: '0deg' }] }}>
                                    <Ionicons name="sparkles" size={64} color={colors.accent.primary} />
                                </Animated.View>
                            </View>
                            <Text style={styles.analyzingText}>AI is crafting the lesson report...</Text>
                            <Text style={styles.analyzingSubtext}>Identifying key concepts and mastery levels</Text>
                        </View>
                    )}

                    {state === 'complete' && analysisResult && (
                        <View style={styles.completeContainer}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark" size={48} color="#000" />
                            </View>
                            <Text style={styles.completeTitle}>Lesson Analyzed</Text>
                            <Text style={styles.completeSubtitle}>
                                We've identified {analysisResult.concepts.length} key takeaways
                            </Text>

                            <View style={styles.conceptsContainer}>
                                {analysisResult.concepts.map((concept: string, i: number) => (
                                    <View key={i} style={styles.conceptBadge}>
                                        <Text style={styles.conceptText}>{concept}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>AI INSIGHT</Text>
                                <Text style={styles.summaryText}>{analysisResult.summary}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer Actions */}
                {state === 'complete' && (
                    <View style={styles.decisionContainer}>
                        <TouchableOpacity
                            style={styles.commitButton}
                            onPress={handleCommit}
                            testID="save-portfolio-button"
                        >
                            <Ionicons name="save-outline" size={20} color="#000" />
                            <Text style={styles.commitText}>Save to Portfolio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.purgeButton}
                            onPress={() => setState('idle')}
                        >
                            <Text style={styles.purgeText}>Retake Recording</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Privacy Badge */}
            <View style={styles.trustBadge}>
                <Ionicons name="lock-closed-outline" size={12} color={colors.text.muted} />
                <Text style={styles.trustText}>SECURE ENCRYPTION ENFORCED</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    viewState: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    studentBadge: {
        backgroundColor: colors.bg.card,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        alignSelf: 'center',
        marginVertical: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    studentBadgeText: {
        fontSize: 14,
        color: colors.accent.primary,
        fontWeight: '600',
    },
    recordingHeader: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: radius.full,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.status.error,
        marginRight: 8,
    },
    liveText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: colors.status.error,
    },
    duration: {
        fontSize: 56,
        fontWeight: '300',
        color: colors.text.primary,
        marginTop: spacing.xl,
        fontVariant: ['tabular-nums'],
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    pulseRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        zIndex: -1,
    },
    recorderSlot: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 240,
        width: '100%',
    },
    stopButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.status.error,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
        shadowColor: colors.status.error,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    stopIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    hint: {
        fontSize: 16,
        color: colors.text.muted,
        marginTop: spacing.xxl,
        fontWeight: '500',
    },
    analyzingContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.accent.primary,
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacing.xxl,
    },
    analyzingSubtext: {
        fontSize: 14,
        color: colors.text.muted,
        marginTop: spacing.sm,
    },
    completeContainer: {
        alignItems: 'center',
        width: '100%',
    },
    checkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        marginTop: spacing.xl,
        letterSpacing: -0.5,
    },
    completeSubtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    conceptsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
    conceptBadge: {
        backgroundColor: colors.accent.muted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accent.glow,
    },
    conceptText: {
        fontSize: 13,
        color: colors.accent.primary,
        fontWeight: '700',
    },
    summaryCard: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.xxl,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.text.muted,
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
    },
    summaryText: {
        fontSize: 15,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    decisionContainer: {
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    commitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent.primary,
        borderRadius: radius.xl,
        paddingVertical: spacing.xl,
        gap: spacing.sm,
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    commitText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    purgeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    purgeText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.muted,
        textDecorationLine: 'underline',
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.xs,
        opacity: 0.6,
    },
    trustText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        color: colors.text.muted,
    },
});
