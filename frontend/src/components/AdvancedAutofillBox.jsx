import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import './AdvancedAutofillBox.css';

const AdvancedAutofillBox = ({ 
  title, 
  field, 
  context, 
  onUseSuggestion, 
  onValidationChange,
  showValidation = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions when title or field changes
  useEffect(() => {

    if (title && title.length >= 3 && field) {
      
      fetchSuggestions();
    } else {

      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [title, field, context]);

  const fetchSuggestions = async () => {

    setLoading(true);
    try {
      const params = new URLSearchParams({
        title: title,
        field: field
      });
      
      if (context) {
        params.append('context', JSON.stringify(context));
      }



      const response = await axiosInstance.get(`/autofill/advanced-autofill?${params.toString()}`);
      

      
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(response.data.suggestions.length > 0);

      }
    } catch (error) {
      console.error('❌ Failed to fetch advanced autofill suggestions:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    
    if (onUseSuggestion) {
      onUseSuggestion(suggestion.data, suggestion);
    }
  };

  const validateField = async (value) => {
    if (!showValidation || !field) return;

    try {
      const response = await axiosInstance.post('/validate-field', {
        field: field,
        value: value,
        context: context
      });

      const validationResult = response.data;
      setValidation(validationResult);
      
      if (onValidationChange) {
        onValidationChange(validationResult);
      }
    } catch (error) {
      console.error('Field validation failed:', error);
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'spoonacular': return '🌐';
      case 'user_created': return '👤';
      case 'patterns': return '📊';
      case 'ai': return '🤖';
      default: return '💡';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#22c55e';
    if (confidence >= 0.6) return '#eab308';
    return '#ef4444';
  };

  const formatSuggestionData = (data, field) => {
    if (Array.isArray(data)) {
      if (field === 'ingredients') {
        return data.map((ingredient, index) => (
          <div key={index} className="suggestion-ingredient">
            • {ingredient}
          </div>
        ));
      } else if (field === 'instructions') {
        return data.map((instruction, index) => (
          <div key={index} className="suggestion-instruction">
            {index + 1}. {instruction}
          </div>
        ));
      } else if (field === 'tags') {
        return (
          <div className="suggestion-tags">
            {data.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        );
      }
      return data.join(', ');
    } else if (typeof data === 'object' && data !== null) {
      // Handle stats object
      if (field === 'stats') {
        return (
          <div className="suggestion-stats">
            {data.readyInMinutes && <span>⏱️ {data.readyInMinutes} min</span>}
            {data.calories && <span>🔥 {Math.round(data.calories)} cal</span>}
            {data.servings && <span>👥 {data.servings} servings</span>}
          </div>
        );
      }
      return JSON.stringify(data);
    }
    return String(data);
  };

  if (!showSuggestions && !validation) return null;

  return (
    <div className="advanced-autofill-box">
      {/* Suggestions Section */}
      {showSuggestions && (
        <div className="suggestions-section">
          <div className="suggestions-header">
            <h4>🎯 Smart Suggestions for "{field}"</h4>
            <button 
              className="close-button"
              onClick={() => setShowSuggestions(false)}
            >
              ×
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Loading intelligent suggestions...</div>
          ) : (
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={suggestion.id || index}
                  className={`suggestion-item ${selectedSuggestion?.id === suggestion.id ? 'selected' : ''}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="suggestion-header">
                    <div className="suggestion-title">
                      {getSourceIcon(suggestion.source)} {suggestion.title}
                    </div>
                    <div className="suggestion-meta">
                      <span 
                        className="confidence-badge"
                        style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                      <span className="source-badge">{suggestion.source}</span>
                      {suggestion.frequency && (
                        <span className="frequency-badge">Used {suggestion.frequency} times</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="suggestion-content">
                    {formatSuggestionData(suggestion.data, field)}
                  </div>
                  
                  <div className="suggestion-actions">
                    <button 
                      className="use-suggestion-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuggestionSelect(suggestion);
                      }}
                    >
                      Use This {field.charAt(0).toUpperCase() + field.slice(1)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Validation Section */}
      {showValidation && validation && (
        <div className="validation-section">
          <div className="validation-header">
            <h4>✅ Field Validation</h4>
          </div>
          
          {validation.errors.length > 0 && (
            <div className="validation-errors">
              <h5>❌ Errors:</h5>
              <ul>
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.warnings.length > 0 && (
            <div className="validation-warnings">
              <h5>⚠️ Warnings:</h5>
              <ul>
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.suggestions.length > 0 && (
            <div className="validation-suggestions">
              <h5>💡 Suggestions:</h5>
              <ul>
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.isValid && validation.errors.length === 0 && (
            <div className="validation-success">
              ✅ Field looks good!
            </div>
          )}
        </div>
      )}

      {/* Context Information */}
      {context && (
        <div className="context-info">
          <h5>📋 Context:</h5>
          <div className="context-details">
            {Object.entries(context).map(([key, value]) => (
              <span key={key} className="context-item">
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAutofillBox; 