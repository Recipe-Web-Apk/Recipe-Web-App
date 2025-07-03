const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPOONACULAR_API_KEY;
const FILE_PATH = 'recipes.json';
const BATCH_SIZE = 10; // Safe default for free tier

const fetchRecipes = async () => {
  try {
    // Step 1: Fetch recipes from API
    const response = await axios.get('https://api.spoonacular.com/recipes/random', {
      params: {
        number: BATCH_SIZE,
        apiKey: API_KEY
      }
    });

    const newRecipes = response.data.recipes;

    // Step 2: Format recipes (extract only useful fields)
    const simplified = newRecipes.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      summary: r.summary,
      readyInMinutes: r.readyInMinutes,
      servings: r.servings,
      instructions: r.instructions,
      ingredients: r.extendedIngredients?.map(i => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit
      })),
      dishTypes: r.dishTypes,
      cuisines: r.cuisines,
      diets: r.diets,
      sourceUrl: r.sourceUrl
    }));

    // Step 3: Load existing data (if available)
    let existing = [];
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH);
      existing = JSON.parse(raw);
    }

    const existingIds = new Set(existing.map(r => r.id));

    // Step 4: Filter out duplicates
    const unique = simplified.filter(r => !existingIds.has(r.id));
    const updated = [...existing, ...unique];

    // Step 5: Save updated list to file
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2));

    console.log(`✅ Fetched ${unique.length} new recipes. Total saved: ${updated.length}`);
  } catch (err) {
    console.error('❌ Failed to fetch recipes:', err.message);
  }
};

fetchRecipes();
