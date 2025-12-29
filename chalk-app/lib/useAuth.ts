import { useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Alert } from 'react-native';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState({
                user: session?.user ?? null,
                session,
                isLoading: false,
                isAuthenticated: !!session,
            });
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setState({
                    user: session?.user ?? null,
                    session,
                    isLoading: false,
                    isAuthenticated: !!session,
                });
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            Alert.alert('Sign In Error', error.message);
            return false;
        }
        return true;
    }, []);

    const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                // For mobile apps, use app deep link
                // For Supabase Dashboard: Set Site URL to your production URL
                // Authentication > URL Configuration > Site URL
                emailRedirectTo: 'chalk://auth/callback',
            },
        });
        if (error) {
            Alert.alert('Sign Up Error', error.message);
            return false;
        }
        Alert.alert(
            'Success',
            'Account created! Check your email for verification link.\n\n' +
            'Note: If the link goes to localhost, please contact support.'
        );
        return true;
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'chalk://auth/callback',
            },
        });
        if (error) {
            Alert.alert('Google Sign In Error', error.message);
            return false;
        }
        return true;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Sign Out Error', error.message);
            return false;
        }
        return true;
    }, []);

    return {
        ...state,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
    };
}
