import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IngredientTooltip from './IngredientTooltip';

describe('IngredientTooltip', () => {
  const mockIngredient = 'salt';

  test('renders ingredient name correctly', () => {
    render(
      <IngredientTooltip ingredient={mockIngredient}>
        <span>Test Ingredient</span>
      </IngredientTooltip>
    );
    
    expect(screen.getByText('Test Ingredient')).toBeInTheDocument();
  });

  test('shows tooltip on hover', () => {
    render(
      <IngredientTooltip ingredient={mockIngredient}>
        <span>Test Ingredient</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Test Ingredient');
    fireEvent.mouseEnter(trigger);
    
    // Check if tooltip content appears
    expect(screen.getByText('salt')).toBeInTheDocument();
    expect(screen.getByText(/Add salt gradually/)).toBeInTheDocument();
  });

  test('hides tooltip on mouse leave', () => {
    render(
      <IngredientTooltip ingredient={mockIngredient}>
        <span>Test Ingredient</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Test Ingredient');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    
    // Tooltip should not be visible
    expect(screen.queryByText(/Add salt gradually/)).not.toBeInTheDocument();
  });

  test('provides specific tip for garlic', () => {
    render(
      <IngredientTooltip ingredient="garlic">
        <span>Garlic</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Garlic');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/Garlic burns easily/)).toBeInTheDocument();
  });

  test('provides specific tip for olive oil', () => {
    render(
      <IngredientTooltip ingredient="olive oil">
        <span>Olive Oil</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Olive Oil');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/Extra virgin olive oil is best/)).toBeInTheDocument();
  });

  test('provides generic tip for unknown ingredient', () => {
    render(
      <IngredientTooltip ingredient="unknown ingredient">
        <span>Unknown</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Unknown');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/This ingredient adds flavor/)).toBeInTheDocument();
  });

  test('handles empty ingredient gracefully', () => {
    render(
      <IngredientTooltip ingredient="">
        <span>Empty</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Empty');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/This ingredient adds flavor/)).toBeInTheDocument();
  });

  test('provides category-based tips for fresh herbs', () => {
    render(
      <IngredientTooltip ingredient="fresh basil">
        <span>Fresh Basil</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Fresh Basil');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/Add fresh herbs like basil/)).toBeInTheDocument();
  });

  test('provides category-based tips for vegetables', () => {
    render(
      <IngredientTooltip ingredient="carrots">
        <span>Carrots</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Carrots');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/Carrots are sweeter when cooked/)).toBeInTheDocument();
  });

  test('handles case insensitive ingredient matching', () => {
    render(
      <IngredientTooltip ingredient="SALT">
        <span>Salt</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Salt');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText(/Add salt gradually/)).toBeInTheDocument();
  });

  test('shows tooltip icon', () => {
    render(
      <IngredientTooltip ingredient={mockIngredient}>
        <span>Test Ingredient</span>
      </IngredientTooltip>
    );
    
    const trigger = screen.getByText('Test Ingredient');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText('💡')).toBeInTheDocument();
  });
}); 