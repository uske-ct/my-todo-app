import { createClient } from './client';

export interface Goal {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  strengths?: string;
  weaknesses?: string;
  target_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('goals')
    .insert({
      ...goal,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('目標作成エラー:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getUserGoals(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function updateGoal(goalId: string, updates: Partial<Goal>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select()
    .single();

  return { data, error };
}