import React, { useState } from 'react'
import UserInfoCard from '../components/UserInfoCard'
import RecipeCard from '../components/RecipeCard'

function Dashboard() {
  const [savedRecipes, setSavedRecipes] = useState([
    {
      id: 1,
      title: 'Jollof Rice',
      calories: 450,
      image: '/images/jollof.jpg'
    },
    {
      id: 2,
      title: 'Chicken Stew',
      calories: 520,
      image: '/images/stew.jpg'
    }
  ])

  const user = {
    username: 'vincent',
    email: 'vincent@example.com'
  }

  function handleRemoveRecipe(id) {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id))
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard</h1>
      <UserInfoCard user={user} />
      <div>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Saved Recipes</h2>
        {savedRecipes.length === 0 ? (
          <div style={{ color: '#666', fontSize: '1.1rem', padding: '2rem 0' }}>
            No saved recipes yet
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {savedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                allowDelete={true}
                onDelete={handleRemoveRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 