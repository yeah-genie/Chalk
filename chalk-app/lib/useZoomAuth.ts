import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const TOKEN_KEY = 'zoom_access_token';
const USER_KEY = 'zoom_user';

// Supabase Edge Function URL for Zoom OAuth
const SUPABASE_ZOOM_AUTH_URL = 'https://xnjqsgdapbjnowzwhnaq.supabase.co/functions/v1/zoom-auth';

export interface ZoomUser {
    id: string;
    name: string;
    email: string;
    pic_url?: string;
}

export function useZoomAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<ZoomUser | null>(null);
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
                }
            } catch (error) {
                console.error('Failed to load Zoom data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Handle deep link callback
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const url = event.url;
            if (url.includes('zoom-callback')) {
                const params = new URLSearchParams(url.split('?')[1]);
                const token = params.get('access_token');
                const userName = params.get('user_name');
                const userEmail = params.get('user_email');

                if (token) {
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
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, []);

    const signIn = useCallback(async () => {
        try {
            // Open Supabase Edge Function which handles Zoom OAuth
            const redirectUrl = Linking.createURL('zoom-callback');
            const authUrl = `${SUPABASE_ZOOM_AUTH_URL}/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`;

            await WebBrowser.openBrowserAsync(authUrl);
        } catch (error) {
            console.error('Failed to start Zoom auth:', error);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Failed to sign out of Zoom:', error);
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
