import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SaveRecipeButton from './SaveRecipeButton';
import { AuthProvider } from '../contexts/AuthContext';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      eq: jest.fn()
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
};

jest.mock('../supabaseClient', () => ({
  supabase: mockSupabase
}));

const mockRecipe = {
  id: 123,
  title: 'Test Recipe',
  image: 'test-image.jpg'
};

const renderWithAuth = (component, user = null) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('SaveRecipeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders save button when user is logged in', () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} />,
      mockUser
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Save recipe');
  });

  test('does not render when user is not logged in', () => {
    renderWithAuth(<SaveRecipeButton recipe={mockRecipe} />);

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('shows loading state when saving', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    // Mock the insert to resolve after a delay
    mockSupabase.from().insert().eq.mockResolvedValue({ error: null });

    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} />,
      mockUser
    );

    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  test('shows saved state after successful save', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    // Mock the insert to succeed
    mockSupabase.from().insert().eq.mockResolvedValue({ error: null });

    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} />,
      mockUser
    );

    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.getByText('❤️')).toBeInTheDocument();
    });
  });

  test('shows unsaved state after successful unsave', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    // Mock the delete to succeed
    mockSupabase.from().delete().eq.mockResolvedValue({ error: null });

    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} />,
      mockUser
    );

    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('🤍')).toBeInTheDocument();
    });
  });

  test('calls onSave callback when recipe is saved', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    const onSave = jest.fn();
    
    mockSupabase.from().insert().eq.mockResolvedValue({ error: null });

    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} onSave={onSave} />,
      mockUser
    );

    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(mockRecipe);
    });
  });

  test('calls onUnsave callback when recipe is unsaved', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    const onUnsave = jest.fn();
    
    mockSupabase.from().delete().eq.mockResolvedValue({ error: null });

    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} onUnsave={onUnsave} />,
      mockUser
    );

    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onUnsave).toHaveBeenCalledWith(mockRecipe);
    });
  });

  test('triggers storage events when saving/unsaving', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    mockSupabase.from().insert().eq.mockResolvedValue({ error: null });

    renderWithAuth(
      <SaveRecipeButton recipe={mockRecipe} />,
      mockUser
    );

    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith('recipeSaved', expect.any(String));
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('recipeSaved');
    });
  });
}); 