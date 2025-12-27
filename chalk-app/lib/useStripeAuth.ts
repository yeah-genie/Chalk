import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const TOKEN_KEY = 'stripe_access_token';
const ACCOUNT_KEY = 'stripe_account';

// Supabase Edge Function URL for Stripe OAuth
const SUPABASE_STRIPE_AUTH_URL = 'https://xnjqsgdapbjnowzwhnaq.supabase.co/functions/v1/stripe-auth';

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
                }
            } catch (error) {
                console.error('Failed to load Stripe data:', error);
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
            if (url.includes('stripe-callback')) {
                const params = new URLSearchParams(url.split('?')[1]);
                const token = params.get('access_token');
                const accountId = params.get('stripe_user_id');

                if (token && accountId) {
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
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, []);

    const signIn = useCallback(async () => {
        try {
            // Open Supabase Edge Function which handles Stripe OAuth
            const redirectUrl = Linking.createURL('stripe-callback');
            const authUrl = `${SUPABASE_STRIPE_AUTH_URL}/authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`;

            await WebBrowser.openBrowserAsync(authUrl);
        } catch (error) {
            console.error('Failed to start Stripe auth:', error);
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(ACCOUNT_KEY);
            setAccessToken(null);
            setAccount(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Failed to disconnect Stripe:', error);
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
