import React from 'react'

function BasicInfoSection({ form, errors, handleChange, handleTitleChange, imagePreview, handleImageChange }) {
  const categoryOptions = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer']

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Recipe Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.title ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
            placeholder="Enter recipe title"
          />
          {errors.title && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.title}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.category ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
          >
            <option value="">Select category</option>
            {categoryOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.category && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.category}</div>}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Description *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          style={{ 
            width: '100%', 
            padding: '0.7rem', 
            border: `1px solid ${errors.description ? '#ff4444' : '#ccc'}`, 
            borderRadius: 4,
            resize: 'vertical'
          }}
          placeholder="Describe your recipe..."
        />
        {errors.description && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.description}</div>}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Recipe Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.3rem' }}>
          Recommended: 600x400px, JPG or PNG
        </div>
        {imagePreview && (
          <div style={{ marginTop: '1rem' }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '150px', 
                borderRadius: 4,
                border: '1px solid #ccc'
              }} 
            />
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          YouTube Video URL (Optional)
        </label>
        <input
          type="url"
          name="youtube_url"
          value={form.youtube_url}
          onChange={handleChange}
          style={{ 
            width: '100%', 
            padding: '0.7rem', 
            border: `1px solid ${errors.youtube_url ? '#ff4444' : '#ccc'}`, 
            borderRadius: 4 
          }}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.3rem' }}>
          Add a YouTube video link to help users understand the cooking process better
        </div>
        {errors.youtube_url && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.youtube_url}</div>}
      </div>
    </>
  )
}

export default BasicInfoSection 