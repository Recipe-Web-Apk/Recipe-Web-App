// API Endpoints
export const API_BASE_URL = 'http://localhost:5000/api';

// Spoonacular API endpoints
export const SPOONACULAR_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/spoonacular/search`,
  RECIPE_DETAIL: `${API_BASE_URL}/spoonacular/recipe`,
  SIMILAR_RECIPES: `${API_BASE_URL}/spoonacular/similar`,
};

// Local API endpoints
export const LOCAL_ENDPOINTS = {
  RECIPES: `${API_BASE_URL}/recipes`,
  AUTH: `${API_BASE_URL}/auth`,
};

// Frontend Routes
export const ROUTES = {
  HOME: '/',
  RECIPES: '/recipes',
  RECIPE_DETAIL: '/recipes/:id',
  CREATE_RECIPE: '/recipes/create',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
};

// Default values
export const DEFAULTS = {
  SEARCH_QUERY: 'pasta',
  RECIPES_PER_PAGE: 12,
  MAX_RECIPE_TITLE_LENGTH: 50,
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/300x200/CCCCCC/666666?text=No+Image',
};

// Filter options
export const FILTER_OPTIONS = {
  CUISINES: [
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'asian', label: 'Asian' },
    { value: 'american', label: 'American' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'indian', label: 'Indian' },
    { value: 'french', label: 'French' },
    { value: 'thai', label: 'Thai' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'chinese', label: 'Chinese' },
  ],
  
  DIETS: [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'ketogenic', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'pescetarian', label: 'Pescetarian' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'dairy-free', label: 'Dairy Free' },
  ],
  
  SORT_OPTIONS: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'time', label: 'Quickest First' },
    { value: 'calories', label: 'Lowest Calories' },
    { value: 'popularity', label: 'Most Popular' },
  ],
  
  TIME_OPTIONS: [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
  ],
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: { maxTime: 30, color: '#28a745', label: 'Easy' },
  MEDIUM: { maxTime: 60, color: '#ffc107', label: 'Medium' },
  HARD: { maxTime: Infinity, color: '#dc3545', label: 'Hard' },
  UNKNOWN: { color: '#666', label: 'Unknown' },
};

// Search suggestions
export const SEARCH_SUGGESTIONS = [
  'pasta',
  'chicken',
  'dessert',
  'vegetarian',
  'quick meals',
  'breakfast',
  'salad',
  'soup',
  'pizza',
  'smoothie',
]; 