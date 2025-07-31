import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Trie from '../utils/Trie';
import axiosInstance from '../api/axiosInstance';
import './AutoSuggestSearch.css';

const AutoSuggestSearch = ({ 
  value = '', 
  onChange, 
  onSearch, 
  placeholder = 'Search recipes...',
  className = '',
  maxSuggestions = 8,
  debounceMs = 300,
  showLoading = true
}) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [trie] = useState(new Trie());
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Initialize Trie with some common recipe terms (optional - can be removed for recipe-only suggestions)
  const initializeTrie = useCallback(async () => {
    // We can keep some basic terms for fallback, but focus on actual recipes
    const staticTerms = [
      'pasta', 'chicken', 'salad', 'soup', 'dessert', 'breakfast', 'lunch', 'dinner'
    ];

    staticTerms.forEach(term => {
      trie.insert(term, { type: 'ingredient', title: term });
    });

    // Try to load cached suggestions from localStorage
    try {
      const cached = localStorage.getItem('recipeSuggestions');
      if (cached) {
        const cachedData = JSON.parse(cached);
        cachedData.forEach(item => {
          trie.insert(item.title, item);
        });
      }
    } catch (error) {
      console.warn('Failed to load cached suggestions:', error);
    }
  }, [trie]);

  // Initialize Trie with static data on mount
  useEffect(() => {
    initializeTrie();
  }, [initializeTrie]);

  // Perform the actual search
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    try {
      // Always try to fetch from API first for fresh recipe suggestions
      const response = await axiosInstance.get(`/spoonacular/suggest?query=${encodeURIComponent(query)}`);
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        const apiResults = response.data.results.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          type: 'recipe'
        }));

        // Cache the new results in Trie
        apiResults.forEach(recipe => {
          trie.insert(recipe.title, recipe);
        });

        // Save to localStorage (limit to last 100 items)
        try {
          const allCached = trie.getAllWords().map(item => item.data).slice(-100);
          localStorage.setItem('recipeSuggestions', JSON.stringify(allCached));
        } catch (error) {
          console.warn('Failed to cache suggestions:', error);
        }

        setSuggestions(apiResults);
        setLoading(false);
        return;
      }

      // Fallback to Trie search if API returns no results
      const trieResults = trie.search(query, maxSuggestions);
      
      if (trieResults.length > 0) {
        setSuggestions(trieResults.map(result => result.data));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [trie, maxSuggestions]);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [debounceMs, performSearch]);

  // Handle input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setSelectedIndex(-1);
    
    if (newValue.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
    } else {
      debouncedSearch(newValue);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (value.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        // Handle other keys normally
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    if (suggestion.type === 'recipe') {
      navigate(`/recipes/${suggestion.id}`);
    } else {
      // For ingredients/terms, perform a search
      onChange?.(suggestion.title);
      onSearch?.(suggestion.title);
    }
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle search button click
  const handleSearch = () => {
    if (value.trim()) {
      onSearch?.(value.trim());
      setShowDropdown(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <strong key={index}>{part}</strong> : part
    );
  };

  return (
    <div className={`auto-suggest-container ${className}`} ref={dropdownRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          className="search-button"
          type="button"
        >
          🔍
        </button>
      </div>

      {showDropdown && (
        <div className="suggestions-dropdown">
          {loading && showLoading && (
            <div className="loading-suggestions">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Searching...</span>
            </div>
          )}
          
          {!loading && suggestions.length === 0 && value.length >= 2 && (
            <div className="no-suggestions">
              No recipes found for "{value}"
            </div>
          )}
          
          {!loading && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id || index}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {suggestion.image && (
                    <img 
                      src={suggestion.image} 
                      alt={suggestion.title}
                      className="suggestion-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="suggestion-content">
                    <div className="suggestion-title">
                      {highlightText(suggestion.title, value)}
                    </div>
                    {suggestion.type === 'recipe' && (
                      <div className="suggestion-type">Recipe</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoSuggestSearch; 