import React from 'react'

function Recipes() {
  const sampleRecipes = [
    {
      id: 1,
      name: 'Spaghetti Carbonara',
      time: '25 min',
      difficulty: 'Medium',
      image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Carbonara'
    },
    {
      id: 2,
      name: 'Chicken Stir Fry',
      time: '20 min',
      difficulty: 'Easy',
      image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Stir+Fry'
    },
    {
      id: 3,
      name: 'Beef Tacos',
      time: '30 min',
      difficulty: 'Easy',
      image: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Tacos'
    },
    {
      id: 4,
      name: 'Vegetable Curry',
      time: '45 min',
      difficulty: 'Medium',
      image: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Curry'
    },
    {
      id: 5,
      name: 'Grilled Salmon',
      time: '15 min',
      difficulty: 'Easy',
      image: 'https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=Salmon'
    },
    {
      id: 6,
      name: 'Chocolate Cake',
      time: '60 min',
      difficulty: 'Hard',
      image: 'https://via.placeholder.com/300x200/DDA0DD/FFFFFF?text=Cake'
    }
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Recipes</h1>
        <button style={{ padding: '0.7rem 1.5rem', background: '#222', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Add Recipe
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {sampleRecipes.map(recipe => (
          <div key={recipe.id} style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src={recipe.image} alt={recipe.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{recipe.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem' }}>
                <span>Time: {recipe.time}</span>
                <span>Level: {recipe.difficulty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Recipes 