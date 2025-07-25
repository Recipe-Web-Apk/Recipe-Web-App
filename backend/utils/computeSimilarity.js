// Simple title normalization
function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
}

// Jaccard similarity for ingredients
function jaccardSimilarity(arr1, arr2) {
  const setA = new Set(arr1.map(i => i.toLowerCase().trim()));
  const setB = new Set(arr2.map(i => i.toLowerCase().trim()));
  let intersection = 0;
  for (let item of setA) if (setB.has(item)) intersection++;
  const unionSize = setA.size + setB.size - intersection;
  return unionSize === 0 ? 0 : intersection / unionSize;
}

// Compute similarity with dynamic weights
function computeOptimizedSimilarity(newRecipe, existingRecipe, weights = { title: 0.4, ingredients: 0.6 }) {
  const normNew = normalizeTitle(newRecipe.title);
  const normExist = normalizeTitle(existingRecipe.title);
  
  let titleScore = 0;
  if (normNew === normExist) {
    titleScore = 1;
  } else if (normExist.includes(normNew)) {
    // Search term is found in existing title (e.g., "pasta" in "Chicken Pasta")
    titleScore = 0.9;
  } else if (normNew.includes(normExist)) {
    // Existing title is found in search term
    titleScore = 0.8;
  } else if (
    normNew.length >= 3 &&
    (normExist.includes(normNew) || normNew.includes(normExist))
  ) {
    titleScore = 0.7;
  }
  
  const ingredientsScore = jaccardSimilarity(newRecipe.ingredients || [], existingRecipe.ingredients || []);
  
  // Use dynamic weights instead of hardcoded formula
  const finalScore = weights.title * titleScore + weights.ingredients * ingredientsScore;
  
  return { 
    score: finalScore, 
    titleScore, 
    ingredientsScore,
    breakdown: {
      title: { score: titleScore, weight: weights.title, contribution: weights.title * titleScore },
      ingredients: { score: ingredientsScore, weight: weights.ingredients, contribution: weights.ingredients * ingredientsScore }
    }
  };
}

// Generate similarity warning with dynamic scoring
function generateSimilarityWarning(newRecipe, existingRecipes, userWeights = { title: 0.8, ingredients: 0.2 }) {
  const results = [];

  for (const existing of existingRecipes) {
    const { score, titleScore, ingredientsScore, breakdown } = computeOptimizedSimilarity(newRecipe, existing, userWeights);

    if (score > 0.1) {
      results.push({
        recipe: existing,
        score,
        scorePercentage: Math.round(score * 100),
        titleScore,
        ingredientsScore,
        features: { title: titleScore, ingredients: ingredientsScore },
        breakdown,
        weights: userWeights
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  const topMatch = results[0];
  if (!topMatch) return null;

  const warningType = topMatch.score > 0.3 ? 'high' : 'moderate';

  return {
    type: warningType,
    message:
      warningType === 'high'
        ? 'This recipe looks almost identical to an existing one.'
        : 'This recipe looks similar to one you have already added.',
    matches: results.slice(0, 5), // Send top 5 matches
  };
}

module.exports = {
  computeOptimizedSimilarity,
  generateSimilarityWarning,
  normalizeTitle,
  jaccardSimilarity,
}; 