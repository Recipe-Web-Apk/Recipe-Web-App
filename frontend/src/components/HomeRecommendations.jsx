import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchRecommendations } from '../api/recommendations';
import './HomeRecommendations.css';

function HomeRecommendations() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
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

  if (!user) {
    return null; // Don't show recommendations for non-logged-in users
  }

  return (
    <section className="home-recommendations">
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h2>Just for You</h2>
          <p>Handpicked recipes based on what you love</p>
          <button 
            className="refresh-btn" 
            onClick={() => {
              setRecommendLoading(true);
              fetchRecommendations(user.id, token)
                .then(data => setRecommendations(data))
                .catch(() => setRecommendError('Failed to load recommendations.'))
                .finally(() => setRecommendLoading(false));
            }}
          >
            🔁 Refresh
          </button>
        </div>

        {recommendLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Finding the perfect recipes for you...</p>
          </div>
        ) : recommendError ? (
          <div className="error-state">
            <p>{recommendError}</p>
            <button 
              onClick={() => {
                setRecommendLoading(true);
                fetchRecommendations(user.id, token)
                  .then(data => setRecommendations(data))
                  .catch(() => setRecommendError('Failed to load recommendations.'))
                  .finally(() => setRecommendLoading(false));
              }}
            >
              Try Again
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No recommendations yet</h3>
            <p>Like and save some recipes to get personalized suggestions!</p>
            <button 
              onClick={() => navigate('/recipes')}
              className="explore-btn"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map(recipe => (
              <div 
                key={recipe.id} 
                className="recommendation-card"
                onClick={() => {
                  navigate(`/recipes/${recipe.id}`, { state: { source: 'spoonacular' } });
                }}
              >
                {recipe.finalScore && recipe.finalScore > 0.3 && (
                  <div className="match-score-badge">
                    {Math.round(recipe.finalScore * 100)}% match
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
                <div className="recipe-info">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <div className="recipe-meta">
                    {recipe.cuisine && <span className="cuisine">{recipe.cuisine}</span>}
                    {recipe.readyInMinutes && recipe.readyInMinutes > 0 && <span className="time">⏱️ {recipe.readyInMinutes} min</span>}
                  </div>
                  <div className="recipe-tags">
                    {(recipe.tags || recipe.diets || []).slice(0, 2).map(tag => (
                      <span key={tag} className="recipe-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeRecommendations; 