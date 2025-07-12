const { createClient } = require('@supabase/supabase-js');
const axiosInstance = require('./axiosInstance');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const spoonacularApiKey = process.env.SPOONACULAR_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndCacheSpoonacularRecipe(recipeId) {
  // 1. Check cache
  const { data: cached, error: cacheError } = await supabase
    .from('spoonacular_cache')
    .select('*')
    .eq('spoonacular_id', recipeId)
    .single();

  if (cached) {
    console.log('✅ Found in cache:', cached.title);
    return cached;
  }
  if (cacheError && cacheError.code !== 'PGRST116') {
    console.error('Error checking cache:', cacheError);
    return null;
  }

  // 2. Fetch from Spoonacular
  console.log('Fetching from Spoonacular API...');
  const url = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${spoonacularApiKey}`;
  const response = await axiosInstance.get(url);
  const data = response.data;

  // 3. Cache in DB
  const { error: insertError } = await supabase
    .from('spoonacular_cache')
    .insert([
      {
        spoonacular_id: recipeId,
        title: data.title,
        data,
        cached_at: new Date().toISOString(),
      },
    ]);
  if (insertError) {
    console.error('Error caching recipe:', insertError);
    return null;
  }
  console.log('✅ Cached new recipe:', data.title);
  return data;
}

// Example usage: node test-spoonacular-cache.js 716429
const recipeId = process.argv[2] || '716429'; // Default to a known Spoonacular recipe
fetchAndCacheSpoonacularRecipe(recipeId).then((result) => {
  if (result) {
    console.log('Recipe data:', result.title || result.data?.title);
  } else {
    console.log('No recipe data returned.');
  }
}); 