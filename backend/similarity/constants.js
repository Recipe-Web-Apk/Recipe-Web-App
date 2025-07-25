/**
 * Constants for similarity system
 */

// Similarity thresholds
const SIMILARITY_THRESHOLDS = {
  HIGH: 0.8,
  MODERATE: 0.6
};

// Default feature weights (will be personalized per user)
const DEFAULT_WEIGHTS = {
  title: 0.4,
  ingredients: 0.4,
  cuisine: 0.1,
  time: 0.1
};

// Learning parameters
const MIN_INTERACTIONS_TO_LEARN = 10;
const LEARNING_RATE = 0.05;

// Weight constraints
const MIN_WEIGHT = 0.01;
const MAX_WEIGHT = 0.9;

module.exports = {
  SIMILARITY_THRESHOLDS,
  DEFAULT_WEIGHTS,
  MIN_INTERACTIONS_TO_LEARN,
  LEARNING_RATE,
  MIN_WEIGHT,
  MAX_WEIGHT
}; 