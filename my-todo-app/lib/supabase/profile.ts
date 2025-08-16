import { createClient } from './client';

export async function createUserProfile(userId: string, email: string, name?: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: email,
      name: name || email.split('@')[0], // emailからデフォルト名を生成
    })
    .select()
    .single();

  if (error) {
    console.error('プロフィール作成エラー:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}