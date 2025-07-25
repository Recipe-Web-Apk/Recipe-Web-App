import React from 'react'
import { useDarkMode } from '../contexts/DarkModeContext'

function UserInfoCard({ user, onEditProfile }) {
  const { isDarkMode } = useDarkMode()
  
  // If user is null or undefined, show a loading state or return null
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: isDarkMode ? '#2d2d2d' : 'white',
        borderRadius: 8,
        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
        padding: '2rem',
        marginBottom: '2rem',
        maxWidth: 500,
        border: isDarkMode ? '1px solid #404040' : 'none'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: isDarkMode ? '#404040' : '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: isDarkMode ? '#b0b0b0' : '#888',
          flexShrink: 0
        }}>
          ?
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.3rem', color: isDarkMode ? '#e0e0e0' : '#666' }}>Loading user info...</div>
          <div style={{ color: isDarkMode ? '#b0b0b0' : '#999', fontSize: '1rem', marginBottom: '0.5rem' }}>Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      background: isDarkMode ? '#2d2d2d' : 'white',
      borderRadius: 8,
      boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
      padding: '2rem',
      marginBottom: '2rem',
      maxWidth: 500,
      border: isDarkMode ? '1px solid #404040' : 'none'
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: isDarkMode ? '#404040' : '#eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: isDarkMode ? '#b0b0b0' : '#888',
        flexShrink: 0
      }}>
        {user.username && user.username.length > 0 ? user.username[0].toUpperCase() : '?'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.3rem', color: isDarkMode ? '#ffffff' : '#333333' }}>{user.username || 'Unknown User'}</div>
        <div style={{ color: isDarkMode ? '#b0b0b0' : '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>{user.email || 'No email'}</div>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button
            style={{ 
              padding: '0.4rem 1rem', 
              borderRadius: 4, 
              border: isDarkMode ? '1px solid #404040' : '1px solid #eee', 
              background: isDarkMode ? '#404040' : '#f7f7f7', 
              color: isDarkMode ? '#ffffff' : '#333', 
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={onEditProfile}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserInfoCard 