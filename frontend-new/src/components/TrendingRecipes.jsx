import React from 'react';
import { Link } from 'react-router-dom';
import './TrendingRecipes.css';

const trending = [
  {
    id: 1,
    title: 'Spicy Vegan Chili',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Vegan',
  },
  {
    id: 2,
    title: 'Quick Chicken Alfredo',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    tag: 'Quick',
  },
  {
    id: 3,
    title: 'Classic Margherita Pizza',
    image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=400&q=80',
    tag: 'New',
  },
  {
    id: 4,
    title: 'Gluten-Free Pancakes',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    tag: 'Gluten-Free',
  },
];

function TrendingRecipes() {
  return (
    <section className="trending-section fade-in">
      <h2 className="trending-title slide-up">Trending Recipes</h2>
      <div className="trending-scroll">
        {trending.map(recipe => (
          <Link to={`/recipes/${recipe.id}`} className="card trending-card" key={recipe.id} tabIndex={0} aria-label={recipe.title}>
            <div className="trending-card-img-wrap">
              <img src={recipe.image} alt={recipe.title} className="trending-card-img" />
              <span className="trending-card-tag">{recipe.tag}</span>
            </div>
            <div className="trending-card-title">{recipe.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default TrendingRecipes; 