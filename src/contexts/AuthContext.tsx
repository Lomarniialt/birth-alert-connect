
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change event:', event, 'Session:', !!session);
        setSession(session);
        
        if (session?.user) {
          try {
            console.log('AuthProvider: Fetching user profile for:', session.user.id);
            // Fetch user profile from profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('AuthProvider: Error fetching profile:', error);
              setUser(null);
            } else if (profile) {
              console.log('AuthProvider: Profile fetched successfully:', profile);
              setUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                laborRoomId: profile.labor_room_id,
                isActive: profile.is_active,
                createdAt: profile.created_at
              });
            } else {
              console.log('AuthProvider: No profile found');
              setUser(null);
            }
          } catch (error) {
            console.error('AuthProvider: Unexpected error fetching profile:', error);
            setUser(null);
          }
        } else {
          console.log('AuthProvider: No session user, clearing user state');
          setUser(null);
        }
        
        // Always clear loading state after handling auth state change
        setIsLoading(false);
      }
    );

    // Check for existing session
    console.log('AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check - Session:', !!session, 'Error:', error);
      
      if (error) {
        console.error('AuthProvider: Error getting initial session:', error);
        setIsLoading(false);
        return;
      }
      
      // If there's no session, clear loading immediately
      if (!session) {
        console.log('AuthProvider: No initial session found, clearing loading');
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
      // If there is a session, the onAuthStateChange callback will handle it
      // and set isLoading to false there
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthProvider: Login attempt for email:', email);
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('AuthProvider: Login error:', error);
      setIsLoading(false);
      return false;
    }
    
    console.log('AuthProvider: Login successful');
    // Don't set isLoading to false here - let the auth state change handler do it
    return true;
  };

  const logout = async () => {
    console.log('AuthProvider: Logout initiated');
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthProvider: Logout error:', error);
    }
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
