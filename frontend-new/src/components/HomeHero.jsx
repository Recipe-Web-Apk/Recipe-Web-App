import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AutoSuggestSearch from './AutoSuggestSearch';
import './HomeHero.css';

function HomeHero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    if (query && query.trim()) {
      navigate(`/recipes?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="home-hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Discover Amazing Recipes
        </h1>
        <p className="hero-subtitle">
          Find inspiration for your next meal and connect with a community of food lovers. 
          Create, share, and explore delicious recipes from around the world.
        </p>
        
        {/* Auto-suggest search */}
        <div className="hero-search">
          <AutoSuggestSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search for recipes, ingredients, or cuisines..."
            className="hero-auto-suggest"
          />
        </div>
        
        <div className="hero-actions">
          <Link to="/recipes" className="hero-btn primary">
            Explore Recipes
          </Link>
          <Link to="/recipes/create" className="hero-btn secondary">
            Create Recipe
          </Link>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-item">
          <span className="stat-number">1000+</span>
          <span className="stat-label">Recipes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Cuisines</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Available</span>
        </div>
      </div>
    </div>
  );
}

export default HomeHero; 