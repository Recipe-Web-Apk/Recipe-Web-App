import { supabase } from '../supabaseClient';

export async function getAllRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*');

  if (error) {
    console.error('Error fetching all recipes:', error);
    return [];
  }

  return data;
} 