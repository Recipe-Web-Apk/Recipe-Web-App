const express = require('express');
const axios = require('axios');
const router = express.Router();

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