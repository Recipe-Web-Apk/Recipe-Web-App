import { supabase } from '../supabaseClient';

// 1. Get user preferences (preferences, diet, cuisine)
export async function getUserPreferences(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('preferences, diet, cuisine')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }

  return data;
}

// 2. Get liked recipes (with recipe details)
export async function getUserLikedRecipes(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('recipe_id, recipes (id, title, tags, cuisine, season, dairy_free)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching liked recipes:', error);
    return [];
  }

  return data.map(row => row.recipes);
}

// 3. Get viewed recipes (with recipe details)
export async function getUserViewedRecipes(userId) {
  const { data, error } = await supabase
    .from('views')
    .select('recipe_id, recipes (id, title, tags, cuisine, season, dairy_free)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching viewed recipes:', error);
    return [];
  }

  return data.map(row => row.recipes);
} 