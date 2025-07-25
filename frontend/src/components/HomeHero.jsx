import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import DownshiftAutoComplete from './DownshiftAutoComplete';
import './HomeHero.css';

function HomeHero({ onOpenRecipeFinder }) {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    if (query && query.trim()) {
      navigate(`/recipes?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={`home-hero ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="hero-content">
        <h1 className="hero-title">
          Find Your Perfect Recipe
        </h1>
        <p className="hero-subtitle">
          Search thousands of recipes by ingredients, cuisine, or dietary preferences. 
          Save your favorites and get personalized recommendations just for you.
        </p>
        
        {/* Enhanced auto-complete search with Downshift */}
        <div className="hero-search">
          <DownshiftAutoComplete
            placeholder="Try: pasta, chicken, vegan, Italian, quick meals..."
            className="hero-auto-suggest"
          />
        </div>
        
        <div className="hero-actions">
          <Link to="/recipes" className="hero-btn primary">
            Browse All Recipes
          </Link>
          <button 
            onClick={onOpenRecipeFinder}
            className="hero-btn secondary"
          >
            Find by Ingredients
          </button>
          <Link to="/recipes/create" className="hero-btn secondary">
            Share Your Recipe
          </Link>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-item">
          <span className="stat-number">10,000+</span>
          <span className="stat-label">Recipes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Cuisines</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">Free</span>
          <span className="stat-label">Forever</span>
        </div>
      </div>
    </div>
  );
}

export default HomeHero; 