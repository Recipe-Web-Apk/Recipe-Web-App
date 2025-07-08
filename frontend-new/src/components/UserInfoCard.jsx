import React from 'react'
import './UserInfoCard.css'

function UserInfoCard({ user, onEditProfile }) {
  return (
    <div className="user-info-card">
      <div className="user-info-avatar">
        {user.username[0].toUpperCase()}
      </div>
      <div className="user-info-details">
        <div className="user-info-username">{user.username}</div>
        <div className="user-info-email">{user.email}</div>
        <div className="user-info-actions">
          <button
            className="user-info-edit-btn"
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