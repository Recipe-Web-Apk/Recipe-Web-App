import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { supabase } from '../supabaseClient';
import './Recipes.css';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      setError('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  }

  return (
<<<<<<< HEAD
    <div className="recipes-container">
      {/* Data Source Toggle */}
      <div className="data-source-toggle">
        <button
          className={dataSource === 'spoonacular' ? 'active' : ''}
          onClick={() => setDataSource('spoonacular')}
        >
          Explore
        </button>
        <button
          className={dataSource === 'local' ? 'active' : ''}
          onClick={() => setDataSource('local')}
        >
          My Recipes
        </button>
      </div>
      <div className="recipes-header">
        <div>
          <h1 className="recipes-title">
            {dataSource === 'spoonacular' ? 'Explore Recipes' : 'My Recipes'}
          </h1>
          <p className="recipes-subtitle">
            {dataSource === 'spoonacular' 
              ? (totalResults > 0 ? `Found ${totalResults} delicious recipes (including yours!)` : 'Discover recipes from around the world and your own creations')
              : (totalResults > 0 ? `Found ${totalResults} of your recipes` : 'Your personal recipe collection')
            }
          </p>
        </div>
        {isAuthenticated && (
          <button 
            onClick={() => navigate('/recipes/create')}
            className="add-recipe-btn"
          >
            + Add Recipe
          </button>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form" autoComplete="off">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search recipes by name or ingredient (e.g., pasta, chicken, vegan)"
            className="search-input"
            autoFocus
            aria-label="Search recipes"
          />
          {searchInput && (
            <button
              type="button"
              className="clear-btn"
              aria-label="Clear search"
              onClick={handleClear}
              tabIndex={0}
            >
              ×
            </button>
          )}
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
        <div className="search-tip">
          💡 Try searching for: {SEARCH_SUGGESTIONS.slice(0, 5).join(', ')}
        </div>
      </div>

      {/* Result Count and Spinner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 32 }}>
        {!loading && recipes.length > 0 && (
          <div className="result-count">
            {totalResults === 1
              ? '1 recipe found'
              : `${totalResults} recipes found`}
          </div>
        )}
        {isFetching && (
          <div className="spinner" aria-label="Searching"></div>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="filter-section">
        <div className="filter-header">
          <h3 className="filter-title">Filters & Sort</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="toggle-filters-btn"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-grid">
            {/* Sort By */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                {FILTER_OPTIONS.SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine */}
            <div className="filter-group">
              <label className="filter-label">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Cuisines</option>
                {FILTER_OPTIONS.CUISINES.map(cuisine => (
                  <option key={cuisine.value} value={cuisine.value}>
                    {cuisine.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Diet */}
            <div className="filter-group">
              <label className="filter-label">Diet</label>
              <select
                value={filters.diet}
                onChange={(e) => setFilters(prev => ({ ...prev, diet: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Diets</option>
                {FILTER_OPTIONS.DIETS.map(diet => (
                  <option key={diet.value} value={diet.value}>
                    {diet.label}
                  </option>
                ))}
              </select>
              </div>

            {/* Max Ready Time */}
            <div className="filter-group">
              <label className="filter-label">Max Time (min)</label>
              <select
                value={filters.maxReadyTime}
                onChange={(e) => setFilters(prev => ({ ...prev, maxReadyTime: e.target.value }))}
                className="filter-select"
              >
                <option value="">Any Time</option>
                {FILTER_OPTIONS.TIME_OPTIONS.map(time => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Min Calories */}
            <div className="filter-group">
              <label className="filter-label">Min Calories</label>
              <input
                type="number"
                value={filters.minCalories || ''}
                onChange={e => setFilters(prev => ({ ...prev, minCalories: e.target.value }))}
                className="filter-input"
                placeholder="e.g. 200"
                min="0"
              />
            </div>
            {/* Max Calories */}
            <div className="filter-group">
              <label className="filter-label">Max Calories</label>
              <input
                type="number"
                value={filters.maxCalories || ''}
                onChange={e => setFilters(prev => ({ ...prev, maxCalories: e.target.value }))}
                className="filter-input"
                placeholder="e.g. 800"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.cuisine || filters.diet || filters.maxReadyTime) && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            {filters.cuisine && (
              <span className="filter-chip cuisine">
                {filters.cuisine} ✕
              </span>
            )}
            {filters.diet && (
              <span className="filter-chip diet">
                {filters.diet} ✕
              </span>
            )}
            {filters.maxReadyTime && (
              <span className="filter-chip time">
                ≤{filters.maxReadyTime}min ✕
              </span>
            )}
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {!isAuthenticated && (
        <div className="login-tip">
          <p>
            💡 <strong>Tip:</strong> Log in to create and save your own recipes!
          </p>
        </div>
      )}
      
      {/* Empty State with Suggestions */}
      {!isFetching && !loading && recipes.length === 0 && (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>
            Try another ingredient or use one of the suggestions below:
          </p>
          <div className="empty-state-suggestions">
            {SEARCH_SUGGESTIONS.slice(0, 6).map(term => (
              <button
                key={term}
                onClick={() => setSearchInput(term)}
                className="empty-state-suggestion"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {!loading && recipes.length > 0 && (
        <>
=======
    <div className="recipes-page">
      <div className="recipes-container">
        <header className="recipes-header">
          <h1 className="recipes-title">All Recipes</h1>
          <p className="recipes-description">Browse and discover delicious recipes from the community.</p>
          <Link to="/recipes/new" className="login-link" style={{ marginTop: 0 }}>+ Add Recipe</Link>
        </header>
        {loading ? (
          <div className="recipes-loading">Loading recipes...</div>
        ) : error ? (
          <div className="recipes-error">{error}</div>
        ) : recipes.length === 0 ? (
          <div className="recipes-empty">No recipes found. Be the first to add one!</div>
        ) : (
>>>>>>> main
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recipes; 