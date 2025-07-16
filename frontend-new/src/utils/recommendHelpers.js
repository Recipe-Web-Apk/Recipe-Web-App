// 2.1 Extract Tags from Recipes
export function extractTags(recipes) {
  const tags = new Set();
  recipes.forEach(recipe => {
    if (Array.isArray(recipe.tags)) {
      recipe.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags);
}

// 2.2 Check Tag Overlap
export function hasTagOverlap(recipeTags, userTags) {
  if (!Array.isArray(recipeTags) || !Array.isArray(userTags)) return false;
  return recipeTags.some(tag => userTags.includes(tag));
}

// 2.3 Match User Preferences
export function matchesUserPreferences(recipe, preferences) {
  if (!preferences || !recipe) return false;
  const cuisineMatch = Array.isArray(preferences.cuisine)
    ? preferences.cuisine.includes(recipe.cuisine)
    : preferences.cuisine === recipe.cuisine;
  const dietaryTags = preferences.dietaryTags || preferences.diet || [];
  return (
    cuisineMatch &&
    Array.isArray(dietaryTags) &&
    dietaryTags.every(tag => Array.isArray(recipe.tags) && recipe.tags.includes(tag))
  );
}

// 2.4 Determine Seasonal Match
export function isCurrentlyInSeason(seasonTag) {
  const month = new Date().getMonth(); // 0-based
  const currentSeason = getSeasonFromMonth(month);
  if (!seasonTag) return false;
  if (Array.isArray(seasonTag)) {
    return seasonTag.includes(currentSeason);
  }
  return seasonTag === currentSeason;
}

// 2.5 Get Season from Month
export function getSeasonFromMonth(month) {
  if ([11, 0, 1].includes(month)) return 'winter';
  if ([2, 3, 4].includes(month)) return 'spring';
  if ([5, 6, 7].includes(month)) return 'summer';
  if ([8, 9, 10].includes(month)) return 'fall';
} 