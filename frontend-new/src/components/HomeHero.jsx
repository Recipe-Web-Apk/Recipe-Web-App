import React from 'react';
import { Link } from 'react-router-dom';
import './HomeHero.css';

function HomeHero() {
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