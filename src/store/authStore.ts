import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { welcomeNote, todoNote } from '../types';
 
  email: string;
  full_name: string | null;
  subscription_tier: 'free' | 'pro' | 'premium';
  subscription_start: string | null;
  subscription_end: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  subscribe: (tier: 'pro' | 'premium') => Promise<void>;
}

const createDefaultNotes = async (userId: string) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const defaultNotes = [
    {
      user_id: userId,
      title: welcomeNote.title,
      content: welcomeNote.content,
      tags: welcomeNote.tags,
      has_media: false
    },
    {
      user_id: userId,
      title: todoNote.title,
      content: todoNote.content,
      tags: todoNote.tags,
      has_media: false
    }
  ];

  const { error } = await supabase
    .from('notes')
    .insert(defaultNotes);

  if (error) throw error;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      // First try to get the profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      // If no profile exists, create one
      if (!profiles || profiles.length === 0) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            subscription_tier: 'free'
          })
          .select()
          .single();

        if (createError) throw createError;

        // Create default notes for new users
        await createDefaultNotes(session.user.id);

        set({ 
          user: session.user,
          profile: newProfile,
          isLoading: false 
        });
        return;
      }

      set({ 
        user: session.user,
        profile: profiles[0],
        isLoading: false 
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, profile: null, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;

    if (data.user) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id);

      set({ user: data.user, profile: profiles?.[0] || null });
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      // First check if user exists
      const { data: { user: existingUser } } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (existingUser) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
    } catch (error: any) {
      // If error is not "Invalid login credentials", then user exists
      if (error?.message !== 'Invalid login credentials') {
        throw new Error('This email is already registered. Please sign in instead.');
      }
    }

    // If we get here, user doesn't exist, proceed with signup
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    if (!data.user) throw new Error('Signup failed');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          subscription_tier: 'free'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create default notes for new users
      await createDefaultNotes(data.user.id);

      set({ user: data.user, profile });
    } catch (error) {
      // If profile creation fails, clean up by signing out
      await supabase.auth.signOut();
      throw error;
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },

  loadProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      set({ 
        user, 
        profile: profiles?.[0] || null, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Load profile error:', error);
      set({ user: null, profile: null, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) throw error;
    await get().loadProfile();
  },

  subscribe: async (tier: 'pro' | 'premium') => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_start: startDate.toISOString(),
        subscription_end: endDate.toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
    await get().loadProfile();
  }
}));