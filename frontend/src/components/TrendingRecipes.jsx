import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrendingRecipes.css';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

function TrendingRecipes() {
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchTrendingRecipes();
  }, []);

  async function fetchTrendingRecipes() {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axiosInstance.get('http://localhost:5000/api/spoonacular/search?query=popular&sort=popularity&offset=0', { headers });
      const data = response.data;
      
      if (response.status === 200) {
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
      <h2 className="section-title">Popular This Week</h2>
      <p className="section-subtitle">Most viewed and saved recipes by our community</p>
      
      <div className="trending-grid">
        {trendingRecipes.map(recipe => (
          <div 
            key={recipe.id}
            className="trending-card"
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          >
            <div className="trending-image-container">
              <img 
                src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                alt={recipe.title} 
                className="trending-image"
                onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; }}
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
          See More Popular Recipes
        </button>
      </div>
    </div>
  );
}

export default TrendingRecipes; 