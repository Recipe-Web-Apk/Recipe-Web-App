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
        navigate('/recipes')
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
          handleChange={handleChange}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
        />

        <RecipeStatsSection 
          form={form}
          errors={errors}
          handleChange={handleChange}
        />

        <IngredientsSection 
          form={form}
          errors={errors}
          handleIngredientChange={handleIngredientChange}
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