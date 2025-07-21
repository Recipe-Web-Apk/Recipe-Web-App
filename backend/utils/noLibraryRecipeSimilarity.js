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
  const normNew = normalizeTitle(newRecipe.title);
  const normExist = normalizeTitle(existingRecipe.title);
  let titleScore = 0;
  if (normNew === normExist) {
    titleScore = 1;
  } else if (
    normNew.length >= 3 &&
    (normExist.includes(normNew) || normNew.includes(normExist))
  ) {
    titleScore = 0.7;
  }
  const ingredientsScore = jaccardSimilarity(newRecipe.ingredients || [], existingRecipe.ingredients || []);
  const finalScore = 0.4 * titleScore + 0.6 * ingredientsScore;
  return { score: finalScore, titleScore, ingredientsScore };
}

module.exports = { computeOptimizedSimilarity, normalizeTitle }; 