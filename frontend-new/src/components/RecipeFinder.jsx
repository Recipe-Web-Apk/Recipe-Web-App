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

<<<<<<< HEAD
  async function searchRecipes(isLoadMore = false) {
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setSearchPerformed(true)
      setOffset(0)
      setResults([])
    }
    
    try {
      const validIngredients = ingredients.filter(ing => ing.trim() !== '')
      const query = validIngredients.join(', ')
      let url = `http://localhost:5000/api/spoonacular/search?query=${encodeURIComponent(query)}&offset=${isLoadMore ? offset : 0}`
      if (minCalories) url += `&minCalories=${encodeURIComponent(minCalories)}`
      if (maxCalories) url += `&maxCalories=${encodeURIComponent(maxCalories)}`
      
      console.log('Making request to:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        const newResults = data.results || []
        
        if (isLoadMore) {
          setResults(prev => [...prev, ...newResults])
        } else {
          setResults(newResults)
        }
        
        setOffset(isLoadMore ? offset + 10 : 10)
        setHasMore(newResults.length === 10) // If we got 10 results, there might be more
      } else {
        console.error('API Error:', data)
        setErrors({ api: `Failed to fetch recipes: ${data.error || 'Unknown error'}` })
      }
    } catch (error) {
      console.error('Network Error:', error)
      setErrors({ api: `Network error: ${error.message}` })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function loadMore() {
    searchRecipes(true)
  }

  function clearForm() {
    setIngredients(['', '', '', ''])
    setMinCalories('')
    setMaxCalories('')
    setErrors({})
    setSearchPerformed(false)
    setResults([])
    setOffset(0)
    setHasMore(true)
  }

  const isValid = Object.keys(validateForm()).length === 0
=======
  if (!isOpen) return null;
>>>>>>> main

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