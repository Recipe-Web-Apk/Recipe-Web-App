import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Check if user is authenticated on app load
  const checkAuthStatus = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axiosInstance.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUser(response.data.user)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [token]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  async function login(email, password) {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password })

      if (response.data) {
        setUser(response.data.user)
        setToken(response.data.session.access_token)
        localStorage.setItem('token', response.data.session.access_token)
        localStorage.setItem('refresh_token', response.data.session.refresh_token)
        return { success: true }
      } else {
        return { success: false, error: response.data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error.response && error.response.data && error.response.data.error) {
        return { success: false, error: error.response.data.error }
      }
      return { success: false, error: 'Login failed. Please check your credentials and try again.' }
    }
  }

  async function register(email, password, username) {
    try {

      
      const response = await axiosInstance.post('/auth/register', { email, password, username })

      const data = response.data;
      

      if (data && !data.error) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || 'Registration failed.' }
      }
    } catch (error) {
      // If backend sent a response, show its error message
      if (error.response && error.response.data && error.response.data.error) {
        return { success: false, error: error.response.data.error };
      }
      return { success: false, error: '' }
    }
  }

  async function logout() {
    try {
      if (token) {
        await axiosInstance.post('/auth/logout', { access_token: token })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
    }
  }

  async function refreshToken() {
    try {
      const refresh_token = localStorage.getItem('refresh_token')
      if (!refresh_token) return false

      const response = await axiosInstance.post('/auth/refresh', { refresh_token })

      const data = response.data;

      if (response.data) {
        setToken(data.session.access_token)
        localStorage.setItem('token', data.session.access_token)
        localStorage.setItem('refresh_token', data.session.refresh_token)
        return true
      } else {
        // Refresh failed, logout user
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.post('/auth/change-password', { currentPassword, newPassword }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = response.data
      if (response.data) {
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        return { success: false, error: error.response.data.error }
      }
      return { success: false, error: 'Password change failed. Please try again.' }
    }
  }

  async function updateProfile(username, email) {
    try {
      const response = await axiosInstance.post('/auth/update-profile', { username, email }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = response.data
      if (response.data) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        return { success: false, error: error.response.data.error }
      }
      return { success: false, error: 'Profile update failed. Please try again.' }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    changePassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 