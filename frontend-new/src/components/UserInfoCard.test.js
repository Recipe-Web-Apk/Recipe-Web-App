import React from 'react';
import { render, screen } from '@testing-library/react';
import UserInfoCard from './UserInfoCard';

describe('UserInfoCard', () => {
  const mockOnEditProfile = jest.fn();

  test('renders loading state when user is null', () => {
    render(<UserInfoCard user={null} onEditProfile={mockOnEditProfile} />);
    
    expect(screen.getByText('Loading user info...')).toBeInTheDocument();
    expect(screen.getByText('Please wait')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('renders loading state when user is undefined', () => {
    render(<UserInfoCard user={undefined} onEditProfile={mockOnEditProfile} />);
    
    expect(screen.getByText('Loading user info...')).toBeInTheDocument();
    expect(screen.getByText('Please wait')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('renders user info when user is provided', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com'
    };

    render(<UserInfoCard user={mockUser} onEditProfile={mockOnEditProfile} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of username
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  test('handles user with missing username gracefully', () => {
    const mockUser = {
      email: 'test@example.com'
    };

    render(<UserInfoCard user={mockUser} onEditProfile={mockOnEditProfile} />);
    
    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument(); // Fallback for missing username
  });

  test('handles user with missing email gracefully', () => {
    const mockUser = {
      username: 'testuser'
    };

    render(<UserInfoCard user={mockUser} onEditProfile={mockOnEditProfile} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('No email')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of username
  });

  test('handles empty username string gracefully', () => {
    const mockUser = {
      username: '',
      email: 'test@example.com'
    };

    render(<UserInfoCard user={mockUser} onEditProfile={mockOnEditProfile} />);
    
    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument(); // Fallback for empty username
  });
}); 