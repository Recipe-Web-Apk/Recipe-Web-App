import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import BasicInfoSection from '../components/BasicInfoSection'
import RecipeStatsSection from '../components/RecipeStatsSection'
import IngredientsSection from '../components/IngredientsSection'
import InstructionsSection from '../components/InstructionsSection'
import FormActions from '../components/FormActions'
import axiosInstance from '../api/axiosInstance';
import SuggestedAutofillBox from '../components/SuggestedAutofillBox';

function RecipeForm() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    difficulty: '',
    category: '',
    servings: '',
    calories: '',
    cookTime: '',
    prepTime: '',
    tags: '',
    youtube_url: ''
  })

  const [errors, setErrors] = useState({})
  const [similarRecipes, setSimilarRecipes] = useState([])
  const [showWarning, setShowWarning] = useState(false)
  const [autofillData, setAutofillData] = useState(null)
  const [ignoredSimilarityWarning, setIgnoredSimilarityWarning] = useState(false);

  const difficultyOptions = ['Easy', 'Medium', 'Hard']
  const categoryOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer']

  function validateForm() {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Recipe title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    const validIngredients = form.ingredients.filter(ing => ing.trim() !== '')
    if (validIngredients.length === 0) newErrors.ingredients = 'At least one ingredient is required'
    const validInstructions = form.instructions.filter(inst => inst.trim() !== '')
    if (validInstructions.length === 0) newErrors.instructions = 'At least one instruction is required'
    return newErrors
  }

  // Unified handler for title autofill/warning
  async function handleFieldChange(e) {
    const { name, value } = e.target;
    console.log('handleFieldChange', name, value);
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    // Reset ignore state if title changes
    if (name === 'title') setIgnoredSimilarityWarning(false);

    if (name === 'title' && value.length >= 3) {
      // Use the new value directly
      const payload = {
        title: value,
        ingredients: form.ingredients
      };
      console.log('[SIMILARITY] Sending payload:', payload);
      try {
        const res = await fetch('/api/similar-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('[SIMILARITY] Response:', data);
        if (data.length > 0) {
          setSimilarRecipes(data);
          setShowWarning(true);
          setAutofillData(null);
          console.log('[SIMILARITY] Showing warning!');
          return;
        } else {
          setShowWarning(false);
          setSimilarRecipes([]);
          console.log('[SIMILARITY] No similar recipes found.');
        }
      } catch (err) {
        setShowWarning(false);
        setSimilarRecipes([]);
        console.log('[SIMILARITY] Error:', err);
      }
      // If no backend match, call Spoonacular autofill
      try {
        const res = await fetch(`/api/autofill-recipe?title=${encodeURIComponent(value)}`);
        const data = await res.json();
        console.log('autofill-recipe response:', data);
        setAutofillData(data);
      } catch (err) {
        setAutofillData(null);
      }
    } else {
      if (name === 'title') setAutofillData(null);
    }
  }

  // Handler for ingredient changes with backend check
  async function handleIngredientChangeAndCheck(index, value) {
    console.log('handleIngredientChangeAndCheck', index, value);
    const newIngredients = [...form.ingredients];
    newIngredients[index] = value;
    setForm(prev => ({ ...prev, ingredients: newIngredients }));
    if (errors.ingredients) setErrors(prev => ({ ...prev, ingredients: '' }));

    if (newIngredients.filter(ing => ing.trim() !== '').length > 0) {
      // Use newIngredients directly
      const payload = { title: form.title, ingredients: newIngredients };
      try {
        const res = await fetch('/api/similar-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('similar-recipes response (ingredients):', data);
        if (data.length > 0) {
          setSimilarRecipes(data);
          setShowWarning(true);
          setAutofillData(null);
          return;
        } else {
          setShowWarning(false);
          setSimilarRecipes([]);
        }
      } catch (err) {
        setShowWarning(false);
        setSimilarRecipes([]);
      }
    }
  }

  const handleUseIngredients = (suggestedIngredients) => {
    setForm(prev => ({ ...prev, ingredients: suggestedIngredients }))
  }

  const handleUseInstructions = (suggestedInstructions) => {
    setForm(prev => ({ ...prev, instructions: suggestedInstructions }))
  }

  const handleUseStats = (suggestedStats) => {
    setForm(prev => ({
      ...prev,
      cookTime: suggestedStats.readyInMinutes || prev.cookTime,
      calories: suggestedStats.calories ? Math.round(suggestedStats.calories) : prev.calories,
      servings: suggestedStats.servings || prev.servings
    }))
  }

  const handleUseImage = (imageUrl) => {
    setImagePreview(imageUrl);
  };

  const handleUseDescription = (desc) => {
    setForm(prev => ({ ...prev, description: desc }));
  };
  const handleUseCategory = (cat) => {
    setForm(prev => ({ ...prev, category: cat }));
  };
  const handleUseDifficulty = (diff) => {
    setForm(prev => ({ ...prev, difficulty: diff }));
  };
  const handleUseTags = (tags) => {
    setForm(prev => ({ ...prev, tags: tags }));
  };
  const handleUseYoutubeUrl = (url) => {
    setForm(prev => ({ ...prev, youtube_url: url }));
  };

  async function checkForSimilarRecipes() {
    const res = await fetch('/api/similar-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, ingredients: form.ingredients })
    })
    const data = await res.json()
    if (data.length > 0) {
      setSimilarRecipes(data)
      setShowWarning(true)
      return true
    }
    return false
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function handleIngredientChange(index, value) {
    const newIngredients = [...form.ingredients]
    newIngredients[index] = value
    setForm(prev => ({ ...prev, ingredients: newIngredients }))
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }))
    }
  }

  function handleInstructionChange(index, value) {
    const newInstructions = [...form.instructions]
    newInstructions[index] = value
    setForm(prev => ({ ...prev, instructions: newInstructions }))
    if (errors.instructions) {
      setErrors(prev => ({ ...prev, instructions: '' }))
    }
  }

  function addIngredient() {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }))
  }

  function removeIngredient(index) {
    if (form.ingredients.length > 1) {
      const newIngredients = form.ingredients.filter((_, i) => i !== index)
      setForm(prev => ({ ...prev, ingredients: newIngredients }))
    }
  }

  function addInstruction() {
    setForm(prev => ({ ...prev, instructions: [...prev.instructions, ''] }))
  }

  function removeInstruction(index) {
    if (form.instructions.length > 1) {
      const newInstructions = form.instructions.filter((_, i) => i !== index)
      setForm(prev => ({ ...prev, instructions: newInstructions }))
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Compress the image to reduce payload size
        compressImage(reader.result, (compressedImage) => {
          setImagePreview(compressedImage)
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to compress image
  function compressImage(base64String, callback) {
    const img = new Image()
    img.onload = function() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set maximum dimensions
      const maxWidth = 800
      const maxHeight = 600
      
      let { width, height } = img
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      const compressedImage = canvas.toDataURL('image/jpeg', 0.7) // 70% quality
      
      callback(compressedImage)
    }
    img.src = base64String
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!token) {
      setSubmitError('You must be logged in to create a recipe')
      return
    }

    // Block submission if warning is visible and not ignored
    if (showWarning && !ignoredSimilarityWarning) return;

    // Similarity check before submit
    const similar = await checkForSimilarRecipes()
    if (similar) return // Show warning, don't submit yet

    setLoading(true)
    setSubmitError(null)
    
    try {
      const validIngredients = form.ingredients.filter(ing => ing.trim() !== '')
      const validInstructions = form.instructions.filter(inst => inst.trim() !== '')
      
      const recipeData = {
        title: form.title.trim(),
        description: form.description.trim(),
        ingredients: validIngredients,
        instructions: validInstructions.join('\n\n'),
        image: imagePreview || null,
        youtube_url: form.youtube_url.trim() || null
      }

      // Only add optional fields if they have values
      if (form.prepTime) recipeData.prepTime = parseInt(form.prepTime)
      if (form.cookTime) recipeData.cookTime = parseInt(form.cookTime)
      if (form.servings) recipeData.servings = parseInt(form.servings)
      if (form.calories) recipeData.calories = parseInt(form.calories)
      if (form.difficulty) recipeData.difficulty = form.difficulty
      if (form.category) recipeData.category = form.category
      if (form.tags) recipeData.tags = form.tags.trim()

      const response = await axiosInstance.post('/recipes', recipeData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        alert('Recipe created successfully!')
        navigate('/recipes?tab=my-recipes') // Redirect to My Recipes tab
      } else {
        console.error('Recipe creation error:', response.data.error)
        setSubmitError(response.data.error || 'Failed to create recipe')
      }
    } catch (error) {
      console.error('Error creating recipe:', error)
      setSubmitError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/recipes')
    }
  }

  const isValid = Object.keys(validateForm()).length === 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Create New Recipe</h1>
        <button 
          onClick={handleCancel}
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#f0f0f0', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
      </div>

      {/* Buttons for Cooking Time, Calories, Servings */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          style={{ 
            padding: '0.5rem 1.2rem', 
            borderRadius: 6, 
            border: '1px solid #ccc', 
            background: form.cookTime ? '#e8f5e8' : '#fff', 
            cursor: 'pointer',
            fontWeight: form.cookTime ? 'bold' : 'normal'
          }}
          onClick={() => alert(`Cooking Time: ${form.cookTime || 'Not set'} minutes`)}
        >
          Cooking Time {form.cookTime && `(${form.cookTime} min)`}
        </button>
        <button
          type="button"
          style={{ 
            padding: '0.5rem 1.2rem', 
            borderRadius: 6, 
            border: '1px solid #ccc', 
            background: form.calories ? '#e8f5e8' : '#fff', 
            cursor: 'pointer',
            fontWeight: form.calories ? 'bold' : 'normal'
          }}
          onClick={() => alert(`Calories: ${form.calories || 'Not set'}`)}
        >
          Calories {form.calories && `(${form.calories})`}
        </button>
        <button
          type="button"
          style={{ 
            padding: '0.5rem 1.2rem', 
            borderRadius: 6, 
            border: '1px solid #ccc', 
            background: form.servings ? '#e8f5e8' : '#fff', 
            cursor: 'pointer',
            fontWeight: form.servings ? 'bold' : 'normal'
          }}
          onClick={() => alert(`Servings: ${form.servings || 'Not set'}`)}
        >
          Servings {form.servings && `(${form.servings})`}
        </button>
      </div>

      {autofillData && !showWarning && (
        <SuggestedAutofillBox
          data={autofillData}
          onUseIngredients={handleUseIngredients}
          onUseInstructions={handleUseInstructions}
          onUseStats={handleUseStats}
          onUseImage={handleUseImage}
          onUseDescription={handleUseDescription}
          onUseCategory={handleUseCategory}
          onUseDifficulty={handleUseDifficulty}
          onUseTags={handleUseTags}
          onUseYoutubeUrl={handleUseYoutubeUrl}
        />
      )}

      {showWarning && (
        <div className="warning-box" style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '1rem', borderRadius: 8, marginBottom: 16 }}>
          <h4>⚠️ Similar Recipe Found</h4>
          <ul>
            {similarRecipes.map(({ recipe, score }) => (
              <li key={recipe.id}>
                {recipe.title} - {Math.round(score * 100)}% match
                {/* Removed View button */}
              </li>
            ))}
          </ul>
          <button onClick={() => { setShowWarning(false); setIgnoredSimilarityWarning(true); }} style={{ marginTop: 8 }}>
            Ignore Warning & Submit Anyway
          </button>
          <div style={{ fontSize: '0.95em', color: '#b8860b', marginTop: 6 }}>
            You can continue creating your recipe, or review the similar ones above.
          </div>
        </div>
      )}

      {submitError && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '1rem', 
          borderRadius: 4, 
          marginBottom: '1rem' 
        }}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <BasicInfoSection 
          form={form}
          errors={errors}
          handleChange={handleFieldChange}
          handleTitleChange={handleFieldChange}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
        />

        <RecipeStatsSection 
          form={form}
          errors={errors}
          handleChange={e => {
            const { name, value } = e.target;
            setForm(prev => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
          }}
        />

        <IngredientsSection 
          form={form}
          errors={errors}
          handleIngredientChange={handleIngredientChangeAndCheck}
          addIngredient={addIngredient}
          removeIngredient={removeIngredient}
        />

        <InstructionsSection 
          form={form}
          errors={errors}
          handleInstructionChange={handleInstructionChange}
          addInstruction={addInstruction}
          removeInstruction={removeInstruction}
        />

        <FormActions 
          isValid={isValid}
          loading={loading}
          handleCancel={handleCancel}
          submitText="Create Recipe"
          loadingText="Creating..."
        />
      </form>
    </div>
  )
}

export default RecipeForm 