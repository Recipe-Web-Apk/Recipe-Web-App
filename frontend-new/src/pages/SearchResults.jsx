import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SearchResults from '../components/SearchResults';

function parseQuery(search) {
  const params = new URLSearchParams(search);
  const ingredients = params.get('ingredients')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const diet = params.get('diet') || '';
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  return { ingredients, diet, min, max };
}

function SearchResultsPage() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const { ingredients, diet, min, max } = parseQuery(location.search);
    if (ingredients.length < 4) return;
    setLoading(true);
    setSearchPerformed(false);
    fetch(`/api/recipes/search?ingredients=${encodeURIComponent(ingredients.join(','))}&diet=${encodeURIComponent(diet)}&min=${min}&max=${max}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setSearchPerformed(true);
      })
      .catch(() => {
        setResults([]);
        setSearchPerformed(true);
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Searching for recipes...</div>;
  }

  return <SearchResults results={results} searchPerformed={searchPerformed} />;
}

export default SearchResultsPage; 