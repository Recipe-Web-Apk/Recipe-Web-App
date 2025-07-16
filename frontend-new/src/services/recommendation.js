import {
  getUserPreferences,
  getUserLikedRecipes,
  getUserViewedRecipes
} from '../utils/userData';

import {
  extractTags,
  hasTagOverlap,
  matchesUserPreferences,
  isCurrentlyInSeason
} from '../utils/recommendHelpers';

// Placeholder: Replace with your actual function to fetch all recipes
import { getAllRecipes } from '../api/spoonacular'; // or from Supabase DB

export async function recommendRecipes(userId) {
  const preferences = await getUserPreferences(userId);
  const likedRecipes = await getUserLikedRecipes(userId);
  const viewedRecipes = await getUserViewedRecipes(userId);

  const tagProfile = extractTags([...likedRecipes, ...viewedRecipes]);
  const allRecipes = await getAllRecipes();

  const scoredRecipes = allRecipes.map(recipe => {
    let score = 0;
    if (hasTagOverlap(recipe.tags, tagProfile)) score += 3;
    if (matchesUserPreferences(recipe, preferences)) score += 2;
    if (isCurrentlyInSeason(recipe.season)) score += 1;
    return { ...recipe, score };
  });

  const topRecipes = scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return topRecipes;
}

// Optional: Dev test
// (async () => {
//   const top = await recommendRecipes('your-user-id-here');
//   console.log(top);
// })(); 