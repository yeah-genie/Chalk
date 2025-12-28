import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const TOKEN_KEY = 'stripe_access_token';
const ACCOUNT_KEY = 'stripe_account';

// Supabase Edge Function URL for Stripe OAuth (from environment)
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_STRIPE_AUTH_URL = `${SUPABASE_URL}/functions/v1/stripe-auth`;


export interface StripeAccount {
    id: string;
    email?: string;
    business_name?: string;
}

export function useStripeAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [account, setAccount] = useState<StripeAccount | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Load stored data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
                const storedAccount = await SecureStore.getItemAsync(ACCOUNT_KEY);
                if (storedToken && storedAccount) {
                    setAccessToken(storedToken);
                    setAccount(JSON.parse(storedAccount));
                    setIsAuthenticated(true);
                    console.log('[Stripe] Loaded stored credentials');
                }
            } catch (error) {
                console.error('[Stripe] Failed to load data:', error);
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
                if (initialUrl && initialUrl.includes('stripe-callback')) {
                    console.log('[Stripe] Initial URL detected:', initialUrl);
                    await handleCallback(initialUrl);
                }
            } catch (error) {
                console.error('[Stripe] Error checking initial URL:', error);
            }
        };
        checkInitialUrl();
    }, []);

    // Handle deep link callback
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            console.log('[Stripe] Deep link received:', event.url);
            if (event.url.includes('stripe-callback')) {
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
            const accountId = params.get('stripe_user_id');
            const error = params.get('error');

            if (error) {
                console.error('[Stripe] OAuth error:', error);
                Alert.alert('Stripe Connection Failed', error);
                return;
            }

            if (token && accountId) {
                console.log('[Stripe] Token received, saving...');
                await SecureStore.setItemAsync(TOKEN_KEY, token);
                const accountData = {
                    id: accountId,
                    email: params.get('email') || undefined,
                    business_name: params.get('business_name') || undefined,
                };
                await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(accountData));
                setAccessToken(token);
                setAccount(accountData);
                setIsAuthenticated(true);
                console.log('[Stripe] Successfully authenticated!');
            }
        } catch (error) {
            console.error('[Stripe] Error handling callback:', error);
        }
    };

    const signIn = useCallback(async () => {
        try {
            console.log('[Stripe] Starting OAuth flow...');
            // Create redirect URL using Expo's Linking
            const redirectUrl = Linking.createURL('stripe-callback');
            console.log('[Stripe] Redirect URL:', redirectUrl);

            const authUrl = `${SUPABASE_STRIPE_AUTH_URL}/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`;
            console.log('[Stripe] Auth URL:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
            console.log('[Stripe] WebBrowser result:', result);

            if (result.type === 'success' && result.url) {
                await handleCallback(result.url);
            } else if (result.type === 'cancel') {
                console.log('[Stripe] User cancelled');
            }
        } catch (error) {
            console.error('[Stripe] Failed to start auth:', error);
            Alert.alert('Error', 'Could not connect to Stripe.');
            throw error;
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(ACCOUNT_KEY);
            setAccessToken(null);
            setAccount(null);
            setIsAuthenticated(false);
            console.log('[Stripe] Signed out');
        } catch (error) {
            console.error('[Stripe] Failed to sign out:', error);
        }
    }, []);

    return {
        isAuthenticated,
        isLoading,
        account,
        accessToken,
        signIn,
        signOut,
        isReady: true,
    };
}
