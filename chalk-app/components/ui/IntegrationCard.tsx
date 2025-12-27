import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageSourcePropType,
    ActivityIndicator,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '@/constants/Colors';
import { Card } from './Card';
import { Button } from './Button';
import { CheckCircleIcon, RefreshIcon, AlertCircleIcon } from '@/components/Icons';

export type IntegrationStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'success';

interface IntegrationCardProps {
    name: string;
    description: string;
    logo: ImageSourcePropType;
    status: IntegrationStatus;
    connectedInfo?: string;
    errorMessage?: string;
    onConnect: () => void;
    onDisconnect: () => void;
    onRetry?: () => void;
}

export function IntegrationCard({
    name,
    description,
    logo,
    status,
    connectedInfo,
    errorMessage,
    onConnect,
    onDisconnect,
    onRetry,
}: IntegrationCardProps) {
    // Success animation
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (status === 'success') {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [status]);

    // Get short error message for display
    const getShortError = (msg?: string) => {
        if (!msg) return 'Connection failed';
        // If error is JSON, try to parse it
        if (msg.startsWith('{')) {
            try {
                const parsed = JSON.parse(msg);
                if (parsed.error?.message) {
                    const fullMsg = parsed.error.message;
                    // Truncate long messages
                    return fullMsg.length > 30 ? fullMsg.substring(0, 30) + '...' : fullMsg;
                }
            } catch {
                // ignore
            }
        }
        return msg.length > 30 ? msg.substring(0, 30) + '...' : msg;
    };

    const renderDescription = () => {
        if (status === 'connected' && connectedInfo) {
            return connectedInfo;
        }
        return description;
    };

    // Render for error state - different layout
    if (status === 'error') {
        return (
            <Card style={styles.card}>
                <View style={styles.errorLayout}>
                    {/* Top row: Logo, Name, Retry button */}
                    <View style={styles.errorTopRow}>
                        <Image source={logo} style={styles.logo} />
                        <View style={styles.errorInfo}>
                            <Text style={styles.name}>{name}</Text>
                            <View style={styles.errorBadge}>
                                <AlertCircleIcon size={12} color={colors.status.error} />
                                <Text style={styles.errorBadgeText}>Failed</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={onRetry || onConnect}
                            activeOpacity={0.7}
                        >
                            <RefreshIcon size={14} color={colors.accent.default} />
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Error message row */}
                    {errorMessage && (
                        <View style={styles.errorMessageRow}>
                            <Text style={styles.errorMessageText} numberOfLines={2}>
                                {getShortError(errorMessage)}
                            </Text>
                        </View>
                    )}
                </View>
            </Card>
        );
    }

    return (
        <Card style={styles.card}>
            <View style={styles.row}>
                {/* Logo & Info */}
                <View style={styles.leftContent}>
                    <Image source={logo} style={styles.logo} />
                    <View style={styles.info}>
                        <Text style={styles.name}>{name}</Text>
                        <Text
                            style={[
                                styles.description,
                                status === 'connected' && styles.descriptionConnected,
                            ]}
                            numberOfLines={1}
                        >
                            {status === 'connected' && '✓ '}{renderDescription()}
                        </Text>
                    </View>
                </View>

                {/* Action Button / Status */}
                <View style={styles.rightContent}>
                    {status === 'connecting' && (
                        <View style={styles.statusContainer}>
                            <ActivityIndicator size="small" color={colors.accent.default} />
                            <Text style={styles.statusText}>Connecting...</Text>
                        </View>
                    )}

                    {status === 'success' && (
                        <Animated.View
                            style={[
                                styles.successContainer,
                                {
                                    transform: [{ scale: scaleAnim }],
                                    opacity: opacityAnim,
                                },
                            ]}
                        >
                            <CheckCircleIcon size={18} color={colors.status.success} />
                            <Text style={styles.successText}>Done!</Text>
                        </Animated.View>
                    )}

                    {status === 'connected' && (
                        <View style={styles.connectedContainer}>
                            <View style={styles.connectedBadge}>
                                <CheckCircleIcon size={12} color={colors.status.success} />
                                <Text style={styles.connectedBadgeText}>Connected</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={onDisconnect}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.disconnectText}>Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {status === 'idle' && (
                        <TouchableOpacity
                            style={styles.connectButton}
                            onPress={onConnect}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.connectText}>Connect</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 14,
        color: colors.text.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    description: {
        fontSize: 11,
        color: colors.text.secondary,
    },
    descriptionConnected: {
        color: colors.status.success,
    },
    rightContent: {
        alignItems: 'flex-end',
        flexShrink: 0,
    },
    // Idle state - Connect button
    connectButton: {
        backgroundColor: colors.bg.tertiary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: radius.md,
    },
    connectText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.primary,
    },
    // Connecting state
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 12,
        color: colors.accent.default,
    },
    // Success state
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.status.success + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: radius.full,
    },
    successText: {
        fontSize: 12,
        color: colors.status.success,
        fontWeight: '600',
    },
    // Connected state
    connectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    connectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.status.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.full,
    },
    connectedBadgeText: {
        fontSize: 10,
        color: colors.status.success,
        fontWeight: '600',
    },
    disconnectButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    disconnectText: {
        fontSize: 11,
        color: colors.text.muted,
    },
    // Error state - special layout
    errorLayout: {
        gap: 10,
    },
    errorTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    errorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    errorBadgeText: {
        fontSize: 11,
        color: colors.status.error,
    },
    errorMessageRow: {
        backgroundColor: colors.status.error + '10',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.md,
        marginLeft: 52, // align with text after logo
    },
    errorMessageText: {
        fontSize: 11,
        color: colors.status.error,
        lineHeight: 16,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.accent.muted,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: radius.md,
    },
    retryText: {
        fontSize: 12,
        color: colors.accent.default,
        fontWeight: '600',
    },
});
