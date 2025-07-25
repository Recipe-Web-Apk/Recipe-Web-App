import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import BasicInfoSection from '../components/BasicInfoSection'
import RecipeStatsSection from '../components/RecipeStatsSection'
import IngredientsSection from '../components/IngredientsSection'
import InstructionsSection from '../components/InstructionsSection'
import FormActions from '../components/FormActions'
import SimilarityWarning from '../components/SimilarityWarning'
import SuggestedAutofillBox from '../components/SuggestedAutofillBox'
import axiosInstance from '../api/axiosInstance';
// Autofill components removed - similarity only
import similarityAPI from '../api/similarity';

// Add CSS for loading animation
const loadingStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = loadingStyles;
  document.head.appendChild(styleSheet);
}

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
    cookingStyle: '',
    cookingMethod: '',
    tags: '',
    youtube_url: ''
  })

  const [errors, setErrors] = useState({})
  const [similarityWarning, setSimilarityWarning] = useState(null)
  const [autofillSuggestion, setAutofillSuggestion] = useState(null)
  const [ignoredSimilarityWarning, setIgnoredSimilarityWarning] = useState(false)
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false)
  
  // Autofill state removed - similarity only

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

  // Unified handler for field changes - SIMILARITY ONLY
  async function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    // Reset ignore state if title changes
    if (name === 'title') {
      setIgnoredSimilarityWarning(false);
      setSimilarityWarning(null);
      setAutofillSuggestion(null);
    }

    // ONLY check similarity for title field - NO AUTOFILL
    if (name === 'title' && value.length >= 3) {
      // PRIORITY 1: Check for similar recipes ONLY
      setIsCheckingSimilarity(true);
      setSimilarityWarning(null); // Clear any existing warnings
      setAutofillSuggestion(null); // Clear any existing autofill
      
      try {
        const result = await similarityAPI.checkSimilarity(value, form.ingredients, form.category, form.cookTime, token);
        
        if (result.hasSimilarRecipes) {
          setSimilarityWarning(result.warning);
          setAutofillSuggestion(result.autofillSuggestion);
          // NO AUTOFILL - similarity check is the only feature
        } else {
          setSimilarityWarning(null);
          
          // Get autofill suggestions when no similar recipes found
          try {
            const autofillResult = await similarityAPI.getAutofillSuggestions(
              value,
              form.ingredients,
              form.category,
              form.cookTime,
              token
            );
            
            if (autofillResult.success && autofillResult.suggestion) {
              setAutofillSuggestion({
                title: autofillResult.suggestion.title,
                ingredients: autofillResult.suggestion.ingredients || [],
                instructions: autofillResult.suggestion.instructions || [],
                image: autofillResult.suggestion.image,
                cookingStats: autofillResult.suggestion.cookingStats || {}
              });
            } else {
              setAutofillSuggestion(null);
            }
          } catch (autofillError) {
            console.error('❌ [AUTOFILL] Error getting suggestions:', autofillError);
            setAutofillSuggestion(null);
          }
        }
      } catch (error) {
        console.error('[SIMILARITY] Error checking similarity:', error);
        setSimilarityWarning(null);
        setAutofillSuggestion(null);
      } finally {
        setIsCheckingSimilarity(false);
      }
    }
  }

  // Handler for ingredient changes with backend check
  async function handleIngredientChangeAndCheck(index, value) {
    const newIngredients = [...form.ingredients];
    newIngredients[index] = value;
    setForm(prev => ({ ...prev, ingredients: newIngredients }));
    if (errors.ingredients) setErrors(prev => ({ ...prev, ingredients: '' }));

    if (newIngredients.filter(ing => ing.trim() !== '').length > 0 && form.title.length >= 3) {
      // Check for similar recipes with updated ingredients
      setIsCheckingSimilarity(true);
      try {
        const result = await similarityAPI.checkSimilarity(form.title, newIngredients, form.category, form.cookTime, token);
        
        if (result.hasSimilarRecipes) {
          setSimilarityWarning(result.warning);
          setAutofillSuggestion(result.autofillSuggestion);
        } else {
          setSimilarityWarning(null);
          
          // Get autofill suggestions when no similar recipes found
          try {
            const autofillResult = await similarityAPI.getAutofillSuggestions(
              form.title,
              newIngredients,
              form.category,
              form.cookTime,
              token
            );
            
            if (autofillResult.success && autofillResult.suggestion) {
              setAutofillSuggestion({
                title: autofillResult.suggestion.title,
                ingredients: autofillResult.suggestion.ingredients || [],
                instructions: autofillResult.suggestion.instructions || [],
                image: autofillResult.suggestion.image,
                cookingStats: autofillResult.suggestion.cookingStats || {}
              });
            } else {
              setAutofillSuggestion(null);
            }
          } catch (autofillError) {
            console.error('❌ [AUTOFILL] Error getting suggestions:', autofillError);
            setAutofillSuggestion(null);
          }
        }
      } catch (error) {
        console.error('[SIMILARITY] Error checking similarity:', error);
        setSimilarityWarning(null);
        setAutofillSuggestion(null);
      } finally {
        setIsCheckingSimilarity(false);
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

  // Similarity warning handlers
  const handleIgnoreSimilarityWarning = () => {
    setSimilarityWarning(null);
    setIgnoredSimilarityWarning(true);
  };

  const handleViewSimilarRecipe = (recipe) => {
    // Navigate to recipe detail page
    window.open(`/recipe/${recipe.id}`, '_blank');
  };

  const handleUseAutofillSuggestion = (autofillData) => {
    // Apply autofill data to form
    if (autofillData.ingredients) {
      setForm(prev => ({ ...prev, ingredients: autofillData.ingredients }));
    }
    if (autofillData.instructions) {
      setForm(prev => ({ ...prev, instructions: autofillData.instructions }));
    }
    if (autofillData.cookingTime) {
      setForm(prev => ({ ...prev, cookTime: autofillData.cookingTime }));
    }
    if (autofillData.servings) {
      setForm(prev => ({ ...prev, servings: autofillData.servings }));
    }
    if (autofillData.difficulty) {
      setForm(prev => ({ ...prev, difficulty: autofillData.difficulty }));
    }
    if (autofillData.cuisine) {
      setForm(prev => ({ ...prev, category: autofillData.cuisine }));
    }
    if (autofillData.dietaryTags) {
      setForm(prev => ({ ...prev, tags: autofillData.dietaryTags.join(', ') }));
    }
    
    // Clear the warning after autofill
    setSimilarityWarning(null);
    setIgnoredSimilarityWarning(true);
  };

  // Autofill functions removed - similarity only

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
    if (similarityWarning && !ignoredSimilarityWarning) return;

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
      if (form.cookingStyle) recipeData.cookingStyle = form.cookingStyle
      if (form.cookingMethod) recipeData.cookingMethod = form.cookingMethod
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
      if (error.response && error.response.data && error.response.data.error) {
        setSubmitError(error.response.data.error)
      } else {
        setSubmitError('Failed to create recipe. Please try again.')
      }
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

      {/* Advanced Autofill Toggle */}
            {/* Autofill toggle removed - similarity only */}



      {/* Similarity Checking Loading Indicator */}
      {isCheckingSimilarity && (
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #2196f3',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#1976d2', fontWeight: '500' }}>
            Checking for similar recipes...
          </span>
        </div>
      )}

      {/* Similarity Warning Component - PRIORITY 1 */}
      {similarityWarning && !ignoredSimilarityWarning && (
        <div style={{ marginBottom: '20px' }}>
          <SimilarityWarning
            warning={similarityWarning}
            autofillSuggestion={autofillSuggestion}
            currentRecipeData={form}
            onIgnore={handleIgnoreSimilarityWarning}
            onViewRecipe={handleViewSimilarRecipe}
            onUseAutofill={handleUseAutofillSuggestion}
          />
        </div>
      )}

      {/* Autofill Suggestion Component - Show when no similar recipes found */}
      {autofillSuggestion && !similarityWarning && (
        <div style={{ marginBottom: '20px' }}>
          <SuggestedAutofillBox
            data={autofillSuggestion}
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