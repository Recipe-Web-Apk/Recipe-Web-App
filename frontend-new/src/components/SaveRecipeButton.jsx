import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SaveRecipeButton.css';
import axiosInstance from '../api/axiosInstance';

const SaveRecipeButton = ({ recipe, onSave, onUnsave }) => {
  const { user, token } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && recipe && token) {
      checkIfSaved();
    }
  }, [user, recipe, token]);

  const checkIfSaved = async () => {
    try {
      const response = await axiosInstance.get('/saved-recipes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const savedRecipe = response.data.recipes.find(r => r.id === recipe.id);
        setIsSaved(!!savedRecipe);
      } else {
        console.error('Error checking saved status:', response.data.error);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !token) {
      // Redirect to login or show login prompt
      return;
    }

    console.log('SaveRecipeButton: Starting save/unsave process, isSaved =', isSaved);
    console.log('SaveRecipeButton: Current user:', user);
    console.log('SaveRecipeButton: Current token exists:', !!token);
    setLoading(true);
    try {
      if (isSaved) {
        console.log('SaveRecipeButton: Unsaving recipe', recipe.id);
        // Unsave recipe
        const response = await axiosInstance.delete(`/saved-recipes/${recipe.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          console.log('SaveRecipeButton: Recipe unsaved successfully, dispatching event');
          setIsSaved(false);
          if (onUnsave) onUnsave(recipe);
          // Notify other pages about the unsave using custom event
          window.dispatchEvent(new CustomEvent('recipeUnsaved', { detail: recipe }));
        } else {
          throw new Error('Failed to unsave recipe');
        }
      } else {
        console.log('SaveRecipeButton: Saving recipe', recipe.id);
        // Save recipe
        const response = await axiosInstance.post('/saved-recipes', { recipe }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          console.log('SaveRecipeButton: Recipe saved successfully, dispatching event');
          setIsSaved(true);
          if (onSave) onSave(recipe);
          // Notify other pages about the save using custom event
          window.dispatchEvent(new CustomEvent('recipeSaved', { detail: recipe }));
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

  if (!user) {
    return null; // Don't show save button for non-logged in users
  }

  return (
    <button
      className={`save-recipe-btn ${isSaved ? 'saved' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleSave}
      disabled={loading}
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