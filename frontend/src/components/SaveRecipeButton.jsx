import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SaveRecipeButton.css';
import axiosInstance from '../api/axiosInstance';

const SaveRecipeButton = ({ recipe, onSave, onUnsave }) => {
  const { user, token } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && recipe && token) {
      checkIfSaved();
    }
    // eslint-disable-next-line
  }, [user, recipe, token]);

  const checkIfSaved = async () => {
    try {
      const response = await axiosInstance.get('/saved-recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });


      const savedRecipe = response.data.recipes.find(
        r => r.spoonacular_id === recipe.id || r.id === recipe.id
      );
      
      setIsSaved(!!savedRecipe);
      setSavedRecipeId(savedRecipe ? savedRecipe.saved_recipe_id : null);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSave = async () => {


    if (!user || !token) {
      console.warn("❗ Missing user or token — skipping save");
      return;
    }

    if (!recipe || !recipe.id) {
      console.warn("❌ Invalid or missing recipe.id — skipping save", recipe);
      alert('Recipe is still loading. Please wait.');
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // Unsave recipe using saved_recipe_id if available, else fallback to recipe.id
        const idToDelete = savedRecipeId || recipe.id;
        const response = await axiosInstance.delete(`/saved-recipes/${idToDelete}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setIsSaved(false);
          setSavedRecipeId(null);
          if (onUnsave) onUnsave(recipe);
          window.dispatchEvent(new CustomEvent('recipeUnsaved', { detail: recipe }));
        } else {
          throw new Error('Failed to unsave recipe');
        }
      } else {
        // Save recipe
        
        const response = await axiosInstance.post('/saved-recipes', { recipe }, {
          headers: { Authorization: `Bearer ${token}` }
        });


        if (response.data.success) {
          // Use the backend's returned recipe object for state
          const savedRecipe = {
            ...response.data.recipe.recipe_data,
            saved_recipe_id: response.data.recipe.id,
            spoonacular_id: response.data.recipe.spoonacular_id,
            user_id: response.data.recipe.user_id
          };
          setIsSaved(true);
          setSavedRecipeId(savedRecipe.saved_recipe_id);
          if (onSave) onSave(savedRecipe);
          window.dispatchEvent(new CustomEvent('recipeSaved', { detail: savedRecipe }));
        } else {
          throw new Error(response.data.error || 'Failed to save recipe');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
      alert(error.message || 'Failed to save/unsave recipe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      className={`save-recipe-btn ${isSaved ? 'saved' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleSave}
      disabled={loading || !recipe?.id}
      title={isSaved ? 'Remove from saved recipes' : 'Save recipe'}
    >
      {loading ? (
        <span className="loading-spinner">⏳</span>
      ) : isSaved ? (
        <span className="saved-icon">❤️</span>
      ) : (
        <span className="save-icon">🤍</span>
      )}
      <span className="save-text">
        {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
      </span>
    </button>
  );
};

export default SaveRecipeButton; 