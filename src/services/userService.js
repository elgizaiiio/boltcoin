import { supabase } from '@/lib/supabaseClient';

export const fetchUser = async (identifier, field = 'telegram_id') => {
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq(field, identifier)
    .single();
  return { user, error };
};

export const createUser = async (userData) => {
  const { data: user, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  return { user, error };
};

export const updateUser = async (identifier, updates, field = 'id') => {
  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq(field, identifier)
    .select()
    .single();
  return { user, error };
};