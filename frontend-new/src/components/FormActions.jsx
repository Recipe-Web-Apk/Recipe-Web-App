import React from 'react'

function FormActions({ isValid, loading, handleCancel }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
      <button
        type="button"
        onClick={handleCancel}
        style={{ 
          padding: '0.7rem 1.5rem', 
          background: '#f0f0f0', 
          color: '#222', 
          border: '1px solid #ddd', 
          borderRadius: 4, 
          cursor: 'pointer' 
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!isValid || loading}
        style={{ 
          padding: '0.7rem 1.5rem', 
          background: isValid && !loading ? '#222' : '#ccc', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 4, 
          cursor: isValid && !loading ? 'pointer' : 'not-allowed' 
        }}
      >
        {loading ? 'Creating...' : 'Create Recipe'}
      </button>
    </div>
  )
}

export default FormActions 