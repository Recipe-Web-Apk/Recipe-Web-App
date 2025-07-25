/**
 * Supabase storage helper for similarity weights and interactions
 */

const { createClient } = require('@supabase/supabase-js');
const { DEFAULT_WEIGHTS } = require('./constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get user's similarity weights from database
 */
async function getUserWeights(userId) {
  try {
    const { data, error } = await supabase
      .from('user_similarity_weights')
      .select('title_weight, ingredients_weight, cuisine_weight, time_weight')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return DEFAULT_WEIGHTS;
    }

    return {
      title: data.title_weight || DEFAULT_WEIGHTS.title,
      ingredients: data.ingredients_weight || DEFAULT_WEIGHTS.ingredients,
      cuisine: data.cuisine_weight || DEFAULT_WEIGHTS.cuisine,
      time: data.time_weight || DEFAULT_WEIGHTS.time
    };
  } catch (error) {
    console.error('Error fetching user weights:', error);
    return DEFAULT_WEIGHTS;
  }
}

/**
 * Save user's similarity weights to database
 */
async function saveUserWeights(userId, weights) {
  try {
    const { error } = await supabase
      .from('user_similarity_weights')
      .upsert({
        user_id: userId,
        title_weight: weights.title,
        ingredients_weight: weights.ingredients,
        cuisine_weight: weights.cuisine,
        time_weight: weights.time,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving user weights:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving user weights:', error);
    return false;
  }
}

/**
 * Insert interaction record into database
 */
async function insertInteraction(userId, recipeId, decision, modelScore, features) {
  try {
    const { error } = await supabase
      .from('similarity_interactions')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        decision: decision,
        model_score: modelScore,
        feature_title: features.title,
        feature_ingredients: features.ingredients,
        feature_cuisine: features.cuisine,
        feature_time: features.time,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error inserting interaction:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inserting interaction:', error);
    return false;
  }
}

/**
 * Get interaction count for user
 */
async function getInteractionCount(userId) {
  try {
    const { count, error } = await supabase
      .from('similarity_interactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting interaction count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting interaction count:', error);
    return 0;
  }
}

/**
 * Fetch relevant recipes for similarity comparison
 */
async function fetchRelevantRecipes(title, cuisine = null, userId = null) {
  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Filter by user_id if provided (only check against user's own recipes)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by title - only get recipes that contain the search term
    if (title && title.trim().length > 0) {
      const searchTerm = title.trim();
      // Match recipes that contain the search term in their title
      query = query.ilike('title', `%${searchTerm}%`);
    }

    // If cuisine is provided and not empty, filter by cuisine
    if (cuisine && cuisine.trim().length > 0) {
      query = query.ilike('cuisine', `%${cuisine}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }

    console.log(`🔍 FETCH RELEVANT: Found ${data?.length || 0} recipes matching title "${title}" for user ${userId}`);
    if (data && data.length > 0) {
      console.log('🔍 FETCH RELEVANT: Matching recipes:', data.map(r => `${r.title} (ID: ${r.id}, User: ${r.user_id})`));
    } else {
      console.log('🔍 FETCH RELEVANT: No recipes found. Checking if user has any recipes...');
      // Check if user has any recipes at all
      const { data: allUserRecipes, error: allError } = await supabase
        .from('recipes')
        .select('id, title, user_id')
        .eq('user_id', userId);
      
      if (allError) {
        console.error('🔍 FETCH RELEVANT: Error checking all user recipes:', allError);
      } else {
        console.log(`🔍 FETCH RELEVANT: User has ${allUserRecipes?.length || 0} total recipes:`, 
          allUserRecipes?.map(r => `${r.title} (ID: ${r.id})`) || []);
      }
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

module.exports = {
  getUserWeights,
  saveUserWeights,
  insertInteraction,
  getInteractionCount,
  fetchRelevantRecipes
}; 