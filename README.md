# Recipe-Web-App

Approach for Technical Challenge 1
Recipe Similarity Detection and Warning System 
Step 1: Recipe Similarity Detection
 Goal: Check if a newly added recipe is similar to existing ones by comparing:
 - title (string) 
- ingredients (array of strings) 
Backend: /api/similar-recipes 
1. Install required package: npm install string-similarity 
2. Create utils/recipeSimilarity.js: 
const stringSimilarity = require('string-similarity'); 
function jaccardSimilarity(arr1, arr2) { const setA = new Set(arr1.map(i => i.toLowerCase().trim())); 
const setB = new Set(arr2.map(i => i.toLowerCase().trim())); 
const intersection = [...setA].filter(item => setB.has(item)); 
const union = new Set([...setA, ...setB]);
return intersection.length / union.size; 
}
 function computeHybridRecipeSimilarity(newRecipe, existingRecipe) { 
const titleSim = stringSimilarity.compareTwoStrings( newRecipe.title.toLowerCase(), existingRecipe.title.toLowerCase() ); 
const ingredientsSim = jaccardSimilarity( newRecipe.ingredients, existingRecipe.ingredients ); 
const finalScore = 0.4 * titleSim + 0.6 * ingredientsSim; 
return { score: finalScore, titleSim, ingredientsSim }; 
} 
module.exports = { computeHybridRecipeSimilarity }; 

3. Backend Route: routes/similarRecipes.js 
const express = require('express'); 
const router = express.Router(); 
const { computeHybridRecipeSimilarity } = require('../utils/recipeSimilarity'); 
const supabase = require('../supabaseClient'); 
router.post('/similar-recipes', async (req, res) => { 
const { title, ingredients } = req.body; if (!title || !ingredients) {
 return res.status(400).json({ error: 'Missing fields' }); 
} 
const { data: recipes, error } = await supabase 
.from('recipes') 
.select('id, title, ingredients'); 
if (error) 
return res.status(500).json({ error: 'Failed to fetch recipes' }); 
const input = { title, ingredients }; 
const similarities = recipes.map(recipe => { 
const { score, titleSim, ingredientsSim } = computeHybridRecipeSimilarity(input, recipe);
 return { recipe, score, titleSim, ingredientsSim }; 
}); 
const topMatches = similarities 
.filter(r => r.score > 0.6) 
.sort((a, b) => b.score - a.score) 
.slice(0, 5); 
res.json(topMatches); 
}); 
module.exports = router; 

Step 2: Frontend Integration (React) 
1. State Setup in Upload Form 
const [similarRecipes, setSimilarRecipes] = useState([]); 
const [showWarning, setShowWarning] = useState(false);

 2. Function to Check Similarity 
const checkForSimilarRecipes = async () => { 
const res = await fetch('/api/similar-recipes', { 
method: 'POST', 
headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ title, ingredients }) }); 
const data = await res.json(); if (data && data.length > 0) { 
setSimilarRecipes(data); setShowWarning(true); 
return true; } 
else { setSimilarRecipes([]); setShowWarning(false); 
return false; } };
3. Use It on Submit 
const handleSubmit = async (e) => { 
e.preventDefault(); 
const isSimilar = await checkForSimilarRecipes(); 
if (isSimilar) 
return; submitRecipeToBackend(); }; 

Step 3: Warning Message UI Basic Warning UI {showWarning && (<h4>⚠️Possible Duplicate</h4>
<p>This recipe looks similar to ones already in the database:</p>
{similarRecipes.map(({ recipe, score }) => ( {recipe.title} – Similarity: {Math.round(score * 100)}%
))} setShowWarning(false)}>Ignore & Submit Anyway
)}
