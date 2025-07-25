/**
 * Learning module for similarity weight updates
 */

const { MIN_INTERACTIONS_TO_LEARN, LEARNING_RATE, MIN_WEIGHT, MAX_WEIGHT } = require('./constants');

/**
 * Check if user has enough interactions to start learning
 */
function shouldLearn(interactionCount) {
  return interactionCount >= MIN_INTERACTIONS_TO_LEARN;
}

/**
 * Perform online weight update using simple linear update
 */
function onlineUpdateWeights(current, features, score, target) {
  const updated = { ...current };
  
  // Calculate error
  const error = target - score;
  
  // Update each weight using gradient descent
  Object.keys(features).forEach(feature => {
    if (updated[feature] !== undefined) {
      // Gradient: ∂E/∂w = -2 * error * feature_value
      const gradient = -2 * error * features[feature];
      
      // Update weight: w = w - learning_rate * gradient
      updated[feature] = updated[feature] - LEARNING_RATE * gradient;
      
      // Clamp weight between MIN_WEIGHT and MAX_WEIGHT
      updated[feature] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, updated[feature]));
    }
  });
  
  return updated;
}

/**
 * Determine target value based on user decision
 */
function getTargetValue(decision) {
  switch (decision) {
    case 'ignored':
      // User ignored the warning, so similarity was lower than predicted
      return 0.3;
    case 'viewed':
      // User viewed the recipe, moderate similarity
      return 0.6;
    case 'used_autofill':
      // User used autofill, high similarity
      return 0.9;
    default:
      return 0.5; // Neutral
  }
}

/**
 * Update user weights based on interaction
 */
async function updateUserWeights(userId, currentWeights, features, score, decision) {
  const target = getTargetValue(decision);
  const updatedWeights = onlineUpdateWeights(currentWeights, features, score, target);
  
  return updatedWeights;
}

module.exports = {
  shouldLearn,
  onlineUpdateWeights,
  getTargetValue,
  updateUserWeights
}; 