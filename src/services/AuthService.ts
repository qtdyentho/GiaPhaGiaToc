import { Profile } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockProfile } from './mockData';

export class AuthService {
  static async getCurrentUser(): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          return profile || {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || '',
            created_at: user.created_at,
            updated_at: user.created_at,
          };
        }
      } catch (err) {
        console.error('AuthService getCurrentUser error:', err);
      }
    }
    const saved = localStorage.getItem('hl_auth_user');
    return saved ? JSON.parse(saved) : mockProfile;
  }

  static async signIn(email: string, password?: string): Promise<{ user: Profile; token: string }> {
    if (isSupabaseConfigured() && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (!error && data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const resolvedUser: Profile = profile || {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          created_at: data.user.created_at,
          updated_at: data.user.created_at,
        };

        return {
          user: resolvedUser,
          token: data.session?.access_token || '',
        };
      }
    }

    return {
      user: { ...mockProfile, email },
      token: 'mock-jwt-token-sample',
    };
  }

  static async signUp(email: string, fullName: string, phone?: string, password?: string): Promise<{ user: Profile }> {
    if (isSupabaseConfigured() && password) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
          },
        },
      });

      if (!error && data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').insert([newProfile]);
        return { user: newProfile };
      }
    }

    return {
      user: {
        ...mockProfile,
        email,
        full_name: fullName,
        phone,
      },
    };
  }

  static async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('AuthService signOut error:', err);
      }
    }
  }
}

