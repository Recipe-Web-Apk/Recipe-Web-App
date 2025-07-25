import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeFinder from './RecipeFinder';

// Mock the IngredientInputList component
jest.mock('./IngredientInputList', () => {
  return function MockIngredientInputList({ ingredients, setIngredients, errors, minIngredients, label }) {
    return (
      <div data-testid="ingredient-input-list">
        <label>{label}</label>
        {ingredients.map((ingredient, index) => (
          <input
            key={index}
            data-testid={`ingredient-input-${index}`}
            value={ingredient}
            onChange={(e) => {
              const newIngredients = [...ingredients];
              newIngredients[index] = e.target.value;
              setIngredients(newIngredients);
            }}
            placeholder={`Ingredient ${index + 1}`}
          />
        ))}
        {errors.ingredients && <div data-testid="ingredient-error">{errors.ingredients}</div>}
      </div>
    );
  };
});

const renderRecipeFinder = (props = {}) => {
  return render(
    <BrowserRouter>
      <RecipeFinder {...props} />
    </BrowserRouter>
  );
};

describe('RecipeFinder', () => {
  const mockOnClose = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when isOpen is true', () => {
    renderRecipeFinder({ isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByText('Find Recipes by Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Enter at least 3 ingredients to find matching recipes')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    renderRecipeFinder({ isOpen: false, onClose: mockOnClose });
    
    expect(screen.queryByText('Find Recipes by Ingredients')).not.toBeInTheDocument();
  });

  test('starts with 3 empty ingredient inputs', () => {
    renderRecipeFinder({ isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByTestId('ingredient-input-0')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-input-1')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-input-2')).toBeInTheDocument();
  });

  test('shows error when submitting with less than 3 ingredients', async () => {
    renderRecipeFinder({ isOpen: true, onClose: mockOnClose, onSearch: mockOnSearch });
    
    // Fill only 2 ingredients
    fireEvent.change(screen.getByTestId('ingredient-input-0'), { target: { value: 'chicken' } });
    fireEvent.change(screen.getByTestId('ingredient-input-1'), { target: { value: 'rice' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Search Recipes'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter at least 3 ingredients to search for recipes.')).toBeInTheDocument();
    });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('submits successfully with 3 or more ingredients', async () => {
    renderRecipeFinder({ isOpen: true, onClose: mockOnClose, onSearch: mockOnSearch });
    
    // Fill 3 ingredients
    fireEvent.change(screen.getByTestId('ingredient-input-0'), { target: { value: 'chicken' } });
    fireEvent.change(screen.getByTestId('ingredient-input-1'), { target: { value: 'rice' } });
    fireEvent.change(screen.getByTestId('ingredient-input-2'), { target: { value: 'vegetables' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Search Recipes'));
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        query: 'chicken, rice, vegetables',
        diet: '',
        ingredients: ['chicken', 'rice', 'vegetables']
      });
    });
  });

  test('resets form when closed', () => {
    renderRecipeFinder({ isOpen: true, onClose: mockOnClose });
    
    // Fill some ingredients
    fireEvent.change(screen.getByTestId('ingredient-input-0'), { target: { value: 'chicken' } });
    
    // Close the modal
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 