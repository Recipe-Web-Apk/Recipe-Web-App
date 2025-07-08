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
    <div className="recipes-page">
      <div className="recipes-container">
        <header className="card recipes-header">
          <h1 className="recipes-title">All Recipes</h1>
          <p className="recipes-description">Browse and discover delicious recipes from the community.</p>
          <Link to="/recipes/new" className="login-link">+ Add Recipe</Link>
        </header>
        {loading ? (
          <div className="recipes-loading">Loading recipes...</div>
        ) : error ? (
          <div className="recipes-error">{error}</div>
        ) : recipes.length === 0 ? (
          <div className="recipes-empty">No recipes found. Be the first to add one!</div>
        ) : (
          <div className="card recipes-grid">
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