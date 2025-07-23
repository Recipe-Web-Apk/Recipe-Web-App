import React from 'react';
import HomeHero from '../components/HomeHero';
import TrendingRecipes from '../components/TrendingRecipes';
import RecipeFinder from '../components/RecipeFinder';
import HomeRecommendations from '../components/HomeRecommendations';

function Home() {
  return (
    <div className="home-container">
      <HomeHero />
      <HomeRecommendations />
      <TrendingRecipes />
      <RecipeFinder />
    </div>
  );
}

export default Home;
