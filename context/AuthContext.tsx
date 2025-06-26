

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextProps {
  clientId: string | null;
  setClientId: (id: string | null) => void;

  guestUser: any;
  setGuestUser: (id: any) => void;

  authUser: User | null;
  setAuthUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider = ({
  initialClientId,
  children,
}: {
  initialClientId: string | null;
  children: ReactNode;
}) => {
  const supabase = createClient();

  const [clientId, setClientId] = useState<string | null>(initialClientId);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [guestUser, setGuestUser] = useState<any>(null);

  // Set client ID cookie if not already set
  useEffect(() => {
    if (!clientId) {
      const newId = crypto.randomUUID();
      document.cookie = `client_id=${newId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax; ${
        location.protocol === 'https:' ? 'Secure;' : ''
      }`;
      setClientId(newId);
    }
  }, [clientId]);

  //  Insert or update guest user record in Supabase
  useEffect(() => {
    const upsertGuestUser = async () => {
      if (!clientId) return;

      const { data,  error } = await supabase
        .from('guest_users')
        .upsert({
          cookie_id: clientId,
          last_seen_at: new Date().toISOString(),
        },{ onConflict: 'cookie_id'})
        .select();
        if(data && data.length) {
            setGuestUser(data[0])
        }

      if (error) {
        console.error('Supabase guest upsert error:', error.message);
      }
    };

    if (clientId) {
      upsertGuestUser();
    }
  }, [clientId]);

  // Get currently authenticated user (if any)
  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data, error } = await supabase.auth.getUser();
    setAuthUser(data?.user ?? null);
    
    };

    fetchAuthUser();
  }, []);

  return (
    <AuthContext.Provider value={{ clientId, setClientId,guestUser, setGuestUser, authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthContextProvider');
  }
  return context;
};
