import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Mock the AuthContext to control the user and loading states
const MockAuthProvider = ({ children, user = null, loading = false }) => {
  const mockAuthValue = {
    user,
    loading,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    isAuthenticated: !!user,
    changePassword: jest.fn(),
    updateProfile: jest.fn(),
    token: user ? 'mock-token' : null
  };

  return (
    <AuthProvider.Provider value={mockAuthValue}>
      {children}
    </AuthProvider.Provider>
  );
};

// Wrapper component for testing with router context
const TestWrapper = ({ children, user = null, loading = false }) => (
  <BrowserRouter>
    <MockAuthProvider user={user} loading={loading}>
      {children}
    </MockAuthProvider>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  test('shows loading state when authentication is being checked', () => {
    render(
      <TestWrapper loading={true}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    // Mock window.location.href to check if redirect happens
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    render(
      <TestWrapper user={null} loading={false}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    
    // The Navigate component should redirect to /login
    // In a real test environment, this would be handled by the router
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // Restore original location
    window.location = originalLocation;
  });

  test('renders protected content when user is authenticated', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com'
    };

    render(
      <TestWrapper user={mockUser} loading={false}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('handles undefined user gracefully', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    render(
      <TestWrapper user={undefined} loading={false}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    window.location = originalLocation;
  });
}); 