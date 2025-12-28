import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

const TOKEN_KEY = 'zoom_access_token';
const USER_KEY = 'zoom_user';

// Supabase Edge Function URL for Zoom OAuth (from environment)
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ZOOM_AUTH_URL = `${SUPABASE_URL}/functions/v1/zoom-auth`;


export interface ZoomUser {
    id: string;
    name: string;
    email: string;
    pic_url?: string;
}

export interface ZoomRecording {
    id: string;
    topic: string;
    start_time: string;
    duration: number; // in minutes
    recording_files?: Array<{
        id: string;
        file_type: string;
        play_url?: string;
        download_url?: string;
    }>;
}

export function useZoomAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<ZoomUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [recordings, setRecordings] = useState<ZoomRecording[]>([]);
    const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);

    // Load stored data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
                const storedUser = await SecureStore.getItemAsync(USER_KEY);
                if (storedToken && storedUser) {
                    setAccessToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                    console.log('[Zoom] Loaded stored credentials');
                }
            } catch (error) {
                console.error('[Zoom] Failed to load data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Check for initial URL (app opened via deep link)
    useEffect(() => {
        const checkInitialUrl = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl && initialUrl.includes('zoom-callback')) {
                    console.log('[Zoom] Initial URL detected:', initialUrl);
                    await handleCallback(initialUrl);
                }
            } catch (error) {
                console.error('[Zoom] Error checking initial URL:', error);
            }
        };
        checkInitialUrl();
    }, []);

    // Handle deep link callback
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            console.log('[Zoom] Deep link received:', event.url);
            if (event.url.includes('zoom-callback')) {
                await handleCallback(event.url);
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, []);

    const handleCallback = async (url: string) => {
        try {
            // Support both query params and hash fragments for security
            const queryString = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
            const hashString = url.includes('#') ? url.split('#')[1] : '';
            const params = new URLSearchParams(queryString || hashString);
            const token = params.get('access_token');
            const userName = params.get('user_name');
            const userEmail = params.get('user_email');
            const error = params.get('error');

            if (error) {
                console.error('[Zoom] OAuth error:', error);
                Alert.alert('Zoom Connection Failed', error);
                return;
            }

            if (token) {
                console.log('[Zoom] Token received, saving...');
                await SecureStore.setItemAsync(TOKEN_KEY, token);
                const userData = {
                    id: 'zoom-user',
                    name: userName || 'Zoom User',
                    email: userEmail || '',
                };
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
                setAccessToken(token);
                setUser(userData);
                setIsAuthenticated(true);
                console.log('[Zoom] Successfully authenticated!');
            }
        } catch (error) {
            console.error('[Zoom] Error handling callback:', error);
        }
    };

    const signIn = useCallback(async () => {
        try {
            console.log('[Zoom] Starting OAuth flow...');
            // Create redirect URL using Expo's Linking
            const redirectUrl = Linking.createURL('zoom-callback');
            console.log('[Zoom] Redirect URL:', redirectUrl);

            const authUrl = `${SUPABASE_ZOOM_AUTH_URL}/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`;
            console.log('[Zoom] Auth URL:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
            console.log('[Zoom] WebBrowser result:', result);

            if (result.type === 'success' && result.url) {
                await handleCallback(result.url);
            } else if (result.type === 'cancel') {
                console.log('[Zoom] User cancelled');
            }
        } catch (error) {
            console.error('[Zoom] Failed to start auth:', error);
            Alert.alert('Error', 'Could not connect to Zoom.');
            throw error;
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
            console.log('[Zoom] Signed out');
        } catch (error) {
            console.error('[Zoom] Failed to sign out:', error);
        }
    }, []);

    // Fetch cloud recordings from Zoom API
    const fetchRecordings = useCallback(async () => {
        if (!accessToken) {
            console.log('[Zoom] No access token for fetching recordings');
            return [];
        }

        setIsLoadingRecordings(true);
        try {
            // Get recordings from last 30 days
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 30);
            const from = fromDate.toISOString().split('T')[0];
            const to = new Date().toISOString().split('T')[0];

            const response = await fetch(
                `https://api.zoom.us/v2/users/me/recordings?from=${from}&to=${to}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                console.error('[Zoom] Failed to fetch recordings:', response.status);
                return [];
            }

            const data = await response.json();
            const meetingRecordings: ZoomRecording[] = (data.meetings || []).map((m: any) => ({
                id: m.uuid,
                topic: m.topic,
                start_time: m.start_time,
                duration: m.duration,
                recording_files: m.recording_files,
            }));

            setRecordings(meetingRecordings);
            console.log(`[Zoom] Fetched ${meetingRecordings.length} recordings`);
            return meetingRecordings;
        } catch (error) {
            console.error('[Zoom] Error fetching recordings:', error);
            return [];
        } finally {
            setIsLoadingRecordings(false);
        }
    }, [accessToken]);

    return {
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        recordings,
        isLoadingRecordings,
        signIn,
        signOut,
        fetchRecordings,
        isReady: true,
    };
}
