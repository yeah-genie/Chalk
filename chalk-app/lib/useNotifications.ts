import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [permission, setPermission] = useState<boolean>(false);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        // Check if we already have permission
        checkPermission();

        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('[Notifications] Received:', notification);
        });

        // Listen for user interaction with notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[Notifications] Response:', response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const checkPermission = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        setPermission(status === 'granted');
    };

    const requestPermission = async (): Promise<boolean> => {
        if (!Device.isDevice) {
            console.log('[Notifications] Must use physical device for push notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('[Notifications] Permission not granted');
            setPermission(false);
            return false;
        }

        setPermission(true);

        // Set notification channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#00D4AA',
            });
        }

        return true;
    };

    // Schedule a local notification for lesson recording reminder
    const scheduleLessonRecordReminder = async (delaySeconds: number = 5) => {
        if (!permission) {
            const granted = await requestPermission();
            if (!granted) return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📝 Log Your Lesson',
                body: 'Your Zoom meeting has ended. Record your lesson notes!',
                data: { screen: 'index', action: 'record_lesson' },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: delaySeconds,
            },
        });
        console.log('[Notifications] Scheduled lesson reminder');
    };

    // Schedule notification for upcoming lesson
    const scheduleUpcomingLessonReminder = async (
        studentName: string,
        subject: string,
        minutesBefore: number = 15
    ) => {
        if (!permission) {
            const granted = await requestPermission();
            if (!granted) return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📅 Lesson Reminder',
                body: `${subject} lesson with ${studentName} in ${minutesBefore} minutes.`,
                data: { screen: 'schedule', action: 'view_lesson' },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: minutesBefore * 60,
            },
        });
        console.log('[Notifications] Scheduled upcoming lesson reminder');
    };

    // Cancel all pending notifications
    const cancelAllNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('[Notifications] Cancelled all notifications');
    };

    return {
        permission,
        expoPushToken,
        requestPermission,
        scheduleLessonRecordReminder,
        scheduleUpcomingLessonReminder,
        cancelAllNotifications,
    };
}
