import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SaveRecipeButton.css';

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
      const response = await fetch('http://localhost:5000/api/saved-recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const savedRecipe = data.recipes.find(r => r.id === recipe.id);
        setIsSaved(!!savedRecipe);
      } else {
        console.error('Error checking saved status:', response.status);
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

    setLoading(true);
    try {
      if (isSaved) {
        // Unsave recipe
        const response = await fetch(`http://localhost:5000/api/saved-recipes/${recipe.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsSaved(false);
          if (onUnsave) onUnsave(recipe);
          // Notify other pages about the unsave
          localStorage.setItem('recipeUnsaved', Date.now().toString());
          localStorage.removeItem('recipeUnsaved');
        } else {
          throw new Error('Failed to unsave recipe');
        }
      } else {
        // Save recipe
        const response = await fetch('http://localhost:5000/api/saved-recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ recipe })
        });

        if (response.ok) {
          setIsSaved(true);
          if (onSave) onSave(recipe);
          // Notify other pages about the save
          localStorage.setItem('recipeSaved', Date.now().toString());
          localStorage.removeItem('recipeSaved');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save recipe');
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