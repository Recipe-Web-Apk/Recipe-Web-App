import React from 'react';
import HomeHero from '../components/HomeHero';
import TrendingRecipes from '../components/TrendingRecipes';
import RecipeFinder from '../components/RecipeFinder';

function Home() {
  return (
    <div className="home-container">
      <HomeHero />
      <TrendingRecipes />
      <RecipeFinder />
    </div>
  );
}

export default Home;
