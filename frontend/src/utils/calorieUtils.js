/**
 * Utility functions for handling calorie information from Spoonacular API
 */

/**
 * Extract calories from a recipe object returned by Spoonacular API
 * @param {Object} recipe - Recipe object from Spoonacular
 * @returns {number|null} - Calories per serving, or null if not available
 */
export function extractCalories(recipe) {
  if (!recipe) return null;

  // Check multiple possible locations for calorie data
  const calorieSources = [
    // Direct calories property
    recipe.calories,
    // Nutrition data from Spoonacular
    recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount,
    // Alternative nutrition structure
    recipe.nutrition?.calories,
    // Nutrition summary
    recipe.nutritionSummary?.nutrients?.find(n => n.name === 'Calories')?.amount
  ];

  // Find the first valid calorie value
  const calories = calorieSources.find(source => 
    source !== undefined && source !== null && !isNaN(source)
  );

  return calories ? Math.round(parseFloat(calories)) : null;
}

/**
 * Extract nutrition information from a recipe object
 * @param {Object} recipe - Recipe object from Spoonacular
 * @returns {Object} - Nutrition information object
 */
export function extractNutrition(recipe) {
  if (!recipe) return null;

  const nutrition = recipe.nutrition || {};
  const nutrients = nutrition.nutrients || [];

  // Extract common nutrition values
  const nutritionData = {
    calories: extractCalories(recipe),
    protein: nutrients.find(n => n.name === 'Protein')?.amount || null,
    fat: nutrients.find(n => n.name === 'Fat')?.amount || null,
    carbohydrates: nutrients.find(n => n.name === 'Carbohydrates')?.amount || null,
    fiber: nutrients.find(n => n.name === 'Fiber')?.amount || null,
    sugar: nutrients.find(n => n.name === 'Sugar')?.amount || null,
    sodium: nutrients.find(n => n.name === 'Sodium')?.amount || null
  };

  // Round numeric values
  Object.keys(nutritionData).forEach(key => {
    if (nutritionData[key] !== null && !isNaN(nutritionData[key])) {
      nutritionData[key] = Math.round(parseFloat(nutritionData[key]));
    }
  });

  return nutritionData;
}

/**
 * Calculate macronutrient percentages from nutrition data
 * @param {Object} nutrition - Nutrition data object
 * @returns {Object} - Macronutrient percentages
 */
export function calculateMacroPercentages(nutrition) {
  if (!nutrition) return null;

  const { protein, fat, carbohydrates } = nutrition;
  
  // Convert grams to calories (4 cal/g for protein and carbs, 9 cal/g for fat)
  const proteinCalories = protein ? protein * 4 : 0;
  const fatCalories = fat ? fat * 9 : 0;
  const carbCalories = carbohydrates ? carbohydrates * 4 : 0;
  
  const totalCalories = proteinCalories + fatCalories + carbCalories;
  
  if (totalCalories === 0) return null;
  
  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100),
    carbohydrates: Math.round((carbCalories / totalCalories) * 100)
  };
}

/**
 * Get complete nutrition information including percentages
 * @param {Object} recipe - Recipe object from Spoonacular
 * @returns {Object} - Complete nutrition information with percentages
 */
export function getCompleteNutrition(recipe) {
  const nutrition = extractNutrition(recipe);
  if (!nutrition) return null;
  
  const percentages = calculateMacroPercentages(nutrition);
  
  return {
    ...nutrition,
    percentages,
    // Add additional calculated fields
    totalMacros: nutrition.protein + nutrition.fat + nutrition.carbohydrates,
    isBalanced: percentages ? 
      (percentages.protein >= 10 && percentages.protein <= 35) &&
      (percentages.fat >= 20 && percentages.fat <= 35) &&
      (percentages.carbohydrates >= 45 && percentages.carbohydrates <= 65) : false
  };
}

/**
 * Format calories for display
 * @param {number|null} calories - Calories value
 * @param {boolean} showUnit - Whether to show the "cal" unit
 * @returns {string} - Formatted calorie string
 */
export function formatCalories(calories, showUnit = true) {
  if (calories === null || calories === undefined || isNaN(calories)) {
    return 'N/A';
  }
  
  const rounded = Math.round(parseFloat(calories));
  return showUnit ? `${rounded} cal` : rounded.toString();
}

/**
 * Get calorie range for filtering
 * @param {number} calories - Calories value
 * @param {number} range - Range percentage (default 20%)
 * @returns {Object} - Min and max calorie range
 */
export function getCalorieRange(calories, range = 0.2) {
  if (!calories || isNaN(calories)) {
    return { min: null, max: null };
  }

  const rangeAmount = calories * range;
  return {
    min: Math.round(calories - rangeAmount),
    max: Math.round(calories + rangeAmount)
  };
}

/**
 * Check if a recipe meets calorie criteria
 * @param {Object} recipe - Recipe object
 * @param {number} minCalories - Minimum calories
 * @param {number} maxCalories - Maximum calories
 * @returns {boolean} - Whether recipe meets criteria
 */
export function meetsCalorieCriteria(recipe, minCalories, maxCalories) {
  const calories = extractCalories(recipe);
  
  if (calories === null) return true; // If no calorie data, include the recipe
  
  if (minCalories && calories < minCalories) return false;
  if (maxCalories && calories > maxCalories) return false;
  
  return true;
}

/**
 * Get calorie category (low, medium, high)
 * @param {number} calories - Calories per serving
 * @returns {string} - Calorie category
 */
export function getCalorieCategory(calories) {
  if (!calories || isNaN(calories)) return 'unknown';
  
  if (calories < 300) return 'low';
  if (calories < 600) return 'medium';
  return 'high';
}

/**
 * Get calorie category color
 * @param {string} category - Calorie category
 * @returns {string} - CSS color value
 */
export function getCalorieCategoryColor(category) {
  switch (category) {
    case 'low':
      return '#4CAF50'; // Green
    case 'medium':
      return '#FF9800'; // Orange
    case 'high':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Gray
  }
} 