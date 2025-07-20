import {
  extractTags,
  hasTagOverlap,
  matchesUserPreferences,
  getSeasonFromMonth,
  isCurrentlyInSeason
} from './recommendHelpers';

test('extractTags returns unique tags from recipes', () => {
  const mockRecipes = [
    { tags: ['vegan', 'dinner'] },
    { tags: ['dinner', 'gluten-free'] }
  ];
  const result = extractTags(mockRecipes);
  expect(result).toEqual(expect.arrayContaining(['vegan', 'dinner', 'gluten-free']));
});

test('hasTagOverlap returns true if any tag overlaps', () => {
  expect(hasTagOverlap(['vegan', 'dinner'], ['dinner', 'lunch'])).toBe(true);
  expect(hasTagOverlap(['vegan'], ['dinner', 'lunch'])).toBe(false);
});

test('matchesUserPreferences returns true for matching cuisine and dietaryTags', () => {
  const recipe = { cuisine: 'italian', tags: ['vegan', 'dairy-free'] };
  const preferences = { cuisine: ['italian'], dietaryTags: ['vegan', 'dairy-free'] };
  expect(matchesUserPreferences(recipe, preferences)).toBe(true);
});

test('matchesUserPreferences returns false for non-matching cuisine or dietaryTags', () => {
  const recipe = { cuisine: 'mexican', tags: ['vegan'] };
  const preferences = { cuisine: ['italian'], dietaryTags: ['vegan', 'dairy-free'] };
  expect(matchesUserPreferences(recipe, preferences)).toBe(false);
});

test('getSeasonFromMonth returns correct season', () => {
  expect(getSeasonFromMonth(0)).toBe('winter'); // January
  expect(getSeasonFromMonth(3)).toBe('spring'); // April
  expect(getSeasonFromMonth(6)).toBe('summer'); // July
  expect(getSeasonFromMonth(9)).toBe('fall');   // October
});

test('isCurrentlyInSeason returns true if current season matches', () => {
  const currentSeason = getSeasonFromMonth(new Date().getMonth());
  expect(isCurrentlyInSeason([currentSeason])).toBe(true);
  expect(isCurrentlyInSeason(currentSeason)).toBe(true);
}); 