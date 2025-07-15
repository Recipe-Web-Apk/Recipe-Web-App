import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';
import './LikeButton.css';

function LikeButton({ recipe, recipeId, initialLiked = false, onLikeChange }) {
  const { token } = useAuth();
  const id = recipeId || recipe?.id;
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && id) {
      checkLikeStatus();
    }
  }, [token, id]);

  const checkLikeStatus = async () => {
    try {
      const response = await axiosInstance.get(`/likes/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleLikeToggle = async () => {
    if (!token) {
      setError('Please log in to like recipes');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isLiked) {
        const response = await axiosInstance.delete(`/likes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setIsLiked(false);
          if (onLikeChange) onLikeChange(false);
        }
      } else {
        const response = await axiosInstance.post('/likes', {
          recipe_id: id,
          recipe_data: recipe || null
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setIsLiked(true);
          if (onLikeChange) onLikeChange(true);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="like-button-container">
      <button
        className={`like-button ${isLiked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleLikeToggle}
        disabled={isLoading}
        aria-label={isLiked ? 'Unlike recipe' : 'Like recipe'}
        title={isLiked ? 'Unlike recipe' : 'Like recipe'}
      >
        <FiHeart className="like-icon" />
        <span className="like-text">
          {isLiked ? 'Liked' : 'Like'}
        </span>
      </button>
      {error && (
        <div className="like-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default LikeButton; 