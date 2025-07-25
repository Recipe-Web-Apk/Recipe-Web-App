import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHero from '../components/HomeHero';
import TrendingRecipes from '../components/TrendingRecipes';
import RecipeFinder from '../components/RecipeFinder';
import HomeRecommendations from '../components/HomeRecommendations';

function Home() {
  const [showRecipeFinder, setShowRecipeFinder] = useState(false);
  const navigate = useNavigate();

  const handleRecipeSearch = (searchData) => {
    // Navigate to recipes page with the search data
    const params = new URLSearchParams();
    params.set('query', searchData.query);
    if (searchData.diet) params.set('diet', searchData.diet);
    navigate(`/recipes?${params.toString()}`);
    setShowRecipeFinder(false);
  };

  return (
    <div className="home-container">
      <HomeHero onOpenRecipeFinder={() => setShowRecipeFinder(true)} />
      <HomeRecommendations />
      <TrendingRecipes />
      <RecipeFinder 
        isOpen={showRecipeFinder}
        onClose={() => setShowRecipeFinder(false)}
        onSearch={handleRecipeSearch}
      />
    </div>
  );
}

export default Home;
