import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'google_access_token';

// Google OAuth credentials from Google Cloud Console
const GOOGLE_CONFIG = {
    iosClientId: '410176806836-ke5s4mb9m9slqgr9gfmf3mhucrr8ktjb.apps.googleusercontent.com',
    webClientId: '410176806836-7e1sbuc739b5663jmj5n978sfrmk68m9.apps.googleusercontent.com',
    androidClientId: '410176806836-ke5s4mb9m9slqgr9gfmf3mhucrr8ktjb.apps.googleusercontent.com',
};


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

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CONFIG.webClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        scopes: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    });

    // Load stored token on mount
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
                if (storedToken) {
                    setAccessToken(storedToken);
                    await fetchUserInfo(storedToken);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to load token:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    // Handle OAuth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleSignInSuccess(authentication.accessToken);
            }
        }
    }, [response]);

    const fetchUserInfo = async (token: string) => {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userInfo = await res.json();
            setUser({
                name: userInfo.name,
                email: userInfo.email,
                photo: userInfo.picture,
            });
        } catch (error) {
            console.error('Failed to fetch user info:', error);
        }
    };

    const handleSignInSuccess = async (token: string) => {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            setAccessToken(token);
            await fetchUserInfo(token);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to save token:', error);
        }
    };

    const signIn = useCallback(async () => {
        if (request) {
            await promptAsync();
        }
    }, [request, promptAsync]);

    const signOut = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    }, []);

    return {
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        signIn,
        signOut,
        isReady: !!request,
    };
}
