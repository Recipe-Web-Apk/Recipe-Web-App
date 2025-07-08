import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <section className="card home-hero">
        <h1 className="home-title">Welcome to RecipeApp</h1>
        <p className="home-description">
          Discover, create, and share delicious recipes with the world. Search for inspiration, save your favorites, and start your culinary adventure today!
        </p>
        <div className="home-actions">
          <Link to="/recipes" className="home-btn">Browse Recipes</Link>
          <Link to="/explore" className="home-btn">Explore</Link>
          <Link to="/recipes/new" className="home-btn">Add Recipe</Link>
        </div>
      </section>
      <section className="card home-section">
        <h2 className="home-section-title">Why RecipeApp?</h2>
        <div className="home-section-content">
          <ul>
            <li><strong>Easy to use:</strong> Clean, modern interface for all devices.</li>
            <li><strong>Powerful search:</strong> Find recipes by ingredient, cuisine, or dietary needs.</li>
            <li><strong>Create & share:</strong> Add your own recipes and inspire others.</li>
            <li><strong>Save favorites:</strong> Bookmark recipes to revisit anytime.</li>
            <li><strong>Personalized:</strong> Filter by diet, calories, and more.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Home;
