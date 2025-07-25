// utils/computeOptimizedSimilarity.js

function normalizeTitle(title) {
  return title?.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim() || '';
}

function jaccardSimilarity(arr1, arr2) {
  const setA = new Set(arr1.map(i => i.toLowerCase().trim()).filter(Boolean));
  const setB = new Set(arr2.map(i => i.toLowerCase().trim()).filter(Boolean));

  const intersection = new Set([...setA].filter(i => setB.has(i)));
  const union = new Set([...setA, ...setB]);

  return union.size ? intersection.size / union.size : 0;
}

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

module.exports = { computeOptimizedSimilarity }; 