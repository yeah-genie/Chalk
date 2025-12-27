import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

const TOKEN_KEY = 'google_access_token';
const USER_KEY = 'google_user';

// Supabase Edge Function URL for Google OAuth
const SUPABASE_GOOGLE_AUTH_URL = 'https://xnjqsgdapbjnowzwhnaq.supabase.co/functions/v1/google-auth';

export interface GoogleUser {
    name: string;
    email: string;
    photo?: string;
}

export function useGoogleAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

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
                    console.log('[Google] Loaded stored credentials');
                }
            } catch (error) {
                console.error('[Google] Failed to load data:', error);
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
                if (initialUrl && initialUrl.includes('google-callback')) {
                    console.log('[Google] Initial URL detected:', initialUrl);
                    await handleCallback(initialUrl);
                }
            } catch (error) {
                console.error('[Google] Error checking initial URL:', error);
            }
        };
        checkInitialUrl();
    }, []);

    // Handle deep link callback
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            console.log('[Google] Deep link received:', event.url);
            if (event.url.includes('google-callback')) {
                await handleCallback(event.url);
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, []);

    const handleCallback = async (url: string) => {
        try {
            const params = new URLSearchParams(url.split('?')[1]);
            const token = params.get('access_token');
            const userName = params.get('user_name');
            const userEmail = params.get('user_email');
            const userPhoto = params.get('user_photo');
            const error = params.get('error');

            if (error) {
                console.error('[Google] OAuth error:', error);
                Alert.alert('Google 연결 실패', error);
                return;
            }

            if (token) {
                console.log('[Google] Token received, saving...');
                await SecureStore.setItemAsync(TOKEN_KEY, token);
                const userData: GoogleUser = {
                    name: userName || 'Google User',
                    email: userEmail || '',
                    photo: userPhoto || undefined,
                };
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
                setAccessToken(token);
                setUser(userData);
                setIsAuthenticated(true);
                console.log('[Google] Successfully authenticated!');
            }
        } catch (error) {
            console.error('[Google] Error handling callback:', error);
        }
    };

    const signIn = useCallback(async () => {
        try {
            console.log('[Google] Starting OAuth flow...');
            // Create redirect URL using Expo's Linking
            const redirectUrl = Linking.createURL('google-callback');
            console.log('[Google] Redirect URL:', redirectUrl);

            const authUrl = `${SUPABASE_GOOGLE_AUTH_URL}/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`;
            console.log('[Google] Auth URL:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
            console.log('[Google] WebBrowser result:', result);

            if (result.type === 'success' && result.url) {
                await handleCallback(result.url);
            } else if (result.type === 'cancel') {
                console.log('[Google] User cancelled');
            }
        } catch (error) {
            console.error('[Google] Failed to start auth:', error);
            Alert.alert('오류', 'Google 연결을 시작할 수 없습니다.');
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
            console.log('[Google] Signed out');
        } catch (error) {
            console.error('[Google] Failed to sign out:', error);
        }
    }, []);

    return {
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        signIn,
        signOut,
        isReady: true,
    };
}
