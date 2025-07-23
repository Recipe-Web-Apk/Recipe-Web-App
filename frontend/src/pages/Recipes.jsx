import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { supabase } from '../supabaseClient';
import SaveRecipeButton from '../components/SaveRecipeButton';
import LikeButton from '../components/LikeButton';
import AutoSuggestSearch from '../components/AutoSuggestSearch';
import IngredientTooltip from '../components/IngredientTooltip';
import { extractCalories, formatCalories } from '../utils/calorieUtils';
import './Recipes.css';
import './Recommendations.css';
import axiosInstance from '../api/axiosInstance';
import { fetchRecommendations } from '../api/recommendations';

function Recipes() {
  const { user, token } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'my-recipes'
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false since explore tab doesn't need initial loading
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Recipe Finder states
  const [showRecipeFinder, setShowRecipeFinder] = useState(false);
  const [ingredients, setIngredients] = useState(['']);
  const [calorieRange, setCalorieRange] = useState({ min: '', max: '' });
  const [finderResults, setFinderResults] = useState([]);
  const [finderLoading, setFinderLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    intolerances: '',
    maxReadyTime: '',
    sort: 'relevance'
  });

  // Read query and diet from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('query') || '';
    const urlDiet = params.get('diet') || '';
    const urlTab = params.get('tab');
    if (urlTab === 'my-recipes') {
      setActiveTab('my-recipes');
    }
    if (urlQuery) {
      setSearchQuery(urlQuery);
      setFilters(f => ({ ...f, diet: urlDiet }));
      setShowRecipeFinder(false);
      setCurrentPage(0);
      // Perform search
      searchSpoonacularRecipesFromParams(urlQuery, urlDiet);
    }
  }, [location.search]);

  async function searchSpoonacularRecipesFromParams(query, diet) {
    setSearchLoading(true);
    setLoading(false); // Ensure loading is false for search
    setError('');
    try {
      const params = new URLSearchParams({
        query,
        offset: 0,
        number: 12
      });
      if (diet) params.append('diet', diet);
      // Add other filters if needed
      
      console.log('Searching from params:', params.toString());
      const response = await axiosInstance.get(`/spoonacular/search?${params.toString()}`);
      const data = response.data;
      
      console.log('Search from params response:', response.status, data);
      
      if (response.status === 200) {
        setSearchResults(data.results || []);
        setTotalResults(data.totalResults || 0);
        setHasMore((data.results || []).length === 12);
      } else {
        setError('Failed to search recipes.');
      }
    } catch (err) {
      console.error('Search from params error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'my-recipes' && user) {
      fetchMyRecipes();
    } else if (activeTab !== 'my-recipes') {
      setRecipes([]);
      setLoading(false);
    }
  }, [activeTab, user]);

  async function fetchMyRecipes() {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecipes(data || []);
      console.log('Fetched my recipes:', data);
    } catch (err) {
      setError('Failed to load your recipes.');
    } finally {
      setLoading(false);
    }
  }

  async function searchSpoonacularRecipes(page = 0, append = false) {
    if (!searchQuery.trim() && page === 0) {
      setSearchResults([]);
      return;
    }

    if (page === 0) {
      setSearchLoading(true);
      setLoading(false); // Ensure loading is false for search
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        query: searchQuery,
        offset: page * 12,
        number: 12
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      console.log('Searching with params:', params.toString());
      const response = await axiosInstance.get(`/spoonacular/search?${params.toString()}`);
      const data = response.data;
      
      console.log('Search response:', response.status, data);
      
      if (response.status === 200) {
        if (append) {
          setSearchResults(prev => [...prev, ...(data.results || [])]);
        } else {
          setSearchResults(data.results || []);
          setTotalResults(data.totalResults || 0);
        }
        setHasMore((data.results || []).length === 12);
      } else {
        // Check if it's an API limit error
        if (response.status === 429) {
          setError('API limit reached. Showing sample recipes instead. Please try again tomorrow.');
        } else {
          setError('Failed to search recipes.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSearchLoading(false);
      setLoadingMore(false);
    }
  }

  async function findRecipesByIngredients() {
    const validIngredients = ingredients.filter(ing => ing.trim());
    if (validIngredients.length === 0) {
      setFinderResults([]);
      return;
    }

    setFinderLoading(true);
    setLoading(false); // Ensure loading is false for ingredient search
    try {
      const ingredientsQuery = validIngredients.join(',');
      const params = new URLSearchParams({
        ingredients: ingredientsQuery,
        ranking: 2, // maximize used ingredients
        ignorePantry: true
      });

      if (calorieRange.min) params.append('minCalories', calorieRange.min);
      if (calorieRange.max) params.append('maxCalories', calorieRange.max);

      const response = await axiosInstance.get(`/spoonacular/findByIngredients?${params.toString()}`);
      const data = response.data;
      
      if (response.status === 200) {
        setFinderResults(data || []);
      } else {
        // Check if it's an API limit error
        if (response.status === 429) {
          setError('API limit reached. Showing sample recipes instead. Please try again tomorrow.');
        } else {
          setError('Failed to find recipes by ingredients.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setFinderLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    searchSpoonacularRecipes(0, false);
  };

  const handleFinderSearch = (e) => {
    e.preventDefault();
    findRecipesByIngredients();
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    searchSpoonacularRecipes(nextPage, true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentPage(0);
    setTotalResults(0);
    setHasMore(true);
  };

  const clearFinder = () => {
    setIngredients(['']);
    setCalorieRange({ min: '', max: '' });
    setFinderResults([]);
  };

  const clearFilters = () => {
    setFilters({
      cuisine: '',
      diet: '',
      intolerances: '',
      maxReadyTime: '',
      sort: 'relevance'
    });
  };

  const applyFilters = () => {
    setCurrentPage(0);
    searchSpoonacularRecipes(0, false);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleRecipeSave = (recipe) => {
    // Update the recipe in the list to show it's saved
    if (activeTab === 'explore' && !showRecipeFinder) {
      setSearchResults(prev => 
        prev.map(r => r.id === recipe.id ? { ...r, isSaved: true } : r)
      );
    } else if (activeTab === 'explore' && showRecipeFinder) {
      setFinderResults(prev => 
        prev.map(r => r.id === recipe.id ? { ...r, isSaved: true } : r)
      );
    }
  };

  const handleRecipeUnsave = (recipe) => {
    // Update the recipe in the list to show it's not saved
    if (activeTab === 'explore' && !showRecipeFinder) {
      setSearchResults(prev => 
        prev.map(r => r.id === recipe.id ? { ...r, isSaved: false } : r)
      );
    } else if (activeTab === 'explore' && showRecipeFinder) {
      setFinderResults(prev => 
        prev.map(r => r.id === recipe.id ? { ...r, isSaved: false } : r)
      );
    }
  };

  const getDifficulty = (readyInMinutes) => {
    if (!readyInMinutes) return 'Unknown';
    if (readyInMinutes <= 15) return 'Easy';
    if (readyInMinutes <= 45) return 'Medium';
    return 'Hard';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const displayedRecipes = activeTab === 'explore' 
    ? (showRecipeFinder ? finderResults : searchResults) 
    : recipes;

  // Debug log for displayed recipes
  console.log('displayedRecipes:', displayedRecipes);

  const activeFilters = Object.values(filters).filter(value => value).length;

  const [recommendations, setRecommendations] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState('');

  useEffect(() => {
    if (user?.id && token) {
      setRecommendLoading(true);
      fetchRecommendations(user.id, token)
        .then(data => setRecommendations(data))
        .catch(err => {
          setRecommendError('Failed to load recommendations.');
          console.error('Error loading recommendations:', err);
        })
        .finally(() => setRecommendLoading(false));
    }
  }, [user, token]);


  return (
    <div className={`recipes-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="recipes-container">
        {/* Tab Toggle */}
        <div className="recipes-tabs">
          <button 
            className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            🔍 Explore Recipes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'my-recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-recipes')}
            disabled={!user}
          >
            👤 My Recipes
          </button>
        </div>

        {/* Header */}
        <header className="recipes-header">
          <div>
            <h1 className="recipes-title">
              {activeTab === 'explore' ? 'Explore Recipes' : 'My Recipes'}
            </h1>
            <p className="recipes-subtitle">
              {activeTab === 'explore' 
                ? 'Discover delicious recipes from around the world'
                : 'Manage and view your created recipes'
              }
            </p>
          </div>
          {user && (
            <Link to="/recipes/create" className="add-recipe-btn">
              + Add Recipe
            </Link>
          )}
        </header>

        {/* Search Section (only for Explore) */}
        {activeTab === 'explore' && (
          <div className="search-section">
            {/* Search Toggle */}
            <div className="search-toggle">
              <button 
                className={`toggle-btn ${!showRecipeFinder ? 'active' : ''}`}
                onClick={() => setShowRecipeFinder(false)}
              >
                🔍 Search by Name
              </button>
              <button 
                className={`toggle-btn ${showRecipeFinder ? 'active' : ''}`}
                onClick={() => setShowRecipeFinder(true)}
              >
                🥘 Recipe Finder
              </button>
            </div>

            {/* Name Search */}
            {!showRecipeFinder && (
              <>
                <div className="search-form">
                  <AutoSuggestSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={(query) => {
                      setSearchQuery(query);
                      setCurrentPage(0);
                      searchSpoonacularRecipes(0, false);
                    }}
                    placeholder="Search recipes by name or ingredient (e.g., pasta, chicken, vegan)"
                    className="recipes-auto-suggest"
                  />
                </div>

                {/* Advanced Filters */}
                <div className="filters-section">
                  <button
                    type="button"
                    className="filters-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    🔧 Filters {activeFilters > 0 && `(${activeFilters})`}
                  </button>
                  
                  {showFilters && (
                    <div className="filters-panel">
                      <div className="filters-grid">
                        <div className="filter-group">
                          <label>Cuisine</label>
                          <select
                            value={filters.cuisine}
                            onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                            className="filter-select"
                          >
                            <option value="">Any Cuisine</option>
                            <option value="african">African</option>
                            <option value="american">American</option>
                            <option value="british">British</option>
                            <option value="cajun">Cajun</option>
                            <option value="caribbean">Caribbean</option>
                            <option value="chinese">Chinese</option>
                            <option value="eastern european">Eastern European</option>
                            <option value="european">European</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                            <option value="greek">Greek</option>
                            <option value="indian">Indian</option>
                            <option value="irish">Irish</option>
                            <option value="italian">Italian</option>
                            <option value="japanese">Japanese</option>
                            <option value="jewish">Jewish</option>
                            <option value="korean">Korean</option>
                            <option value="latin american">Latin American</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="mexican">Mexican</option>
                            <option value="middle eastern">Middle Eastern</option>
                            <option value="nordic">Nordic</option>
                            <option value="southern">Southern</option>
                            <option value="spanish">Spanish</option>
                            <option value="thai">Thai</option>
                            <option value="vietnamese">Vietnamese</option>
                          </select>
                        </div>

                        <div className="filter-group">
                          <label>Diet</label>
                          <select
                            value={filters.diet}
                            onChange={(e) => setFilters({...filters, diet: e.target.value})}
                            className="filter-select"
                          >
                            <option value="">Any Diet</option>
                            <option value="gluten free">Gluten Free</option>
                            <option value="ketogenic">Ketogenic</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="lacto-vegetarian">Lacto-Vegetarian</option>
                            <option value="ovo-vegetarian">Ovo-Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="pescetarian">Pescetarian</option>
                            <option value="paleo">Paleo</option>
                            <option value="primal">Primal</option>
                            <option value="low fodmap">Low FODMAP</option>
                            <option value="whole30">Whole30</option>
                          </select>
                        </div>

                        <div className="filter-group">
                          <label>Intolerances</label>
                          <select
                            value={filters.intolerances}
                            onChange={(e) => setFilters({...filters, intolerances: e.target.value})}
                            className="filter-select"
                          >
                            <option value="">None</option>
                            <option value="dairy">Dairy</option>
                            <option value="egg">Egg</option>
                            <option value="gluten">Gluten</option>
                            <option value="grain">Grain</option>
                            <option value="peanut">Peanut</option>
                            <option value="seafood">Seafood</option>
                            <option value="sesame">Sesame</option>
                            <option value="shellfish">Shellfish</option>
                            <option value="soy">Soy</option>
                            <option value="sulfite">Sulfite</option>
                            <option value="tree nut">Tree Nut</option>
                            <option value="wheat">Wheat</option>
                          </select>
                        </div>

                        <div className="filter-group">
                          <label>Max Cooking Time (min)</label>
                          <input
                            type="number"
                            value={filters.maxReadyTime}
                            onChange={(e) => setFilters({...filters, maxReadyTime: e.target.value})}
                            placeholder="e.g., 30"
                            className="filter-input"
                          />
                        </div>

                        <div className="filter-group">
                          <label>Sort By</label>
                          <select
                            value={filters.sort}
                            onChange={(e) => setFilters({...filters, sort: e.target.value})}
                            className="filter-select"
                          >
                            <option value="relevance">Relevance</option>
                            <option value="time">Cooking Time</option>
                            <option value="calories">Calories</option>
                            <option value="popularity">Popularity</option>
                          </select>
                        </div>
                      </div>

                      <div className="filters-actions">
                        <button type="button" className="apply-filters-btn" onClick={applyFilters}>
                          Apply Filters
                        </button>
                        <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                          Clear All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Recipe Finder */}
            {showRecipeFinder && (
              <form onSubmit={handleFinderSearch} className="finder-form">
                <div className="ingredients-section">
                  <h3>What ingredients do you have?</h3>
                  <p className="ingredients-note">Find recipes that use ALL of these ingredients</p>
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-input">
                      <IngredientTooltip ingredient={ingredient}>
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          placeholder="e.g., chicken, pasta, tomatoes"
                          className="ingredient-field"
                        />
                      </IngredientTooltip>
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          className="remove-ingredient"
                          onClick={() => removeIngredient(index)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-ingredient-btn"
                    onClick={addIngredient}
                  >
                    + Add Ingredient
                  </button>
                </div>

                <div className="calorie-section">
                  <h3>Calorie Range (optional)</h3>
                  <div className="calorie-inputs">
                    <input
                      type="number"
                      value={calorieRange.min}
                      onChange={(e) => setCalorieRange({...calorieRange, min: e.target.value})}
                      placeholder="Min calories"
                      className="calorie-field"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={calorieRange.max}
                      onChange={(e) => setCalorieRange({...calorieRange, max: e.target.value})}
                      placeholder="Max calories"
                      className="calorie-field"
                    />
                  </div>
                </div>

                <div className="finder-actions">
                  <button type="submit" className="finder-btn">
                    {finderLoading ? 'Finding Recipes...' : 'Find Recipes'}
                  </button>
                  <button
                    type="button"
                    className="clear-finder-btn"
                    onClick={clearFinder}
                  >
                    Clear
                  </button>
                </div>
              </form>
            )}

            <div className="search-tip">
              {!showRecipeFinder 
                ? '💡 Try searching for: pasta, chicken, vegan, dessert, breakfast'
                : '💡 Add ingredients you have and find recipes that use ALL of them!'
              }
            </div>
          </div>
        )}

        {/* Recommended Recipes Section (only in Explore tab) */}
        {user && activeTab === 'explore' && (
          <section style={{ marginBottom: '2rem' }}>
            <div className="sticky-heading">
              <h2>Recommended Recipes for You</h2>
              <button className="refresh-btn" onClick={() => {
                setRecommendLoading(true);
                fetchRecommendations(user.id, token)
                  .then(data => setRecommendations(data))
                  .catch(() => setRecommendError('Failed to load recommendations.'))
                  .finally(() => setRecommendLoading(false));
              }}>🔁 Refresh Recommendations</button>
            </div>
            {recommendLoading ? (
              <div className="loading-state">Loading your personalized recipes...</div>
            ) : recommendError ? (
              <div className="empty-state" style={{ color: 'red' }}>{recommendError}</div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No recommendations yet.</p>
                <p>Start by liking or saving a few recipes!</p>
              </div>
            ) : (
              <div className="recommendations-grid">
                {recommendations.map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="recommendation-card"
                    onClick={() => {
                      const source = activeTab === 'my-recipes' ? 'user' : 'spoonacular';
                      navigate(`/recipes/${recipe.id}`, { state: { source } });
                    }}
                  >
                    {recipe.finalScore && (
                      <div className="match-score-badge">
                        {Math.round(recipe.finalScore * 100)}%
                      </div>
                    )}
                    <img 
                      src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                      alt={recipe.title} 
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; 
                      }}
                    />
                    <h3 className="recipe-title">{recipe.title}</h3>
                    <div className="recipe-meta">{recipe.cuisine || ''} {recipe.cuisine && recipe.readyInMinutes ? '•' : ''} {recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : ''}</div>
                    <div className="recipe-tags">
                      {(recipe.tags || recipe.diets || []).slice(0, 3).map(tag => (
                        <span key={tag} className="recipe-tag">{tag}</span>
                      ))}
                    </div>
                    {recipe.reasons && (
                      <div className="recipe-reasons">
                        {recipe.reasons.map(reason => (
                          <span key={reason} className="reason-text">{reason}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Content */}
        {(() => {
          if (loading) {
            return <div className="recipes-loading">Loading recipes...</div>;
          } else if (searchLoading) {
            return <div className="recipes-loading">Searching for recipes...</div>;
          } else if (error) {
            return <div className="recipes-error">{error}</div>;
          } else if (displayedRecipes.length === 0 && !searchLoading) {
            return (
              <div className="recipes-empty">
                {activeTab === 'explore' 
                  ? (showRecipeFinder ? 'Add ingredients to find recipes!' : 'Search for recipes to get started!')
                  : 'No recipes found. Create your first recipe!'
                }
              </div>
            );
          } else {
            return (
              <>
                <div className="recipes-grid">
                  {displayedRecipes.map(recipe => {
                    const difficulty = getDifficulty(recipe.readyInMinutes);
                    const difficultyColor = getDifficultyColor(difficulty);
                    
                    return (
                      <div 
                        key={recipe.id} 
                        className="recipe-card"
                        onClick={() => {
                          const source = activeTab === 'my-recipes' ? 'user' : 'spoonacular';
                          navigate(`/recipes/${recipe.id}`, { state: { source } });
                        }}
                      >
                        {/* Save Button */}
                        <SaveRecipeButton 
                          recipe={recipe}
                          onSave={handleRecipeSave}
                          onUnsave={handleRecipeUnsave}
                        />
                        {/* Like Button */}
                        <LikeButton recipe={recipe} />
                        {/* Difficulty Badge */}
                        <div 
                          className="difficulty-badge"
                          style={{ backgroundColor: difficultyColor }}
                        >
                          {difficulty}
                        </div>

                        <img 
                          src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                          alt={recipe.title} 
                          className="recipe-image"
                          onError={e => { 
                            e.target.onerror = null; 
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; 
                          }}
                        />
                        <div className="recipe-content">
                          <h3 className="recipe-title">{recipe.title}</h3>
                          
                          {/* Recipe Stats */}
                          <div className="recipe-stats">
                            <div className="recipe-meta">
                              <span className="recipe-time">⏱️ {recipe.readyInMinutes || recipe.cookTime || 'N/A'} min</span>
                              <span className="recipe-servings">👥 {recipe.servings || 'N/A'} servings</span>
                            </div>
                            
                            {extractCalories(recipe) && (
                              <div className="recipe-calories">
                                🔥 {formatCalories(extractCalories(recipe))}
                              </div>
                            )}
                          </div>

                          {/* Missing Ingredients (for Recipe Finder) */}
                          {recipe.missedIngredientCount > 0 && (
                            <div className="recipe-missing">
                              <span className="missing-badge">
                                Missing {recipe.missedIngredientCount} ingredients
                              </span>
                            </div>
                          )}

                          {/* Recipe Tags */}
                          {recipe.diets && recipe.diets.length > 0 && (
                            <div className="recipe-tags">
                              {recipe.diets.slice(0, 3).map((diet, index) => (
                                <span key={index} className="recipe-tag">
                                  {diet}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {!showRecipeFinder && searchResults.length > 0 && (
                  <div className="pagination-section">
                    <div className="pagination-info">
                      Showing {searchResults.length} of {totalResults} recipes
                    </div>
                    {hasMore && (
                      <button 
                        className="load-more-btn"
                        onClick={loadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? 'Loading...' : 'Load More Recipes'}
                      </button>
                    )}
                  </div>
                )}
              </>
            );
          }
        })()}

        {/* Login Prompt for My Recipes */}
        {!user && activeTab === 'my-recipes' && (
          <div className="login-prompt">
            <h3>Sign in to view your recipes</h3>
            <p>Create an account or sign in to start building your recipe collection.</p>
            <div className="login-actions">
              <button onClick={() => navigate('/login')} className="login-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/register')} className="register-btn">
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recipes; 