import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const sampleRecipes = {
    1: {
      id: 1,
      name: 'Spaghetti Carbonara',
      image: 'https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=Carbonara',
      cookTime: '25 minutes',
      prepTime: '10 minutes',
      totalTime: '35 minutes',
      calories: 650,
      difficulty: 'Medium',
      servings: 4,
      author: 'Chef Mario',
      ingredients: [
        '400g spaghetti',
        '200g pancetta or guanciale',
        '4 large eggs',
        '100g Pecorino Romano cheese',
        '100g Parmigiano-Reggiano',
        'Black pepper',
        'Salt for pasta water'
      ],
      instructions: [
        'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
        'While pasta cooks, cut pancetta into small cubes and cook in a large skillet until crispy.',
        'In a bowl, whisk together eggs, grated cheeses, and plenty of black pepper.',
        'Drain pasta, reserving 1 cup of pasta water.',
        'Add hot pasta to the skillet with pancetta, remove from heat.',
        'Quickly stir in egg mixture, adding pasta water as needed for creamy consistency.',
        'Serve immediately with extra cheese and black pepper.'
      ],
      tags: ['Italian', 'Pasta', 'Quick Meal', 'Dinner']
    },
    2: {
      id: 2,
      name: 'Chicken Stir Fry',
      image: 'https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Stir+Fry',
      cookTime: '15 minutes',
      prepTime: '10 minutes',
      totalTime: '25 minutes',
      calories: 450,
      difficulty: 'Easy',
      servings: 4,
      author: 'Chef Sarah',
      ingredients: [
        '500g chicken breast, sliced',
        '2 cups mixed vegetables',
        '3 tbsp soy sauce',
        '2 tbsp oyster sauce',
        '1 tbsp ginger, minced',
        '2 cloves garlic, minced',
        '2 tbsp vegetable oil',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Heat oil in a wok or large skillet over high heat.',
        'Add chicken and stir-fry until golden brown, about 5 minutes.',
        'Add ginger and garlic, stir for 30 seconds.',
        'Add vegetables and stir-fry for 3-4 minutes.',
        'Add soy sauce and oyster sauce, stir to combine.',
        'Cook for 2 more minutes until everything is well coated.',
        'Season with salt and pepper, serve hot.'
      ],
      tags: ['Asian', 'Quick Meal', 'Healthy', 'Dinner']
    },
    3: {
      id: 3,
      name: 'Beef Tacos',
      image: 'https://via.placeholder.com/600x400/45B7D1/FFFFFF?text=Tacos',
      cookTime: '20 minutes',
      prepTime: '15 minutes',
      totalTime: '35 minutes',
      calories: 550,
      difficulty: 'Easy',
      servings: 6,
      author: 'Chef Carlos',
      ingredients: [
        '500g ground beef',
        '1 onion, diced',
        '2 cloves garlic, minced',
        '1 packet taco seasoning',
        '12 taco shells',
        'Shredded lettuce',
        'Diced tomatoes',
        'Shredded cheese',
        'Sour cream',
        'Salsa'
      ],
      instructions: [
        'Brown ground beef in a large skillet over medium heat.',
        'Add onion and garlic, cook until softened.',
        'Add taco seasoning and water according to package directions.',
        'Simmer for 5 minutes until thickened.',
        'Warm taco shells according to package directions.',
        'Fill shells with beef mixture and top with desired toppings.',
        'Serve immediately with salsa and sour cream.'
      ],
      tags: ['Mexican', 'Family Meal', 'Quick', 'Dinner']
    },
    4: {
      id: 4,
      name: 'Vegetable Curry',
      image: 'https://via.placeholder.com/600x400/96CEB4/FFFFFF?text=Curry',
      cookTime: '30 minutes',
      prepTime: '15 minutes',
      totalTime: '45 minutes',
      calories: 380,
      difficulty: 'Medium',
      servings: 4,
      author: 'Chef Priya',
      ingredients: [
        '2 cups mixed vegetables',
        '1 onion, diced',
        '2 cloves garlic, minced',
        '1 tbsp ginger, minced',
        '2 tbsp curry powder',
        '1 can coconut milk',
        '1 cup vegetable broth',
        '2 tbsp vegetable oil',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Heat oil in a large pot over medium heat.',
        'Add onion, garlic, and ginger, sauté until fragrant.',
        'Add curry powder and stir for 1 minute.',
        'Add vegetables and stir to coat with spices.',
        'Pour in coconut milk and vegetable broth.',
        'Simmer for 20-25 minutes until vegetables are tender.',
        'Season with salt and pepper, serve with rice.'
      ],
      tags: ['Indian', 'Vegetarian', 'Spicy', 'Dinner']
    },
    5: {
      id: 5,
      name: 'Grilled Salmon',
      image: 'https://via.placeholder.com/600x400/FFEAA7/FFFFFF?text=Salmon',
      cookTime: '10 minutes',
      prepTime: '5 minutes',
      totalTime: '15 minutes',
      calories: 420,
      difficulty: 'Easy',
      servings: 2,
      author: 'Chef Michael',
      ingredients: [
        '2 salmon fillets',
        '2 tbsp olive oil',
        '1 lemon, sliced',
        '2 sprigs fresh dill',
        'Salt and pepper to taste',
        'Garlic powder'
      ],
      instructions: [
        'Preheat grill to medium-high heat.',
        'Brush salmon with olive oil and season with salt, pepper, and garlic powder.',
        'Place salmon on grill, skin-side down.',
        'Grill for 4-5 minutes, then flip carefully.',
        'Grill for another 4-5 minutes until cooked through.',
        'Garnish with lemon slices and fresh dill.',
        'Serve immediately with your favorite sides.'
      ],
      tags: ['Seafood', 'Healthy', 'Quick', 'Dinner']
    },
    6: {
      id: 6,
      name: 'Chocolate Cake',
      image: 'https://via.placeholder.com/600x400/DDA0DD/FFFFFF?text=Cake',
      cookTime: '30 minutes',
      prepTime: '20 minutes',
      totalTime: '50 minutes',
      calories: 350,
      difficulty: 'Hard',
      servings: 12,
      author: 'Chef Emma',
      ingredients: [
        '2 cups all-purpose flour',
        '1 3/4 cups sugar',
        '3/4 cup cocoa powder',
        '1 1/2 tsp baking soda',
        '1 1/2 tsp baking powder',
        '1 tsp salt',
        '2 eggs',
        '1 cup milk',
        '1/2 cup vegetable oil',
        '2 tsp vanilla extract',
        '1 cup hot water'
      ],
      instructions: [
        'Preheat oven to 350°F (175°C) and grease two 9-inch round cake pans.',
        'In a large bowl, whisk together flour, sugar, cocoa, baking soda, baking powder, and salt.',
        'Add eggs, milk, oil, and vanilla to the dry ingredients.',
        'Beat on medium speed for 2 minutes.',
        'Stir in hot water (batter will be very thin).',
        'Pour batter into prepared pans.',
        'Bake for 30-35 minutes until a toothpick comes out clean.',
        'Cool in pans for 10 minutes, then remove to wire racks.',
        'Frost with your favorite chocolate frosting.'
      ],
      tags: ['Dessert', 'Baking', 'Chocolate', 'Sweet']
    }
  }

  const recipe = sampleRecipes[id]

  if (!recipe) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Recipe not found</h2>
        <button onClick={() => navigate('/recipes')} style={{ padding: '0.5rem 1rem', background: '#222', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Back to Recipes
        </button>
      </div>
    )
  }

  function handleSave() {
    alert('Recipe saved to your collection!')
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    alert('Recipe link copied to clipboard!')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <button 
        onClick={() => navigate('/recipes')}
        style={{ 
          padding: '0.5rem 1rem', 
          background: '#f0f0f0', 
          border: 'none', 
          borderRadius: 4, 
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        ← Back to Recipes
      </button>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '3rem',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr'
        }
      }}>
        <div>
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} 
          />
        </div>

        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{recipe.name}</h1>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {recipe.tags.map(tag => (
              <span key={tag} style={{ 
                padding: '0.3rem 0.8rem', 
                background: '#f0f0f0', 
                borderRadius: 20, 
                fontSize: '0.9rem' 
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem',
            padding: '1rem',
            background: '#f8f8f8',
            borderRadius: 8
          }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Prep Time</div>
              <div>{recipe.prepTime}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Cook Time</div>
              <div>{recipe.cookTime}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Total Time</div>
              <div>{recipe.totalTime}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Calories</div>
              <div>{recipe.calories}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Difficulty</div>
              <div>{recipe.difficulty}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#666' }}>Servings</div>
              <div>{recipe.servings}</div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>By {recipe.author}</div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={handleSave}
              style={{ 
                padding: '0.7rem 1.5rem', 
                background: '#222', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer' 
              }}
            >
              Save Recipe
            </button>
            <button 
              onClick={handleShare}
              style={{ 
                padding: '0.7rem 1.5rem', 
                background: '#f0f0f0', 
                color: '#222', 
                border: '1px solid #ddd', 
                borderRadius: 4, 
                cursor: 'pointer' 
              }}
            >
              Share
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #222', paddingBottom: '0.5rem' }}>
              Ingredients
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} style={{ 
                  padding: '0.5rem 0', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#222', 
                    borderRadius: '50%', 
                    marginRight: '1rem' 
                  }}></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #222', paddingBottom: '0.5rem' }}>
              Instructions
            </h2>
            <ol style={{ paddingLeft: '1.5rem' }}>
              {recipe.instructions.map((instruction, index) => (
                <li key={index} style={{ 
                  padding: '0.8rem 0', 
                  lineHeight: '1.6',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail 