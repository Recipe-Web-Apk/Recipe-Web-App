// utils/generateSimilarityWarning.js
const { computeOptimizedSimilarity } = require('./computeOptimizedSimilarity');

function generateSimilarityWarning(inputRecipe, candidates, weights = { title: 0.4, ingredients: 0.6 }) {
  const threshold = 0.3; // Tune this as needed
  const matches = [];

  for (const candidate of candidates) {
    const result = computeOptimizedSimilarity(inputRecipe, candidate, weights);



    if (result.score >= threshold) {
      matches.push({
        recipe: candidate,
        score: result.score,
        breakdown: [
          {
            feature: 'title',
            value: result.titleScore,
            weight: weights.title,
            contribution: result.breakdown.title.contribution
          },
          {
            feature: 'ingredients',
            value: result.ingredientsScore,
            weight: weights.ingredients,
            contribution: result.breakdown.ingredients.contribution
          }
        ]
      });
    }
  }

  if (matches.length > 0) {
    return {
      type: 'SIMILAR_RECIPE',
      message: `Found ${matches.length} recipe(s) that look similar.`,
      matches
    };
  }

  return null;
}

module.exports = { generateSimilarityWarning }; 