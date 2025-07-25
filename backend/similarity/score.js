/**
 * Dynamic scoring engine for recipe similarity
 */

/**
 * Normalize weights so they sum to 1
 */
function normalizeWeights(weights) {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  if (totalWeight === 0) {
    // If all weights are 0, use equal weights
    const equalWeight = 1 / Object.keys(weights).length;
    const normalized = {};
    Object.keys(weights).forEach(key => {
      normalized[key] = equalWeight;
    });
    return normalized;
  }
  
  const normalized = {};
  Object.keys(weights).forEach(key => {
    normalized[key] = weights[key] / totalWeight;
  });
  
  return normalized;
}

/**
 * Compute similarity score with detailed breakdown
 */
function computeSimilarityScore(features, weights) {
  // Normalize weights
  const normalizedWeights = normalizeWeights(weights);
  
  // Calculate weighted score and breakdown
  let totalScore = 0;
  const breakdown = [];
  
  Object.entries(features).forEach(([feature, value]) => {
    const weight = normalizedWeights[feature] || 0;
    const contribution = value * weight;
    totalScore += contribution;
    
    breakdown.push({
      feature,
      featureValue: value,
      weight: weight,
      contribution: contribution,
      percentage: `${(contribution * 100).toFixed(1)}%`
    });
  });
  
  return {
    score: totalScore,
    scorePercentage: `${(totalScore * 100).toFixed(1)}%`,
    breakdown: breakdown,
    normalizedWeights: normalizedWeights
  };
}

/**
 * Determine warning type based on score
 */
function getWarningType(score) {
  if (score >= 0.8) return 'high_similarity';
  if (score >= 0.6) return 'moderate_similarity';
  return null;
}

/**
 * Get warning message based on type
 */
function getWarningMessage(type) {
  switch (type) {
    case 'high_similarity':
      return 'A very similar recipe already exists. Are you sure you want to continue?';
    case 'moderate_similarity':
      return 'Some similar recipes were found. You may want to check them first.';
    default:
      return null;
  }
}

module.exports = {
  computeSimilarityScore,
  normalizeWeights,
  getWarningType,
  getWarningMessage
}; 