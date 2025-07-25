import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import BasicInfoSection from '../components/BasicInfoSection'
import RecipeStatsSection from '../components/RecipeStatsSection'
import IngredientsSection from '../components/IngredientsSection'
import InstructionsSection from '../components/InstructionsSection'
import FormActions from '../components/FormActions'

function EditRecipe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [recipe, setRecipe] = useState(null)
  
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
  const [error, setError] = useState(null)

  const difficultyOptions = ['Easy', 'Medium', 'Hard']
  const categoryOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer']

  useEffect(() => {
    if (!id) {
      setSubmitError('Invalid recipe id.')
      setLoading(false)
      return
    }
    if (user && user.id) {
      fetchRecipe()
    }
  }, [user, id])

  async function fetchRecipe() {
    if (!user || !user.id) return
    if (!id) return



    try {
      setLoading(true)
      setSubmitError(null)

      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching recipe:', fetchError.message);
      }
      if (!data) {
        setError('Recipe not found or you do not have permission to edit it.');
        setLoading(false);
        return;
      }

      setRecipe(data)
      
      // Parse ingredients and instructions
      const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [data.ingredients || '']
      const instructions = data.instructions ? data.instructions.split('\n\n') : ['']
      
      setForm({
        title: data.title || '',
        description: data.description || '',
        ingredients: ingredients.length > 0 ? ingredients : [''],
        instructions: instructions.length > 0 ? instructions : [''],
        difficulty: data.difficulty || '',
        category: data.category || '',
        servings: data.servings || '',
        calories: data.calories || '',
        cookTime: data.cookTime || '',
        prepTime: data.prepTime || '',
        tags: data.tags || '',
        youtube_url: data.youtube_url || ''
      })

      if (data.image) {
        setImagePreview(data.image)
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
      setSubmitError('Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

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
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!token || !user || !user.id) {
      setSubmitError('You must be logged in to edit a recipe')
      return
    }
    if (!id) {
      setSubmitError('Invalid recipe id.')
      return
    }

    setSaving(true)
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
        youtube_url: form.youtube_url.trim() || null,
        prepTime: form.prepTime ? parseInt(form.prepTime, 10) : null,
        cookTime: form.cookTime ? parseInt(form.cookTime, 10) : null,
        servings: form.servings ? parseInt(form.servings, 10) : null,
        calories: form.calories ? parseInt(form.calories, 10) : null,
        difficulty: form.difficulty || null,
        category: form.category || null,
        tags: form.tags.trim() || null,
        updated_at: new Date().toISOString()
      }



      const { data, error } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()



      if (error) {
        setSubmitError(error.message || 'Failed to update recipe')
      } else {
        alert('Recipe updated successfully!')
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Error updating recipe:', err)
      if (err.response && err.response.data && err.response.data.error) {
        setSubmitError(err.response.data.error)
      } else {
        setSubmitError('Failed to update recipe. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/dashboard')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading recipe...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem 1rem' }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  if ((!user || !user.id) && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#ff4444', fontSize: '1.1rem', marginBottom: '1rem' }}>
          You must be logged in to edit recipes.
        </div>
        <button onClick={() => navigate('/login')} style={{ padding: '0.5rem 1rem' }}>
          Go to Login
        </button>
      </div>
    )
  }

  if (submitError && !recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#ff4444', fontSize: '1.1rem', marginBottom: '1rem' }}>{submitError}</div>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem 1rem' }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  const isValid = Object.keys(validateForm()).length === 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Edit Recipe</h1>
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
          loading={saving}
          handleCancel={handleCancel}
          submitText="Update Recipe"
        />
      </form>
    </div>
  )
}

export default EditRecipe 