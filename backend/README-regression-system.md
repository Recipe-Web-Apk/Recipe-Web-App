# Regression-Based Recommendation System

## Overview

This system implements a dynamic, user behavior-based recommendation algorithm using linear regression to personalize recipe recommendations based on user interactions. The system focuses on the core parameters you specified: **relevance**, **cuisine type**, **popularity**, and **season**, with nutritional data as additional parameters.

**Focus**: The system prioritizes **liked** and **saved** recipes as the primary signals for personalization, as these represent the strongest user preferences.

## Key Features

### 🎯 Core Parameters (Primary Focus)
- **Relevance**: Based on user preferences and interaction history
- **Cuisine Type**: Normalized cuisine match with user preferences
- **Popularity**: Global recipe popularity based on interactions
- **Season**: Seasonal relevance and timing

### 🥗 Additional Nutritional Parameters
- **Calories**: Normalized calorie content (0-2000 range)
- **Protein**: Normalized protein content (0-100g range)
- **Fat**: Normalized fat content (0-100g range)
- **Carbohydrates**: Normalized carb content (0-300g range)
- **Fiber**: Normalized fiber content (0-50g range)
- **Sugar**: Normalized sugar content (0-100g range)
- **Sodium**: Normalized sodium content (0-2000mg range)

### 📊 Recipe Metadata
- **Difficulty**: Normalized difficulty level
- **Cook Time**: Normalized cooking time (0-180 minutes)
- **Prep Time**: Normalized preparation time (0-60 minutes)

## Architecture

### Database Schema

#### 1. `user_interactions` Table
Tracks all user interactions with recipes for training data:
```sql
- user_id: UUID (references users.id)
- recipe_id: UUID (references recipes.id)
- spoonacular_id: INTEGER (for external recipes)
- interaction_type: TEXT ('view', 'like', 'save')
- interaction_value: NUMERIC (1, 2, 3 respectively)
- recipe_features: JSONB (stored feature vector)
- created_at: TIMESTAMP
```

#### 2. `user_feature_weights` Table
Stores personalized regression coefficients per user:
```sql
- user_id: UUID (references users.id)
- interaction_type: TEXT ('view', 'like', 'save')
- feature_name: TEXT (feature name)
- weight: NUMERIC (regression coefficient)
- last_updated: TIMESTAMP
```

#### 3. `recipe_features` Table
Caches pre-computed feature vectors for performance:
```sql
- recipe_id: UUID (references recipes.id)
- spoonacular_id: INTEGER
- feature_vector: JSONB (normalized feature vector)
- popularity_score: NUMERIC
- relevance_score: NUMERIC
- last_updated: TIMESTAMP
```

#### 4. `regression_metrics` Table
Stores model performance metrics for A/B testing:
```sql
- user_id: UUID (references users.id)
- model_version: TEXT ('v1', 'v2', etc.)
- interaction_type: TEXT
- mse: NUMERIC (mean squared error)
- r_squared: NUMERIC (R-squared value)
- feature_importance: JSONB
- training_samples: INTEGER
- last_trained: TIMESTAMP
```

## How It Works

### 1. Feature Extraction
For each recipe, the system extracts and normalizes features:

```javascript
const features = {
  relevance: calculateRelevanceScore(recipe, userPreferences),
  cuisine_type: calculateCuisineMatch(recipe, userPreferences),
  popularity: calculatePopularityScore(recipe),
  season: calculateSeasonalScore(recipe),
  calories: normalizeCalories(nutrition.calories),
  protein: normalizeProtein(nutrition.protein),
  // ... other features
};
```

### 2. Interaction Tracking
When users interact with recipes, the system tracks:
- **View**: Value = 1 (lowest engagement)
- **Like**: Value = 2 (moderate engagement - primary signal)
- **Save**: Value = 3 (highest engagement - primary signal)

### 3. Regression Training
For each interaction type, the system trains separate regression models:

```javascript
// Training data preparation
const X = interactions.map(interaction => Object.values(interaction.recipe_features));
const y = interactions.map(interaction => interaction.interaction_value);

// Linear regression using normal equation
const weights = performLinearRegression(X, y);
```

### 4. Recommendation Scoring
Recipes are scored using the trained weights, with focus on like and save:

```javascript
const likeScore = features.relevance * likeWeights.relevance +
                  features.cuisine_type * likeWeights.cuisine_type +
                  // ... other features

const saveScore = features.relevance * saveWeights.relevance +
                  features.cuisine_type * saveWeights.cuisine_type +
                  // ... other features

const finalScore = (likeScore * 0.6) + (saveScore * 0.4);
```

## API Endpoints

### Main Recommendation Endpoint
```http
GET /recommendations/:userId
```
- **Default**: Uses regression system
- **Fallback**: Add `?regression=false` to use original algorithm

### Interaction Tracking Endpoints
```http
POST /recommendations/track-view/:userId
POST /recommendations/track-like/:userId
POST /recommendations/track-save/:userId
```
Body: `{ "recipeId": "uuid", "spoonacularId": 123 }`

### Analytics Endpoints
```http
GET /recommendations/weights/:userId
GET /recommendations/metrics/:userId
```

## Setup Instructions

### 1. Database Setup
```bash
cd backend/SQL
node setup-regression-tables.js
```

### 2. Test the System
```bash
cd backend/Testing
node test-regression-recommendation.js
```

## Configuration

### Default Feature Weights
The system uses different default weights for each interaction type, with focus on like and save:

| Feature | View | Like | Save |
|---------|------|------|------|
| Relevance | 0.30 | 0.40 | 0.35 |
| Cuisine Type | 0.20 | 0.25 | 0.20 |
| Popularity | 0.20 | 0.15 | 0.15 |
| Season | 0.10 | 0.10 | 0.10 |
| Calories | 0.05 | 0.03 | 0.05 |
| Protein | 0.05 | 0.03 | 0.05 |
| Fat | 0.05 | 0.02 | 0.05 |
| Carbs | 0.05 | 0.02 | 0.05 |

### Final Score Calculation
```javascript
// Weighted combination focusing on like and save
const finalScore = (likeScore * 0.6) + (saveScore * 0.4);
```

### Normalization Ranges
- **Calories**: 0-2000 calories
- **Protein**: 0-100g
- **Fat**: 0-100g
- **Carbohydrates**: 0-300g
- **Fiber**: 0-50g
- **Sugar**: 0-100g
- **Sodium**: 0-2000mg
- **Cook Time**: 0-180 minutes
- **Prep Time**: 0-60 minutes

## Performance Considerations

### Caching
- Recipe feature vectors are cached in `recipe_features` table
- User weights are updated asynchronously after interactions
- Feature extraction is optimized for common recipe formats

### Scalability
- Indexes on frequently queried columns
- Background weight updates to avoid blocking user interactions
- Efficient matrix operations for regression calculations

### Fallback Strategy
- Original algorithm available as fallback
- Default weights for new users
- Graceful degradation if regression fails

## Monitoring and Analytics

### Model Metrics
- **MSE (Mean Squared Error)**: Measures prediction accuracy
- **R-squared**: Measures model fit quality
- **Feature Importance**: Shows which features matter most
- **Training Samples**: Number of interactions used for training

### A/B Testing
- Multiple model versions can be tracked
- Performance comparison between versions
- Gradual rollout capabilities

## Example Usage

### Frontend Integration
```javascript
// Track user interaction (focus on like and save)
await fetch('/api/recommendations/track-like/user123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipeId: 'recipe456' })
});

// Get personalized recommendations
const recommendations = await fetch('/api/recommendations/user123');
const recipes = await recommendations.json();

// Each recipe has regression scores (like and save focus)
recipes.forEach(recipe => {
  console.log(`${recipe.title}:`);
  console.log(`  Like Score: ${recipe.likeScore}`);
  console.log(`  Save Score: ${recipe.saveScore}`);
  console.log(`  Final Score: ${recipe.finalScore}`);
});
```

### Weight Analysis
```javascript
// Get user's feature weights
const weights = await fetch('/api/recommendations/weights/user123');
const userWeights = await weights.json();

// Analyze what matters to this user (focus on like and save)
console.log('Like weights:');
Object.entries(userWeights.like).forEach(([feature, weight]) => {
  console.log(`  ${feature}: ${weight.weight}`);
});

console.log('Save weights:');
Object.entries(userWeights.save).forEach(([feature, weight]) => {
  console.log(`  ${feature}: ${weight.weight}`);
});
```

## Benefits

1. **Personalization**: Each user gets unique feature weights based on their behavior
2. **Focus on Strong Signals**: Prioritizes liked and saved recipes as primary signals
3. **Adaptability**: Weights update automatically as users interact more
4. **Transparency**: Clear feature importance and model metrics
5. **Flexibility**: Easy to add new features or modify existing ones
6. **Performance**: Efficient caching and background processing
7. **Reliability**: Fallback to original algorithm if needed

## Future Enhancements

1. **Advanced ML**: Replace linear regression with more sophisticated models
2. **Real-time Updates**: Stream processing for immediate weight updates
3. **Cross-validation**: Better model validation and overfitting prevention
4. **Feature Engineering**: More sophisticated feature extraction
5. **Multi-objective Optimization**: Balance multiple recommendation goals
6. **Cold Start Handling**: Better recommendations for new users

## Troubleshooting

### Common Issues

1. **No Recommendations**: Check if user has enough interaction data
2. **Poor Scores**: Verify feature extraction and normalization
3. **Slow Performance**: Check database indexes and caching
4. **Weight Updates**: Ensure background processes are running

### Debug Endpoints
```http
GET /recommendations/weights/:userId  # Check user weights
GET /recommendations/metrics/:userId  # Check model performance
```

This regression-based system provides a sophisticated, personalized recommendation experience while maintaining the focus on your specified core parameters (relevance, cuisine type, popularity, season) with nutritional data as valuable additional context. The system prioritizes liked and saved recipes as the strongest signals for personalization. 