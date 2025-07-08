import React from 'react'

function UserInfoCard({ user, onEditProfile }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '2rem',
      marginBottom: '2rem',
      maxWidth: 500
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#888',
        flexShrink: 0
      }}>
        {user.username[0].toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.3rem' }}>{user.username}</div>
        <div style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>{user.email}</div>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button
            style={{ padding: '0.4rem 1rem', borderRadius: 4, border: '1px solid #eee', background: '#f7f7f7', color: '#333', cursor: 'pointer' }}
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