const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Constants for advanced autofill
const AUTOFILL_CONFIG = {
  MIN_TITLE_LENGTH: 3,
  MAX_SUGGESTIONS: 10,
  CONFIDENCE_THRESHOLDS: {
    SPOONACULAR: 0.8,
    USER_CREATED: 0.9,
    PATTERNS: 0.7,
    AI_GENERATED: 0.6
  },
  STOP_WORDS: [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]
};

// Advanced autofill endpoint with multi-source suggestions
router.get('/advanced-autofill', authenticateToken, async (req, res) => {
  try {
    const { title, field, context } = req.query;
    const userId = req.user.id;

    if (!title || !field) {
      return res.status(400).json({ error: 'Title and field are required' });
    }

    const suggestions = await getMultiSourceSuggestions(title, field, context, userId);

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 5) // Limit to top 5 suggestions
    });

  } catch (error) {
    console.error('Advanced autofill error:', error);
    res.status(500).json({ error: 'Failed to validate field' });
  }
});

async function getMultiSourceSuggestions(title, field, context, userId) {
  const suggestions = [];

  // 1. Spoonacular API suggestions
  try {
    const spoonacularSuggestions = await getSpoonacularSuggestions(title, field);
    suggestions.push(...spoonacularSuggestions);
  } catch (error) {
    console.error('Spoonacular suggestions failed:', error.message);
  }

  // 2. User's own recipe suggestions
  try {
    const userSuggestions = await getUserSuggestions(title, field, userId);
    suggestions.push(...userSuggestions);
  } catch (error) {
    console.error('User recipe suggestions failed:', error.message);
  }

  // 3. Pattern-based suggestions
  try {
    const patternSuggestions = await getPatternSuggestions(title, field);
    suggestions.push(...patternSuggestions);
  } catch (error) {
    console.error('Pattern suggestions failed:', error.message);
  }

  // 4. AI-generated suggestions
  try {
    const aiSuggestions = await getAISuggestions(title, field, context);
    suggestions.push(...aiSuggestions);
  } catch (error) {
    console.error('AI suggestions failed:', error.message);
  }

  // Rank and deduplicate suggestions
  const rankedSuggestions = rankSuggestions(suggestions, title, field);
  const finalSuggestions = deduplicateSuggestions(rankedSuggestions);

  return finalSuggestions;
}

// Spoonacular API suggestions
async function getSpoonacularSuggestions(title, field, context) {
  const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
    params: {
      query: title,
      number: 5,
      addRecipeInformation: true,
      fillIngredients: true,
      instructionsRequired: false,
      addRecipeNutrition: true,
      apiKey: process.env.SPOONACULAR_API_KEY
    }
  });

  const recipes = response.data.results || [];
  const suggestions = [];

  for (const recipe of recipes) {
    const suggestion = {
      id: recipe.id,
      title: recipe.title,
      confidence: 0.8
    };

    // Extract field-specific data
    switch (field) {
      case 'ingredients':
        if (recipe.extendedIngredients) {
          suggestion.data = recipe.extendedIngredients.map(i => i.original);
        }
        break;
      case 'instructions':
        if (recipe.analyzedInstructions && recipe.analyzedInstructions[0]?.steps) {
          suggestion.data = recipe.analyzedInstructions[0].steps.map(s => s.step);
        }
        break;
      case 'description':
        suggestion.data = recipe.summary ? cleanHtml(recipe.summary) : null;
        break;
      case 'category':
        suggestion.data = recipe.cuisines?.[0] || recipe.dishTypes?.[0];
        break;
      case 'difficulty':
        suggestion.data = estimateDifficulty(recipe.readyInMinutes, recipe.extendedIngredients?.length);
        break;
      case 'tags':
        suggestion.data = [...(recipe.cuisines || []), ...(recipe.dishTypes || []), ...(recipe.diets || [])];
        break;
      case 'stats':
        suggestion.data = {
          readyInMinutes: recipe.readyInMinutes,
          calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount,
          servings: recipe.servings
        };
        break;
    }

    if (suggestion.data) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

// User-created recipe suggestions
async function getUserRecipeSuggestions(title, field, userId) {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .ilike('title', `%${title}%`)
    .eq('user_id', userId)
    .limit(5);

  if (error || !recipes) return [];

  return recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    data: extractFieldData(recipe, field),
    confidence: 0.9
  }));
}

// Popular patterns from database
async function getPopularPatterns(title, field, context) {
  let query = supabase.from('recipes').select('*');
  
  // Apply context filters
  if (context) {
    const contextObj = JSON.parse(context);
    if (contextObj.cuisine) {
      query = query.ilike('cuisine', `%${contextObj.cuisine}%`);
    }
    if (contextObj.difficulty) {
      query = query.eq('difficulty', contextObj.difficulty);
    }
  }

  const { data: recipes, error } = await query.limit(10);
  if (error || !recipes) return [];

  // Extract patterns
  const patterns = extractPatterns(recipes, field);
  return patterns.map(pattern => ({
    id: `pattern_${pattern.hash}`,
    title: pattern.title,
    data: pattern.data,
    confidence: 0.7,
    frequency: pattern.frequency
  }));
}

// AI-generated suggestions using templates
async function generateAISuggestions(title, field, context) {
  const suggestions = [];
  const contextObj = context ? JSON.parse(context) : {};

  switch (field) {
    case 'ingredients':
      suggestions.push(...generateIngredientSuggestions(title, contextObj));
      break;
    case 'instructions':
      suggestions.push(...generateInstructionTemplates(title, contextObj));
      break;
    case 'description':
      suggestions.push(...generateDescriptionTemplates(title, contextObj));
      break;
    case 'category':
      suggestions.push(...generateCategorySuggestions(title, contextObj));
      break;
    case 'difficulty':
      suggestions.push(...generateDifficultySuggestions(title, contextObj));
      break;
    case 'tags':
      suggestions.push(...generateTagSuggestions(title, contextObj));
      break;
  }

  return suggestions.map(s => ({
    ...s,
    confidence: 0.6
  }));
}

// Helper functions
function extractFieldData(recipe, field) {
  switch (field) {
    case 'ingredients':
      return recipe.ingredients || [];
    case 'instructions':
      return recipe.instructions || [];
    case 'description':
      return recipe.description;
    case 'category':
      return recipe.category;
    case 'difficulty':
      return recipe.difficulty;
    case 'tags':
      return recipe.tags || [];
    case 'stats':
      return {
        readyInMinutes: recipe.cookTime,
        calories: recipe.calories,
        servings: recipe.servings
      };
    default:
      return null;
  }
}

function extractPatterns(recipes, field) {
  const patterns = new Map();
  
  recipes.forEach(recipe => {
    const data = extractFieldData(recipe, field);
    if (!data) return;

    const hash = JSON.stringify(data);
    if (patterns.has(hash)) {
      patterns.get(hash).frequency++;
    } else {
      patterns.set(hash, {
        title: recipe.title,
        data: data,
        frequency: 1,
        hash: hash
      });
    }
  });

  return Array.from(patterns.values())
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

function generateIngredientSuggestions(title, context) {
  const suggestions = [];
  const titleLower = title.toLowerCase();
  
  // Common ingredient patterns
  if (titleLower.includes('pasta')) {
    suggestions.push({
      title: 'Pasta Ingredients',
      data: ['Pasta', 'Olive oil', 'Garlic', 'Salt', 'Black pepper', 'Parmesan cheese']
    });
  }
  
  if (titleLower.includes('chicken')) {
    suggestions.push({
      title: 'Chicken Dish Ingredients',
      data: ['Chicken breast', 'Olive oil', 'Salt', 'Black pepper', 'Herbs', 'Lemon']
    });
  }

  return suggestions;
}

function generateInstructionTemplates(title, context) {
  const suggestions = [];
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('pasta')) {
    suggestions.push({
      title: 'Pasta Cooking Instructions',
      data: [
        'Bring a large pot of salted water to boil',
        'Cook pasta according to package directions',
        'Drain pasta, reserving 1 cup of pasta water',
        'Add sauce and toss until well combined',
        'Serve immediately with grated cheese'
      ]
    });
  }

  return suggestions;
}

function generateDescriptionTemplates(title, context) {
  return [{
    title: 'Recipe Description',
    data: `A delicious ${title} recipe that's perfect for any occasion. This dish combines fresh ingredients with simple cooking techniques to create a memorable meal.`
  }];
}

function generateCategorySuggestions(title, context) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('pasta')) return [{ title: 'Pasta', data: 'Pasta' }];
  if (titleLower.includes('chicken')) return [{ title: 'Chicken', data: 'Chicken' }];
  if (titleLower.includes('salad')) return [{ title: 'Salad', data: 'Salad' }];
  
  return [{ title: 'Main Course', data: 'Main Course' }];
}

function generateDifficultySuggestions(title, context) {
  return [
    { title: 'Easy', data: 'Easy' },
    { title: 'Medium', data: 'Medium' },
    { title: 'Hard', data: 'Hard' }
  ];
}

function generateTagSuggestions(title, context) {
  const tags = [];
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('pasta')) tags.push('pasta', 'italian', 'main-course');
  if (titleLower.includes('chicken')) tags.push('chicken', 'protein', 'main-course');
  if (titleLower.includes('vegetarian')) tags.push('vegetarian', 'healthy');
  
  return [{ title: 'Suggested Tags', data: tags }];
}

function rankAndDeduplicateSuggestions(suggestions) {
  // Remove duplicates based on data content
  const unique = new Map();
  
  suggestions.forEach(suggestion => {
    const key = JSON.stringify(suggestion.data);
    if (!unique.has(key) || unique.get(key).confidence < suggestion.confidence) {
      unique.set(key, suggestion);
    }
  });

  // Sort by confidence and source priority
  return Array.from(unique.values()).sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    
    const sourcePriority = { user_created: 3, spoonacular: 2, patterns: 1, ai: 0 };
    return sourcePriority[b.source] - sourcePriority[a.source];
  });
}

function cleanHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function estimateDifficulty(cookTime, ingredientCount) {
  if (cookTime <= 30 && ingredientCount <= 5) return 'Easy';
  if (cookTime <= 60 && ingredientCount <= 10) return 'Medium';
  return 'Hard';
}

// Context-aware validation
router.post('/validate-field', async (req, res) => {
  try {
    const { field, value, context } = req.body;
    const userId = req.user?.id || 'test-user-id';

    const validation = await validateField(field, value, context, userId);
    
    res.json(validation);
  } catch (error) {
    console.error('Field validation error:', error);
    res.status(500).json({ error: 'Failed to validate field' });
  }
});

async function validateField(field, value, context, userId) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Field-specific validation
  switch (field) {
    case 'title':
      if (value.length < 3) {
        validation.isValid = false;
        validation.errors.push('Title must be at least 3 characters long');
      }
      if (value.length > 100) {
        validation.warnings.push('Title is quite long. Consider a shorter, more descriptive title.');
      }
      break;
      
    case 'ingredients':
      if (!Array.isArray(value) || value.length === 0) {
        validation.isValid = false;
        validation.errors.push('At least one ingredient is required');
      }
      // Check for common ingredient mistakes
      const commonMistakes = await checkIngredientMistakes(value);
      validation.suggestions.push(...commonMistakes);
      break;
      
    case 'instructions':
      if (!Array.isArray(value) || value.length === 0) {
        validation.isValid = false;
        validation.errors.push('At least one instruction step is required');
      }
      break;
      
    case 'cookTime':
      const time = parseInt(value);
      if (isNaN(time) || time <= 0) {
        validation.isValid = false;
        validation.errors.push('Cooking time must be a positive number');
      }
      if (time > 480) {
        validation.warnings.push('Cooking time seems very long. Please verify.');
      }
      break;
  }

  // Context-aware suggestions
  if (context) {
    const contextSuggestions = await getContextualSuggestions(field, value, context, userId);
    validation.suggestions.push(...contextSuggestions);
  }

  return validation;
}

async function checkIngredientMistakes(ingredients) {
  const suggestions = [];
  const commonMistakes = {
    'flour': 'all-purpose flour',
    'sugar': 'granulated sugar',
    'salt': 'kosher salt',
    'pepper': 'black pepper'
  };

  ingredients.forEach(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    Object.entries(commonMistakes).forEach(([mistake, suggestion]) => {
      if (lowerIngredient.includes(mistake) && !lowerIngredient.includes(suggestion.split(' ')[1])) {
        suggestions.push(`Consider using "${suggestion}" instead of "${ingredient}" for better results`);
      }
    });
  });

  return suggestions;
}

async function getContextualSuggestions(field, value, context, userId) {
  const suggestions = [];
  const contextObj = typeof context === 'string' ? JSON.parse(context) : context;

  // Suggest related fields based on current input
  if (field === 'title' && contextObj.cuisine) {
    suggestions.push(`Consider adding "${contextObj.cuisine}" to the title for better discoverability`);
  }

  if (field === 'ingredients' && contextObj.difficulty === 'Easy') {
    suggestions.push('For easy recipes, consider using pre-cut vegetables and simple ingredients');
  }

  return suggestions;
}

// Original autofill endpoint (kept for backward compatibility)
router.get('/autofill-recipe', async (req, res) => {
  const { title } = req.query;
  console.log("Searching title:", title);
  if (!title || title.length < 4) {
    return res.status(400).json({ error: "Title too short for search" });
  }
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query: title,
        number: 1,
        addRecipeInformation: true,
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });
    const data = response.data;
    if (!data || !Array.isArray(data.results)) {
      console.error("Invalid Spoonacular response:", data);
      return res.status(500).json({ error: "No results from Spoonacular" });
    }
    let recipe = data.results[0];
    if (!recipe) return res.json({ ingredients: [], instructions: [], readyInMinutes: null });

    // If missing ingredients or instructions, fetch full info
    let ingredients = Array.isArray(recipe.extendedIngredients)
      ? recipe.extendedIngredients.map(i => i.original)
      : [];
    let instructions = Array.isArray(recipe.analyzedInstructions) && recipe.analyzedInstructions[0]?.steps
      ? recipe.analyzedInstructions[0].steps.map(s => s.step)
      : [];

    if ((!ingredients.length || !instructions.length) && recipe.id) {
      try {
        const infoRes = await axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
          params: { apiKey: process.env.SPOONACULAR_API_KEY }
        });
        const info = infoRes.data;
        if (Array.isArray(info.extendedIngredients)) {
          ingredients = info.extendedIngredients.map(i => i.original);
        }
        if (Array.isArray(info.analyzedInstructions) && info.analyzedInstructions[0]?.steps) {
          instructions = info.analyzedInstructions[0].steps.map(s => s.step);
        }
        // Optionally update image and readyInMinutes if missing
        if (!recipe.image && info.image) recipe.image = info.image;
        if (!recipe.readyInMinutes && info.readyInMinutes) recipe.readyInMinutes = info.readyInMinutes;
      } catch (infoErr) {
        console.log("spoonacular info fetch error:", infoErr.response?.data || infoErr.message);
      }
    }

    res.json({
      title: recipe.title || null,
      ingredients,
      instructions,
      image: recipe.image || null,
      readyInMinutes: recipe.readyInMinutes || null,
      calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || null,
      servings: recipe.servings || null
    });
  } catch (error) {
    if (error.response) {
      console.log("spoonacular raw error:", error.response.data);
    } else {
      console.log("spoonacular error:", error.message);
    }
    res.status(500).json({ error: 'Failed to autofill' });
  }
});

module.exports = router; 