const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const { 
  checkSimilarityWithDynamicScoring,
  trackSimilarityInteraction,
  TARGET_VALUES
} = require('../utils/dynamicSimilarityScoring');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Recipe routes are working!' });
});

// Very simple test route without any imports
router.get('/ping', (req, res) => {
  res.json({ message: 'Pong!', timestamp: new Date().toISOString() });
});

// Test similarity route without authentication
router.post('/test-similarity', async (req, res) => {
  const { title, ingredients } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {

    
    // Simple mock response for testing
    const mockResponse = {
      hasSimilarRecipes: false,
      warning: null,
      autofillSuggestion: null,
      allMatches: []
    };

    // If title contains "pasta", simulate a similar recipe with dynamic scoring
    if (title.toLowerCase().includes('pasta')) {
      // Simulate dynamic feature extraction
      const features = {
        titleSimilarity: 0.8,
        ingredientSimilarity: 0.7,
        cuisineMatch: 1.0,
        cookingTimeMatch: 0.6,
        difficultyMatch: 1.0,
        dietaryMatch: 0.5
      };

      // Simulate learned weights (in real system, these would come from user's learning)
      const weights = {
        titleSimilarity: 0.3,
        ingredientSimilarity: 0.4,
        cuisineMatch: 0.1,
        cookingTimeMatch: 0.1,
        difficultyMatch: 0.05,
        dietaryMatch: 0.05
      };

      // Calculate dynamic similarity score
      let totalScore = 0;
      const breakdown = [];
      
      Object.entries(features).forEach(([feature, value]) => {
        const weight = weights[feature];
        const contribution = value * weight;
        totalScore += contribution;
        
        breakdown.push({
          feature,
          value,
          weight,
          contribution,
          percentage: `${(contribution * 100).toFixed(1)}%`
        });
      });

      mockResponse.hasSimilarRecipes = true;
      mockResponse.warning = {
        type: 'moderate_similarity',
        message: 'Some similar recipes were found. You may want to check them first.',
        matches: [{
          recipe: {
            id: 'test-1',
            title: 'Pasta Carbonara',
            cuisine: 'Italian',
            readyInMinutes: 30,
            difficulty: 'Medium'
          },
          score: totalScore,
          scorePercentage: `${(totalScore * 100).toFixed(1)}%`,
          features,
          weights,
          breakdown
        }]
      };
      mockResponse.autofillSuggestion = {
        ingredients: ['pasta', 'eggs', 'cheese', 'bacon'],
        instructions: ['Boil pasta', 'Cook bacon', 'Mix with eggs and cheese'],
        cookingTime: 30,
        servings: 4,
        difficulty: 'Medium',
        cuisine: 'Italian',
        dietaryTags: ['gluten-free']
      };
      mockResponse.allMatches = mockResponse.warning.matches;
    }

    // If title contains "margarita", simulate a similar recipe with dynamic scoring
    if (title.toLowerCase().includes('margarita')) {
      // Simulate dynamic feature extraction for high similarity
      const features = {
        titleSimilarity: 1.0,
        ingredientSimilarity: 0.9,
        cuisineMatch: 1.0,
        cookingTimeMatch: 0.8,
        difficultyMatch: 1.0,
        dietaryMatch: 0.9
      };

      // Simulate learned weights
      const weights = {
        titleSimilarity: 0.3,
        ingredientSimilarity: 0.4,
        cuisineMatch: 0.1,
        cookingTimeMatch: 0.1,
        difficultyMatch: 0.05,
        dietaryMatch: 0.05
      };

      // Calculate dynamic similarity score
      let totalScore = 0;
      const breakdown = [];
      
      Object.entries(features).forEach(([feature, value]) => {
        const weight = weights[feature];
        const contribution = value * weight;
        totalScore += contribution;
        
        breakdown.push({
          feature,
          value,
          weight,
          contribution,
          percentage: `${(contribution * 100).toFixed(1)}%`
        });
      });

      mockResponse.hasSimilarRecipes = true;
      mockResponse.warning = {
        type: 'high_similarity',
        message: 'A very similar recipe already exists. Are you sure you want to continue?',
        matches: [{
          recipe: {
            id: 'margarita-1',
            title: 'Margarita',
            cuisine: 'Mexican',
            readyInMinutes: 5,
            difficulty: 'Easy'
          },
          score: totalScore,
          scorePercentage: `${(totalScore * 100).toFixed(1)}%`,
          features,
          weights,
          breakdown
        }]
      };
      mockResponse.autofillSuggestion = {
        ingredients: ['tequila', 'lime juice', 'triple sec', 'salt'],
        instructions: ['Rim glass with salt', 'Shake ingredients with ice', 'Strain into glass'],
        cookingTime: 5,
        servings: 1,
        difficulty: 'Easy',
        cuisine: 'Mexican',
        dietaryTags: ['gluten-free', 'vegan']
      };
      mockResponse.allMatches = mockResponse.warning.matches;
    }


    res.json(mockResponse);

  } catch (error) {
    console.error('Error in test similarity:', error);
    res.status(500).json({ error: 'Failed to check similarity' });
  }
});

// Check for similar recipes during creation
router.post('/check-similarity', authenticateToken, async (req, res) => {
  try {

    const { title, ingredients, cuisine, readyInMinutes } = req.body;
    const userId = req.user.id;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const inputRecipe = {
      title,
      ingredients: ingredients || [],
      cuisine: cuisine || '',
      readyInMinutes: readyInMinutes || 30
    };

    const { fetchRelevantRecipes, getUserWeights } = require('../similarity/storage');
    const candidates = await fetchRelevantRecipes(title, cuisine, userId);

    const userWeights = await getUserWeights(userId);
    const similarityWeights = {
      title: userWeights.title ?? 0.4,
      ingredients: userWeights.ingredients ?? 0.6
    };

    const { generateSimilarityWarning } = require('../utils/similarityUtils');
    const warning = generateSimilarityWarning(inputRecipe, candidates, similarityWeights, 0.3);

    if (warning) {
      
      // Prepare autofill suggestions for the best match
      let autofillSuggestion = null;
      if (warning.matches.length > 0 && warning.matches[0].score > 0.6) {
        const bestMatch = warning.matches[0].recipe;
        autofillSuggestion = {
          ingredients: bestMatch.ingredients || bestMatch.extendedIngredients || [],
          instructions: bestMatch.instructions || bestMatch.analyzedInstructions || [],
          cookingTime: bestMatch.readyInMinutes || bestMatch.cookTime,
          servings: bestMatch.servings || bestMatch.yield,
          difficulty: bestMatch.difficulty,
          cuisine: bestMatch.cuisine,
          dietaryTags: bestMatch.diets || bestMatch.dietaryTags || [],
          nutritionInfo: bestMatch.nutrition || bestMatch.nutritionalInfo || {}
        };
      }
      

      
      return res.json({
        hasSimilarRecipes: true,
        warning,
        autofillSuggestion,
        allMatches: warning.matches
      });
    }


    return res.json({
      hasSimilarRecipes: false,
      warning: null,
      autofillSuggestion: null,
      allMatches: []
    });

  } catch (error) {
    console.error('❌ Error in similarity check:', error);
    res.status(500).json({ error: 'Failed to check similarity' });
  }
});

// Record user's decision about similarity warning
router.post('/similarity-decision', authenticateToken, async (req, res) => {
  const { recipe1Data, recipe2Data, decision, judgment } = req.body;
  const userId = req.user.id;

  if (!recipe1Data || !recipe2Data || !decision) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // If user provided a judgment, record it for learning
    if (judgment && (judgment === 'similar' || judgment === 'not_similar')) {
      await trackSimilarityInteraction(
        userId,
        recipe1Data.id || 'new-recipe',
        recipe2Data.id || 'existing-recipe',
        judgment
      );
    }

    res.json({ 
      success: true, 
      message: 'Decision recorded',
      decision 
    });

  } catch (error) {
    console.error('Error recording similarity decision:', error);
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

// Get autofill suggestions after user continues with recipe creation
router.post('/get-autofill-suggestions', authenticateToken, async (req, res) => {
  try {
    const { title, ingredients, cuisine, readyInMinutes } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }



    // Get suggestions from Spoonacular API
    const spoonacularSuggestions = await getSpoonacularAutofillSuggestions(title);
    
    // Get suggestions from user's own recipes
    const userSuggestions = await getUserAutofillSuggestions(title, userId);

    // Combine and rank suggestions
    const allSuggestions = [...spoonacularSuggestions, ...userSuggestions];
    const rankedSuggestions = rankAutofillSuggestions(allSuggestions);

    // Return the best suggestion
    const bestSuggestion = rankedSuggestions.length > 0 ? rankedSuggestions[0] : null;



    res.json({
      success: true,
      suggestion: bestSuggestion,
      totalSuggestions: rankedSuggestions.length
    });

  } catch (error) {
    console.error('❌ Error getting autofill suggestions:', error);
    res.status(500).json({ error: 'Failed to get autofill suggestions' });
  }
});

// Helper function to get Spoonacular autofill suggestions
async function getSpoonacularAutofillSuggestions(title) {
  try {
    const axios = require('axios');
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query: title,
        number: 3,
        addRecipeInformation: true,
        fillIngredients: true,
        instructionsRequired: false,
        addRecipeNutrition: true,
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });

    const recipes = response.data.results || [];
    console.log('🔍 [AUTOFILL] Raw Spoonacular response:', JSON.stringify(recipes[0], null, 2));
    const mappedRecipes = recipes.map(recipe => {
      // Clean up ingredients - filter out instruction-like entries
      const rawIngredients = recipe.extendedIngredients?.map(i => i.original) || [];
      const cleanedIngredients = [];
      const extractedInstructions = [];
      
      // First, try to get instructions from analyzedInstructions
      let apiInstructions = [];
      if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
        apiInstructions = recipe.analyzedInstructions[0].steps?.map(s => s.step) || [];
      } else if (recipe.instructions) {
        // If no analyzedInstructions, try raw instructions
        // Split by common instruction separators
        const instructionText = recipe.instructions;
        if (instructionText.includes('.')) {
          apiInstructions = instructionText.split('.').map(step => step.trim()).filter(step => step.length > 0);
        } else if (instructionText.includes('\n')) {
          apiInstructions = instructionText.split('\n').map(step => step.trim()).filter(step => step.length > 0);
        } else {
          apiInstructions = [instructionText];
        }
      }
      
      console.log('🔍 [AUTOFILL] Raw ingredients before cleaning:', rawIngredients);
      
      // Clean ingredients - only filter out obvious instruction-like entries
      rawIngredients.forEach(ingredient => {
        const trimmed = ingredient.trim();
        
        // Only consider it an instruction if it's clearly a cooking step
        // Look for action verbs that indicate cooking steps, not ingredient descriptions
        const isInstruction = 
          trimmed.toLowerCase().includes('drain') || 
          trimmed.toLowerCase().includes('combine') ||
          trimmed.toLowerCase().includes('prepare') ||
          trimmed.toLowerCase().includes('heat') ||
          trimmed.toLowerCase().includes('assemble') ||
          trimmed.toLowerCase().includes('transfer') ||
          trimmed.toLowerCase().includes('wrap') ||
          trimmed.toLowerCase().includes('set aside') ||
          trimmed.toLowerCase().includes('mix') ||
          trimmed.toLowerCase().includes('stir') ||
          trimmed.toLowerCase().includes('cook') ||
          trimmed.toLowerCase().includes('bake') ||
          trimmed.toLowerCase().includes('fry') ||
          trimmed.toLowerCase().includes('boil') ||
          trimmed.toLowerCase().includes('simmer') ||
          trimmed.toLowerCase().includes('add') ||
          trimmed.toLowerCase().includes('pour') ||
          trimmed.toLowerCase().includes('place') ||
          trimmed.toLowerCase().includes('put') ||
          trimmed.toLowerCase().includes('arrange') ||
          trimmed.toLowerCase().includes('season') ||
          trimmed.toLowerCase().includes('sprinkle') ||
          trimmed.toLowerCase().includes('garnish');
        
        // Don't consider it an instruction if it contains common ingredient words
        const isIngredient = 
          trimmed.toLowerCase().includes('cup') ||
          trimmed.toLowerCase().includes('tablespoon') ||
          trimmed.toLowerCase().includes('teaspoon') ||
          trimmed.toLowerCase().includes('pound') ||
          trimmed.toLowerCase().includes('lb') ||
          trimmed.toLowerCase().includes('ounce') ||
          trimmed.toLowerCase().includes('oz') ||
          trimmed.toLowerCase().includes('gram') ||
          trimmed.toLowerCase().includes('g') ||
          trimmed.toLowerCase().includes('kilogram') ||
          trimmed.toLowerCase().includes('kg') ||
          trimmed.toLowerCase().includes('clove') ||
          trimmed.toLowerCase().includes('slice') ||
          trimmed.toLowerCase().includes('piece') ||
          trimmed.toLowerCase().includes('can') ||
          trimmed.toLowerCase().includes('jar') ||
          trimmed.toLowerCase().includes('bottle') ||
          trimmed.toLowerCase().includes('package') ||
          trimmed.toLowerCase().includes('bag') ||
          trimmed.toLowerCase().includes('bunch') ||
          trimmed.toLowerCase().includes('head') ||
          trimmed.toLowerCase().includes('stalk') ||
          trimmed.toLowerCase().includes('sprig') ||
          trimmed.toLowerCase().includes('pinch') ||
          trimmed.toLowerCase().includes('dash') ||
          trimmed.toLowerCase().includes('to taste');
        
        // If it's clearly an instruction and not an ingredient, extract it
        if (isInstruction && !isIngredient) {
          const cleanInstruction = trimmed.replace(/^\d+/, '').trim();
          if (cleanInstruction) {
            extractedInstructions.push(cleanInstruction);
          }
        } else {
          // Keep it as an ingredient
          cleanedIngredients.push(ingredient);
        }
      });

      const mapped = {
        source: 'spoonacular',
        title: recipe.title,
        ingredients: cleanedIngredients,
        instructions: apiInstructions.length > 0 ? apiInstructions : (extractedInstructions.length > 0 ? extractedInstructions : []),
        image: recipe.image,
        cookingStats: {
          readyInMinutes: recipe.readyInMinutes,
          calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount,
          servings: recipe.servings
        },
        confidence: 0.8
      };
      
      console.log('🔍 [AUTOFILL] Mapped recipe:', {
        title: mapped.title,
        ingredientsCount: mapped.ingredients.length,
        instructionsCount: mapped.instructions.length,
        ingredients: mapped.ingredients.slice(0, 3), // Show first 3
        instructions: mapped.instructions.slice(0, 3) // Show first 3
      });
      
      return mapped;
    });
    
    return mappedRecipes;
  } catch (error) {
    console.log('❌ Spoonacular API error:', error.message);
    
    // Provide fallback suggestions when external API fails
    const fallbackSuggestions = getFallbackSuggestions(title);

    return fallbackSuggestions;
  }
}

// Fallback suggestions when external API is unavailable
function getFallbackSuggestions(title) {
  const titleLower = title.toLowerCase();
  
  // Basic fallback suggestions based on common recipe types
  const fallbacks = {
    'burger': {
      ingredients: [
        'Ground beef (80/20)',
        'Hamburger buns',
        'Lettuce',
        'Tomato',
        'Onion',
        'Cheese slices',
        'Salt and pepper',
        'Cooking oil'
      ],
      instructions: [
        'Form ground beef into patties',
        'Season with salt and pepper',
        'Cook on medium-high heat for 4-5 minutes per side',
        'Add cheese in last minute of cooking',
        'Toast buns lightly',
        'Assemble burger with toppings'
      ],
      cookingStats: {
        readyInMinutes: 20,
        calories: 450,
        servings: 1
      }
    },
    'pasta': {
      ingredients: [
        'Pasta (spaghetti, penne, etc.)',
        'Olive oil',
        'Garlic',
        'Onion',
        'Tomato sauce',
        'Parmesan cheese',
        'Salt and pepper',
        'Fresh herbs (basil, parsley)'
      ],
      instructions: [
        'Boil pasta according to package directions',
        'Sauté garlic and onion in olive oil',
        'Add tomato sauce and simmer',
        'Combine pasta with sauce',
        'Top with cheese and herbs'
      ],
      cookingStats: {
        readyInMinutes: 25,
        calories: 350,
        servings: 2
      }
    },
    'salad': {
      ingredients: [
        'Mixed greens',
        'Cucumber',
        'Tomato',
        'Red onion',
        'Olive oil',
        'Balsamic vinegar',
        'Salt and pepper',
        'Optional: nuts, cheese, protein'
      ],
      instructions: [
        'Wash and prepare vegetables',
        'Chop vegetables to desired size',
        'Combine in large bowl',
        'Dress with olive oil and vinegar',
        'Season with salt and pepper',
        'Toss gently and serve'
      ],
      cookingStats: {
        readyInMinutes: 10,
        calories: 150,
        servings: 1
      }
    }
  };

  // Find matching fallback
  for (const [key, suggestion] of Object.entries(fallbacks)) {
    if (titleLower.includes(key)) {
      const fallbackSuggestion = {
        source: 'fallback',
        title: title,
        ingredients: suggestion.ingredients,
        instructions: suggestion.instructions,
        image: null,
        cookingStats: suggestion.cookingStats,
        confidence: 0.6
      };
      

      
      return [fallbackSuggestion];
    }
  }

  // Generic fallback for any recipe
  return [{
    source: 'fallback',
    title: title,
    ingredients: [
      'Main ingredient',
      'Seasoning',
      'Cooking oil',
      'Salt and pepper'
    ],
    instructions: [
      'Prepare main ingredients',
      'Season to taste',
      'Cook according to recipe type',
      'Serve hot'
    ],
    image: null,
    cookingStats: {
      readyInMinutes: 30,
      calories: 300,
      servings: 2
    },
    confidence: 0.4
  }];
}

// Helper function to get user's own recipe suggestions
async function getUserAutofillSuggestions(title, userId) {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .ilike('title', `%${title}%`)
      .eq('user_id', userId)
      .limit(3);

    if (error || !recipes) return [];

    return recipes.map(recipe => ({
      source: 'user_created',
      title: recipe.title,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      image: recipe.image,
      cookingStats: {
        readyInMinutes: recipe.cookTime,
        calories: recipe.calories,
        servings: recipe.servings
      },
      confidence: 0.9
    }));
  } catch (error) {

    return [];
  }
}

// Helper function to rank autofill suggestions
function rankAutofillSuggestions(suggestions) {
  return suggestions
    .filter(s => s.ingredients.length > 0 || s.instructions.length > 0)
    .sort((a, b) => {
      // Sort by confidence first
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      // Then by completeness (more data = higher rank)
      const aCompleteness = (a.ingredients.length > 0 ? 1 : 0) + (a.instructions.length > 0 ? 1 : 0);
      const bCompleteness = (b.ingredients.length > 0 ? 1 : 0) + (b.instructions.length > 0 ? 1 : 0);
      return bCompleteness - aCompleteness;
    });
}

// Get autofill data for a specific recipe
router.post('/autofill-data', authenticateToken, async (req, res) => {
  const { recipeId } = req.body;
  const userId = req.user.id;

  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  try {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (error || !recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const autofillData = {
      ingredients: recipe.ingredients || recipe.extendedIngredients || [],
      instructions: recipe.instructions || recipe.analyzedInstructions || [],
      cookingTime: recipe.readyInMinutes || recipe.cookTime,
      servings: recipe.servings || recipe.yield,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      dietaryTags: recipe.diets || recipe.dietaryTags || [],
      nutritionInfo: recipe.nutrition || recipe.nutritionalInfo || {},
      cookingMethod: recipe.cookingMethod,
      cookingStyle: recipe.cookingStyle,
      season: recipe.season
    };

    res.json({
      success: true,
      autofillData,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image
      }
    });

  } catch (error) {
    console.error('Error getting autofill data:', error);
    res.status(500).json({ error: 'Failed to get autofill data' });
  }
});

module.exports = router;
