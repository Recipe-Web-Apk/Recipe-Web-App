import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCombobox } from 'downshift';
import axiosInstance from '../api/axiosInstance';
import './DownshiftAutoComplete.css';

const DownshiftAutoComplete = ({ 
  placeholder = 'Search recipes...',
  className = '',
  debounceMs = 300
}) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/spoonacular/suggest?query=${encodeURIComponent(query)}`);
      if (response.data && response.data.results) {
        setSuggestions(response.data.results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback((query) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceMs);
    
    setDebounceTimeout(timeout);
  }, [fetchSuggestions, debounceMs, debounceTimeout]);

  // Downshift configuration
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    setInputValue,
    inputValue,
  } = useCombobox({
    items: suggestions,
    itemToString: (item) => (item ? item.title : ''),
    onInputValueChange: ({ inputValue: newValue }) => {
      if (newValue !== undefined) {
        debouncedSearch(newValue);
      }
    },
    onSelectedItemChange: ({ selectedItem: item }) => {
      if (item && item.type === 'recipe') {
        navigate(`/recipes/${item.id}`);
      }
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

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
    <div className={`downshift-autocomplete ${className}`}>
      <label {...getLabelProps()}>Search recipes</label>
      <div>
        <input
          {...getInputProps()}
          placeholder={placeholder}
          className="downshift-input"
        />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
          className="downshift-toggle"
        >
          🔍
        </button>
      </div>
      
      <ul {...getMenuProps()} className="downshift-menu">
        {isOpen && (
          <>
            {loading && (
              <li className="downshift-loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Searching...</span>
              </li>
            )}
            
            {!loading && suggestions.length === 0 && inputValue && inputValue.length >= 2 && (
              <li className="downshift-no-results">
                No recipes found for "{inputValue}"
              </li>
            )}
            
            {!loading && suggestions.map((item, index) => (
              <li
                key={item.id}
                {...getItemProps({ item, index })}
                className={`downshift-item ${
                  highlightedIndex === index ? 'highlighted' : ''
                } ${selectedItem === item ? 'selected' : ''}`}
              >
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="item-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="item-content">
                  <div className="item-title">
                    {highlightText(item.title, inputValue)}
                  </div>
                  <div className="item-type">Recipe</div>
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default DownshiftAutoComplete; 