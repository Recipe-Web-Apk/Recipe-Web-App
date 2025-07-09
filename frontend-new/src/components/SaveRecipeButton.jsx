import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import './SaveRecipeButton.css';

const SaveRecipeButton = ({ recipe, onSave, onUnsave }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && recipe) {
      checkIfSaved();
    }
  }, [user, recipe]);

  const checkIfSaved = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking saved status:', error);
      } else {
        setIsSaved(!!data);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // Unsave recipe
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id);

        if (error) throw error;
        setIsSaved(false);
        if (onUnsave) onUnsave(recipe);
      } else {
        // Save recipe
        const { error } = await supabase
          .from('saved_recipes')
          .insert({
            user_id: user.id,
            recipe_id: recipe.id,
            recipe_data: recipe
          });

        if (error) throw error;
        setIsSaved(true);
        if (onSave) onSave(recipe);
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
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