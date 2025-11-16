import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface UserProfile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: number;
  saved_at: string;
}

export interface Interaction {
  id: string;
  user_id: string;
  recipe_id: number;
  action: 'view' | 'save' | 'cook' | 'rate';
  rating?: number;
  created_at: string;
}
