/**
 * Unified similarity utilities for recipe comparison
 * Consolidates all similarity functions into a single, clean implementation
 */

// Title normalization function
function normalizeTitle(title) {
  return title?.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim() || '';
}

// Jaccard similarity for ingredients
function jaccardSimilarity(arr1, arr2) {
  const setA = new Set(arr1.map(i => i.toLowerCase().trim()).filter(Boolean));
  const setB = new Set(arr2.map(i => i.toLowerCase().trim()).filter(Boolean));

  const intersection = new Set([...setA].filter(i => setB.has(i)));
  const union = new Set([...setA, ...setB]);

  return union.size ? intersection.size / union.size : 0;
}

// Compute optimized similarity with dynamic weights
function computeOptimizedSimilarity(newRecipe, existingRecipe, weights = { title: 0.4, ingredients: 0.6 }) {
  const normNew = normalizeTitle(newRecipe.title);
  const normExist = normalizeTitle(existingRecipe.title);

  let titleScore = 0;

  // Exact and partial match heuristics
  if (normNew === normExist) {
    titleScore = 1;
  } else if (normExist.includes(normNew)) {
    titleScore = 0.9;
  } else if (normNew.includes(normExist)) {
    titleScore = 0.8;
  } else if (
    normNew.length >= 3 &&
    (normExist.includes(normNew) || normNew.includes(normExist))
  ) {
    titleScore = 0.7;
  }

  // Fallback to token-based fuzzy matching
  if (titleScore === 0) {
    const tokensNew = normNew.split(' ');
    const tokensExist = normExist.split(' ');
    const intersection = tokensNew.filter(token => tokensExist.includes(token));
    const union = new Set([...tokensNew, ...tokensExist]);
    titleScore = union.size ? intersection.length / union.size : 0;
  }

  const ingredientsNew = (newRecipe.ingredients || []).filter(i => i && i.trim());
  const ingredientsExist = (existingRecipe.ingredients || []).filter(i => i && i.trim());

  const ingredientsScore = jaccardSimilarity(ingredientsNew, ingredientsExist);

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

// Generate similarity warning with configurable threshold
function generateSimilarityWarning(inputRecipe, candidates, weights = { title: 0.4, ingredients: 0.6 }, threshold = 0.3) {
  const matches = [];

  for (const candidate of candidates) {
    const result = computeOptimizedSimilarity(inputRecipe, candidate, weights);

    if (result.score >= threshold) {
      matches.push({
        recipe: candidate,
        score: result.score,
        scorePercentage: Math.round(result.score * 100),
        titleScore: result.titleScore,
        ingredientsScore: result.ingredientsScore,
        features: { title: result.titleScore, ingredients: result.ingredientsScore },
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
        ],
        weights: weights
      });
    }
  }

  if (matches.length > 0) {
    // Sort by similarity score
    matches.sort((a, b) => b.score - a.score);

    const topMatch = matches[0];
    const warningType = topMatch.score > 0.6 ? 'high_similarity' : 
                       topMatch.score > 0.4 ? 'moderate_similarity' : 'low_similarity';

    return {
      type: warningType,
      message: `Found ${matches.length} recipe(s) that look similar.`,
      matches: matches.slice(0, 5) // Send top 5 matches
    };
  }

  return null;
}

module.exports = {
  normalizeTitle,
  jaccardSimilarity,
  computeOptimizedSimilarity,
  generateSimilarityWarning
}; 