import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IngredientInputList from './IngredientInputList';
import './RecipeFinder.css';

function RecipeFinder({ isOpen, onClose, onSearch }) {
  const [ingredients, setIngredients] = useState(['', '', '']); // Start with 3 empty ingredients
  const [diet, setDiet] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ingredient => ingredient.trim() !== '');
    
    if (validIngredients.length < 3) {
      setErrors({ ingredients: 'Please enter at least 3 ingredients to search for recipes.' });
      return;
    }
    
    setErrors({});
    
    // Create query from ingredients
    const query = validIngredients.join(', ');
    
    // If onSearch is provided, use it (for /recipes page), otherwise redirect (for Home)
    if (onSearch) {
      onSearch({ query, diet, ingredients: validIngredients });
    } else {
      // Redirect to /recipes with query params
      const params = new URLSearchParams();
      params.set('query', query);
      if (diet) params.set('diet', diet);
      navigate(`/recipes?${params.toString()}`);
      if (onClose) onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setIngredients(['', '', '']);
    setDiet('');
    setErrors({});
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="recipe-finder-modal" role="dialog" aria-modal="true" aria-label="Recipe Finder">
      <div className="recipe-finder-content">
        <button className="recipe-finder-close" onClick={handleClose} aria-label="Close Recipe Finder">×</button>
        <h2 className="recipe-finder-title">Find Recipes by Ingredients</h2>
        <form className="recipe-finder-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="recipe-finder-ingredients-section">
            <IngredientInputList 
              ingredients={ingredients}
              setIngredients={setIngredients}
              errors={errors}
              setErrors={setErrors}
              minIngredients={3}
              allowRemovalBelowMin={true}
              label="Ingredients (minimum 3) *"
            />
            <div className="ingredient-requirement-note">
              <small>Enter at least 3 ingredients to find matching recipes</small>
            </div>
          </div>
          <div>
            <label className="recipe-finder-label" htmlFor="finder-diet">Dietary preference (optional)</label>
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
          <div className="recipe-finder-actions">
            <button type="button" className="recipe-finder-btn" onClick={handleClose}>Cancel</button>
            <button type="submit" className="recipe-finder-btn">Search Recipes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecipeFinder; 