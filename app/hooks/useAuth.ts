import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ottieni la sessione corrente
    const getSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Errore nel recupero della sessione:', error);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Configura il listener per i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Pulizia del listener quando il componente viene smontato
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Funzioni di autenticazione
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    // Verifica se siamo in un ambiente browser
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password`
      : 'http://localhost:5173/auth/reset-password';

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({
      password,
    });
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
