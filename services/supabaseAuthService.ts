import { supabase } from '../config/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export class SupabaseAuthService {
  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Đã có lỗi xảy ra' };
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Không thể tạo tài khoản' };
      }

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: name,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Auth user created but profile failed - still continue
      }

      // Check if email confirmation is required
      if (!authData.session) {
        // Email confirmation required - user created but no session
        return { 
          user: null, 
          error: 'confirm_email' // Special flag for UI
        };
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: name,
        },
        error: null,
      };
    } catch (error: any) {
      return { user: null, error: error.message || 'Đã có lỗi xảy ra' };
    }
  }

  /**
   * Sign in existing user
   */
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // More specific error messages
        if (authError.message.includes('Email not confirmed')) {
          return { user: null, error: 'Vui lòng kiểm tra email và nhấn vào liên kết xác thực để kích hoạt tài khoản của bạn.' };
        }
        if (authError.message.includes('Invalid login credentials')) {
          return { user: null, error: 'Email hoặc mật khẩu không đúng' };
        }
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Không thể đăng nhập' };
      }

      // Get user profile or create if not exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', authData.user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when not found

      // If profile doesn't exist, create it
      if (!profile) {
        const displayName = authData.user.user_metadata?.full_name 
          || authData.user.user_metadata?.name
          || authData.user.email?.split('@')[0] 
          || 'User';

        await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            name: displayName,
          });

        return {
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            name: displayName,
          },
          error: null,
        };
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: profile.name || authData.user.email?.split('@')[0] || 'User',
        },
        error: null,
      };
    } catch (error: any) {
      return { user: null, error: error.message || 'Đã có lỗi xảy ra' };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Đã có lỗi xảy ra' };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Get user profile or use metadata
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', session.user.id)
        .maybeSingle();

      return {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.name || session.user.user_metadata?.full_name || 'User',
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get or create profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('id', session.user.id)
          .maybeSingle();

        // Auto-create profile if doesn't exist
        if (!profile) {
          const displayName = session.user.user_metadata?.full_name
            || session.user.user_metadata?.name
            || session.user.email?.split('@')[0]
            || 'User';

          await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              name: displayName,
            });

          callback({
            id: session.user.id,
            email: session.user.email!,
            name: displayName,
          });
        } else {
          callback({
            id: session.user.id,
            email: session.user.email!,
            name: profile.name || session.user.email?.split('@')[0] || 'User',
          });
        }
      } else {
        callback(null);
      }
    });
  }
}
