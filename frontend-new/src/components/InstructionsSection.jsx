import React from 'react'

function InstructionsSection({ form, errors, handleInstructionChange, addInstruction, removeInstruction }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>
          Instructions *
        </label>
        <button
          type="button"
          onClick={addInstruction}
          style={{ 
            padding: '0.3rem 0.8rem', 
            background: '#4CAF50', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          + Add Step
        </button>
      </div>
      {form.instructions.map((instruction, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ 
              background: '#222', 
              color: '#fff', 
              borderRadius: '50%', 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {index + 1}
            </span>
            <input
              type="text"
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.7rem', 
                border: '1px solid #ccc', 
                borderRadius: 4 
              }}
              placeholder={`Step ${index + 1}`}
            />
            {form.instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                style={{ 
                  padding: '0.7rem 1rem', 
                  background: '#ff4444', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer' 
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      {errors.instructions && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.instructions}</div>}
    </div>
  )
}

export default InstructionsSection 