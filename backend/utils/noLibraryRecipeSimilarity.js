function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
}

function jaccardSimilarity(arr1, arr2) {
  const setA = new Set(arr1.map(i => i.toLowerCase().trim()));
  const setB = new Set(arr2.map(i => i.toLowerCase().trim()));
  let intersection = 0;
  for (let item of setA) if (setB.has(item)) intersection++;
  const unionSize = setA.size + setB.size - intersection;
  return intersection / unionSize;
}

function computeOptimizedSimilarity(newRecipe, existingRecipe) {
  const titleScore = normalizeTitle(newRecipe.title) === normalizeTitle(existingRecipe.title) ? 1 : 0;
  const ingredientsScore = jaccardSimilarity(newRecipe.ingredients || [], existingRecipe.ingredients || []);
  const finalScore = 0.4 * titleScore + 0.6 * ingredientsScore;
  return { score: finalScore, titleScore, ingredientsScore };
}

module.exports = { computeOptimizedSimilarity }; 