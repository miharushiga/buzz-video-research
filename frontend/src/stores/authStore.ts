/**
 * 認証ストア - バズ動画リサーチくん
 *
 * Zustand を使用した認証状態管理
 */

import { create } from 'zustand';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import {
  supabase,
  getSession,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as supabaseSignOut,
} from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface SubscriptionStatus {
  status: 'none' | 'trialing' | 'active' | 'cancelled' | 'expired' | 'past_due';
  trialEnd?: string;
  currentPeriodEnd?: string;
  isActive: boolean;
  daysRemaining?: number;
}

interface AuthState {
  // 状態
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // アクション
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  startTrial: () => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8433';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  subscription: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    console.log('Auth initialize started');
    try {
      set({ isLoading: true });

      // 認証状態変更をリッスン（先に設定）
      supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, newSession: Session | null) => {
          console.log('Auth state changed:', event, newSession ? 'session exists' : 'no session');

          set({
            user: newSession?.user ?? null,
            session: newSession,
          });

          if (newSession?.user) {
            try {
              await get().fetchProfile();
              await get().fetchSubscription();
            } catch (profileError) {
              console.error('Profile/subscription fetch error:', profileError);
            }
          } else {
            set({ profile: null, subscription: null });
          }

          // 初回イベント後に初期化完了
          if (!get().isInitialized) {
            set({ isLoading: false, isInitialized: true });
          }
        }
      );

      // セッションを取得（onAuthStateChangeが発火しない場合のフォールバック）
      console.log('Getting session...');
      const session = await getSession();
      console.log('Session result:', session ? 'exists' : 'null');

      if (session?.user) {
        set({
          user: session.user,
          session,
        });

        // プロファイルとサブスクリプションを取得（エラーでも続行）
        try {
          await get().fetchProfile();
          await get().fetchSubscription();
        } catch (profileError) {
          console.error('Profile/subscription fetch error:', profileError);
        }
      }

      // セッションがある場合、またはURLにOAuthパラメータがない場合は初期化完了
      const hasOAuthParams = window.location.hash.includes('access_token') ||
                            window.location.search.includes('code=');

      if (!hasOAuthParams || session) {
        set({ isLoading: false, isInitialized: true });
      } else {
        // OAuthパラメータがある場合は少し待つ
        console.log('OAuth params detected, waiting for auth state change...');
        setTimeout(() => {
          if (!get().isInitialized) {
            console.log('Timeout: setting initialized');
            set({ isLoading: false, isInitialized: true });
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: '認証の初期化に失敗しました', isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      await signInWithEmail(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      set({ isLoading: true, error: null });
      await signUpWithEmail(email, password, fullName);
    } catch (error) {
      const message = error instanceof Error ? error.message : '登録に失敗しました';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Googleログインに失敗しました';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await supabaseSignOut();
      set({
        user: null,
        session: null,
        profile: null,
        subscription: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    const { session } = get();
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({
          profile: {
            id: data.profile.id,
            email: data.profile.email,
            fullName: data.profile.full_name,
            avatarUrl: data.profile.avatar_url,
            isAdmin: data.profile.is_admin,
          },
          subscription: {
            status: data.subscription.status,
            trialEnd: data.subscription.trial_end,
            currentPeriodEnd: data.subscription.current_period_end,
            isActive: data.subscription.is_active,
            daysRemaining: data.subscription.days_remaining,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  },

  fetchSubscription: async () => {
    const { session } = get();
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/subscription`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({
          subscription: {
            status: data.status,
            trialEnd: data.trial_end,
            currentPeriodEnd: data.current_period_end,
            isActive: data.is_active,
            daysRemaining: data.days_remaining,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  },

  startTrial: async () => {
    const { session } = get();
    if (!session?.access_token) return;

    try {
      set({ isLoading: true, error: null });

      const response = await fetch(`${API_BASE_URL}/api/auth/trial/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          set({
            subscription: {
              status: data.subscription.status,
              trialEnd: data.subscription.trial_end,
              currentPeriodEnd: data.subscription.current_period_end,
              isActive: data.subscription.is_active,
              daysRemaining: data.subscription.days_remaining,
            },
          });
        } else {
          set({ error: data.message });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'トライアル開始に失敗しました';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
