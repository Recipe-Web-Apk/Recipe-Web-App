import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrendingRecipes.css';

function TrendingRecipes() {
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingRecipes();
  }, []);

  async function fetchTrendingRecipes() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/spoonacular/search?query=popular&sort=popularity&offset=0');
      const data = await response.json();
      
      if (response.ok) {
        setTrendingRecipes(data.results?.slice(0, 6) || []);
      } else {
        console.error('Failed to fetch trending recipes:', data);
      }
    } catch (error) {
      console.error('Error fetching trending recipes:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="trending-section">
        <h2 className="section-title">Trending Recipes</h2>
        <div className="loading-recipes">Loading trending recipes...</div>
      </div>
    );
  }

  return (
    <div className="trending-section">
      <h2 className="section-title">Trending Recipes</h2>
      <p className="section-subtitle">Discover what's popular right now</p>
      
      <div className="trending-grid">
        {trendingRecipes.map(recipe => (
          <div 
            key={recipe.id}
            className="trending-card"
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          >
            <div className="trending-image-container">
              <img 
                src={recipe.image || 'https://via.placeholder.com/300x200.png?text=No+Image'}
                alt={recipe.title}
                className="trending-image"
                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200.png?text=No+Image'; }}
              />
              <div className="trending-overlay">
                <span className="trending-badge">🔥 Trending</span>
              </div>
            </div>
            
            <div className="trending-content">
              <h3 className="trending-title">{recipe.title}</h3>
              <div className="trending-meta">
                <span className="trending-time">⏱️ {recipe.readyInMinutes || 'N/A'} min</span>
                <span className="trending-servings">👥 {recipe.servings || 'N/A'} servings</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="trending-actions">
        <button 
          onClick={() => navigate('/recipes')}
          className="view-all-btn"
        >
          View All Recipes
        </button>
      </div>
    </div>
  );
}

export default TrendingRecipes; 