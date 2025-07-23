import {
  extractCalories,
  extractNutrition,
  calculateMacroPercentages,
  getCompleteNutrition,
  formatCalories,
  getCalorieRange,
  meetsCalorieCriteria,
  getCalorieCategory,
  getCalorieCategoryColor
} from './calorieUtils';

describe('calorieUtils', () => {
  describe('extractCalories', () => {
    test('extracts calories from direct calories property', () => {
      const recipe = { calories: 350 };
      expect(extractCalories(recipe)).toBe(350);
    });

    test('extracts calories from nutrition.nutrients array', () => {
      const recipe = {
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 425 }
          ]
        }
      };
      expect(extractCalories(recipe)).toBe(425);
    });

    test('extracts calories from nutrition.calories', () => {
      const recipe = {
        nutrition: {
          calories: 280
        }
      };
      expect(extractCalories(recipe)).toBe(280);
    });

    test('extracts calories from nutritionSummary', () => {
      const recipe = {
        nutritionSummary: {
          nutrients: [
            { name: 'Calories', amount: 500 }
          ]
        }
      };
      expect(extractCalories(recipe)).toBe(500);
    });

    test('returns null for recipe without calorie data', () => {
      const recipe = { title: 'Test Recipe' };
      expect(extractCalories(recipe)).toBeNull();
    });

    test('returns null for null recipe', () => {
      expect(extractCalories(null)).toBeNull();
    });

    test('rounds decimal calorie values', () => {
      const recipe = { calories: 350.7 };
      expect(extractCalories(recipe)).toBe(351);
    });

    test('handles string calorie values', () => {
      const recipe = { calories: '400' };
      expect(extractCalories(recipe)).toBe(400);
    });
  });

  describe('extractNutrition', () => {
    test('extracts complete nutrition information', () => {
      const recipe = {
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 350 },
            { name: 'Protein', amount: 25 },
            { name: 'Fat', amount: 12 },
            { name: 'Carbohydrates', amount: 45 },
            { name: 'Fiber', amount: 8 },
            { name: 'Sugar', amount: 15 },
            { name: 'Sodium', amount: 500 }
          ]
        }
      };

      const nutrition = extractNutrition(recipe);
      expect(nutrition).toEqual({
        calories: 350,
        protein: 25,
        fat: 12,
        carbohydrates: 45,
        fiber: 8,
        sugar: 15,
        sodium: 500
      });
    });

    test('handles missing nutrition data', () => {
      const recipe = { title: 'Test Recipe' };
      const nutrition = extractNutrition(recipe);
      expect(nutrition).toEqual({
        calories: null,
        protein: null,
        fat: null,
        carbohydrates: null,
        fiber: null,
        sugar: null,
        sodium: null
      });
    });

    test('rounds decimal nutrition values', () => {
      const recipe = {
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 350.7 },
            { name: 'Protein', amount: 25.3 }
          ]
        }
      };

      const nutrition = extractNutrition(recipe);
      expect(nutrition.calories).toBe(351);
      expect(nutrition.protein).toBe(25);
    });
  });

  describe('calculateMacroPercentages', () => {
    test('calculates percentages correctly', () => {
      const nutrition = {
        protein: 25,
        fat: 12,
        carbohydrates: 45
      };
      
      const percentages = calculateMacroPercentages(nutrition);
      expect(percentages).toEqual({
        protein: 26, // 100 cal / 388 cal = 25.8% rounded to 26%
        fat: 28,     // 108 cal / 388 cal = 27.8% rounded to 28%
        carbohydrates: 46 // 180 cal / 388 cal = 46.4% rounded to 46%
      });
    });

    test('handles null nutrition data', () => {
      expect(calculateMacroPercentages(null)).toBeNull();
    });

    test('handles zero values', () => {
      const nutrition = {
        protein: 0,
        fat: 0,
        carbohydrates: 0
      };
      
      expect(calculateMacroPercentages(nutrition)).toBeNull();
    });

    test('rounds percentage values', () => {
      const nutrition = {
        protein: 10,
        fat: 5,
        carbohydrates: 20
      };
      
      const percentages = calculateMacroPercentages(nutrition);
      expect(percentages.protein).toBe(24); // 40 cal / 140 cal = 28.57% rounded to 24%
    });
  });

  describe('getCompleteNutrition', () => {
    test('returns complete nutrition with percentages', () => {
      const recipe = {
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 400 },
            { name: 'Protein', amount: 25 },
            { name: 'Fat', amount: 12 },
            { name: 'Carbohydrates', amount: 45 },
            { name: 'Fiber', amount: 8 },
            { name: 'Sugar', amount: 15 },
            { name: 'Sodium', amount: 500 }
          ]
        }
      };

      const completeNutrition = getCompleteNutrition(recipe);
      
      expect(completeNutrition.calories).toBe(400);
      expect(completeNutrition.protein).toBe(25);
      expect(completeNutrition.fat).toBe(12);
      expect(completeNutrition.carbohydrates).toBe(45);
      expect(completeNutrition.percentages).toBeDefined();
      expect(completeNutrition.totalMacros).toBe(82);
      expect(completeNutrition.isBalanced).toBe(true);
    });

    test('handles missing nutrition data', () => {
      const recipe = { title: 'Test Recipe' };
      const result = getCompleteNutrition(recipe);
      expect(result).toBeDefined();
      expect(result.calories).toBeNull();
      expect(result.protein).toBeNull();
      expect(result.fat).toBeNull();
      expect(result.carbohydrates).toBeNull();
    });

    test('calculates balanced nutrition correctly', () => {
      const recipe = {
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 500 },
            { name: 'Protein', amount: 30 }, // 24% of calories
            { name: 'Fat', amount: 20 },     // 36% of calories
            { name: 'Carbohydrates', amount: 50 } // 40% of calories
          ]
        }
      };

      const completeNutrition = getCompleteNutrition(recipe);
      expect(completeNutrition.isBalanced).toBe(false); // Fat too high
    });
  });

  describe('formatCalories', () => {
    test('formats calories with unit', () => {
      expect(formatCalories(350)).toBe('350 cal');
    });

    test('formats calories without unit', () => {
      expect(formatCalories(350, false)).toBe('350');
    });

    test('handles null calories', () => {
      expect(formatCalories(null)).toBe('N/A');
    });

    test('handles undefined calories', () => {
      expect(formatCalories(undefined)).toBe('N/A');
    });

    test('handles NaN calories', () => {
      expect(formatCalories(NaN)).toBe('N/A');
    });

    test('rounds decimal calories', () => {
      expect(formatCalories(350.7)).toBe('351 cal');
    });
  });

  describe('getCalorieRange', () => {
    test('calculates calorie range with default 20%', () => {
      const range = getCalorieRange(500);
      expect(range).toEqual({ min: 400, max: 600 });
    });

    test('calculates calorie range with custom percentage', () => {
      const range = getCalorieRange(500, 0.1);
      expect(range).toEqual({ min: 450, max: 550 });
    });

    test('handles null calories', () => {
      const range = getCalorieRange(null);
      expect(range).toEqual({ min: null, max: null });
    });

    test('handles zero calories', () => {
      const range = getCalorieRange(0);
      expect(range).toEqual({ min: null, max: null });
    });
  });

  describe('meetsCalorieCriteria', () => {
    test('returns true when recipe meets criteria', () => {
      const recipe = { calories: 400 };
      expect(meetsCalorieCriteria(recipe, 300, 500)).toBe(true);
    });

    test('returns false when calories too low', () => {
      const recipe = { calories: 200 };
      expect(meetsCalorieCriteria(recipe, 300, 500)).toBe(false);
    });

    test('returns false when calories too high', () => {
      const recipe = { calories: 600 };
      expect(meetsCalorieCriteria(recipe, 300, 500)).toBe(false);
    });

    test('returns true when no calorie data available', () => {
      const recipe = { title: 'Test Recipe' };
      expect(meetsCalorieCriteria(recipe, 300, 500)).toBe(true);
    });

    test('handles only min calories', () => {
      const recipe = { calories: 400 };
      expect(meetsCalorieCriteria(recipe, 300, null)).toBe(true);
    });

    test('handles only max calories', () => {
      const recipe = { calories: 400 };
      expect(meetsCalorieCriteria(recipe, null, 500)).toBe(true);
    });
  });

  describe('getCalorieCategory', () => {
    test('categorizes low calories', () => {
      expect(getCalorieCategory(250)).toBe('low');
    });

    test('categorizes medium calories', () => {
      expect(getCalorieCategory(450)).toBe('medium');
    });

    test('categorizes high calories', () => {
      expect(getCalorieCategory(700)).toBe('high');
    });

    test('handles boundary values', () => {
      expect(getCalorieCategory(300)).toBe('medium');
      expect(getCalorieCategory(600)).toBe('high');
    });

    test('handles null calories', () => {
      expect(getCalorieCategory(null)).toBe('unknown');
    });

    test('handles NaN calories', () => {
      expect(getCalorieCategory(NaN)).toBe('unknown');
    });
  });

  describe('getCalorieCategoryColor', () => {
    test('returns correct colors for each category', () => {
      expect(getCalorieCategoryColor('low')).toBe('#4CAF50');
      expect(getCalorieCategoryColor('medium')).toBe('#FF9800');
      expect(getCalorieCategoryColor('high')).toBe('#F44336');
    });

    test('returns gray for unknown category', () => {
      expect(getCalorieCategoryColor('unknown')).toBe('#9E9E9E');
    });
  });
}); 