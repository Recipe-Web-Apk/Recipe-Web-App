import React, { useState } from 'react';
import './RecipeFinder.css';

function RecipeFinder({ isOpen, onClose, onSearch }) {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }
    setError('');
    onSearch({ query, diet });
  };

  if (!isOpen) return null;

  return (
    <div className="recipe-finder-modal" role="dialog" aria-modal="true" aria-label="Recipe Finder">
      <div className="recipe-finder-content">
        <button className="recipe-finder-close" onClick={onClose} aria-label="Close Recipe Finder">×</button>
        <h2 className="recipe-finder-title">Find a Recipe</h2>
        <form className="recipe-finder-form" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="recipe-finder-label" htmlFor="finder-query">Search</label>
            <input
              id="finder-query"
              className="recipe-finder-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. pasta, chicken, vegan..."
              autoFocus
            />
          </div>
          <div>
            <label className="recipe-finder-label" htmlFor="finder-diet">Diet (optional)</label>
            <select
              id="finder-diet"
              className="recipe-finder-select"
              value={diet}
              onChange={e => setDiet(e.target.value)}
            >
              <option value="">Any</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten free">Gluten Free</option>
              <option value="ketogenic">Ketogenic</option>
              <option value="pescatarian">Pescatarian</option>
            </select>
          </div>
          {error && <div className="recipe-finder-error">{error}</div>}
          <div className="recipe-finder-actions">
            <button type="button" className="recipe-finder-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="recipe-finder-btn">Search</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecipeFinder; 