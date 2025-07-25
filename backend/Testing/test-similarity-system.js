/**
 * Unit tests for similarity system
 */

const { 
  titleSimilarity, 
  jaccardSimilarity, 
  cuisineMatch, 
  timeMatch,
  extractSimilarityFeatures 
} = require('../similarity/features');

const { 
  computeSimilarityScore, 
  normalizeWeights,
  getWarningType,
  getWarningMessage 
} = require('../similarity/score');

const { 
  shouldLearn, 
  onlineUpdateWeights,
  getTargetValue 
} = require('../similarity/learn');

const { DEFAULT_WEIGHTS } = require('../similarity/constants');

console.log('🧪 Testing Similarity System...\n');

// Test 1: Jaccard Similarity
console.log('1️⃣ Testing Jaccard Similarity...');
function testJaccardSimilarity() {
  const tests = [
    {
      a: ['apple', 'banana', 'orange'],
      b: ['apple', 'banana', 'grape'],
      expected: 0.5 // 2 common / 4 total unique
    },
    {
      a: ['pasta', 'tomato', 'cheese'],
      b: ['pasta', 'tomato', 'cheese'],
      expected: 1.0 // Perfect match
    },
    {
      a: ['beef', 'onion'],
      b: ['chicken', 'carrot'],
      expected: 0.0 // No overlap
    },
    {
      a: [],
      b: ['apple'],
      expected: 0.0 // Empty array
    }
  ];

  tests.forEach((test, index) => {
    const result = jaccardSimilarity(test.a, test.b);
    const passed = Math.abs(result - test.expected) < 0.01;
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} Expected ${test.expected}, got ${result.toFixed(3)}`);
  });
}

// Test 2: Title Similarity
console.log('\n2️⃣ Testing Title Similarity...');
function testTitleSimilarity() {
  const tests = [
    {
      a: 'Pasta Carbonara',
      b: 'Pasta Carbonara',
      expected: 1.0 // Exact match
    },
    {
      a: 'Pasta Carbonara',
      b: 'Pasta Carbonara Recipe',
      expected: 0.8 // High similarity
    },
    {
      a: 'Chicken Stir Fry',
      b: 'Beef Stir Fry',
      expected: 0.7 // Moderate similarity
    },
    {
      a: 'Pizza',
      b: 'Salad',
      expected: 0.0 // Low similarity
    }
  ];

  tests.forEach((test, index) => {
    const result = titleSimilarity(test.a, test.b);
    const passed = Math.abs(result - test.expected) < 0.2; // Allow some variance
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} Expected ~${test.expected}, got ${result.toFixed(3)}`);
  });
}

// Test 3: Cuisine Match
console.log('\n3️⃣ Testing Cuisine Match...');
function testCuisineMatch() {
  const tests = [
    { a: 'Italian', b: 'Italian', expected: 1 },
    { a: 'italian', b: 'Italian', expected: 1 },
    { a: 'Italian', b: 'Mexican', expected: 0 },
    { a: '', b: 'Italian', expected: 0 },
    { a: null, b: 'Italian', expected: 0 }
  ];

  tests.forEach((test, index) => {
    const result = cuisineMatch(test.a, test.b);
    const passed = result === test.expected;
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} Expected ${test.expected}, got ${result}`);
  });
}

// Test 4: Time Match
console.log('\n4️⃣ Testing Time Match...');
function testTimeMatch() {
  const tests = [
    { a: 30, b: 30, expected: 1 },
    { a: 30, b: 35, expected: 1 }, // Within 15 minutes
    { a: 30, b: 50, expected: 0 }, // Outside 15 minutes
    { a: 0, b: 30, expected: 0 },
    { a: null, b: 30, expected: 0 }
  ];

  tests.forEach((test, index) => {
    const result = timeMatch(test.a, test.b);
    const passed = result === test.expected;
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} Expected ${test.expected}, got ${result}`);
  });
}

// Test 5: Feature Extraction
console.log('\n5️⃣ Testing Feature Extraction...');
function testFeatureExtraction() {
  const input = {
    title: 'Pasta Carbonara',
    ingredients: ['pasta', 'eggs', 'cheese'],
    cuisine: 'Italian',
    readyInMinutes: 30
  };

  const candidate = {
    title: 'Pasta Carbonara Recipe',
    ingredients: ['pasta', 'eggs', 'cheese', 'bacon'],
    cuisine: 'Italian',
    readyInMinutes: 35
  };

  const features = extractSimilarityFeatures(input, candidate);
  
  console.log('  Features extracted:', features);
  console.log(`  Title similarity: ${features.title.toFixed(3)}`);
  console.log(`  Ingredient similarity: ${features.ingredients.toFixed(3)}`);
  console.log(`  Cuisine match: ${features.cuisine}`);
  console.log(`  Time match: ${features.time}`);
}

// Test 6: Similarity Scoring
console.log('\n6️⃣ Testing Similarity Scoring...');
function testSimilarityScoring() {
  const features = {
    title: 0.8,
    ingredients: 0.75,
    cuisine: 1.0,
    time: 1.0
  };

  const weights = {
    title: 0.4,
    ingredients: 0.4,
    cuisine: 0.1,
    time: 0.1
  };

  const result = computeSimilarityScore(features, weights);
  
  console.log('  Score result:', {
    score: result.score.toFixed(3),
    scorePercentage: result.scorePercentage,
    breakdown: result.breakdown.map(b => ({
      feature: b.feature,
      contribution: b.contribution.toFixed(3),
      percentage: b.percentage
    }))
  });
}

// Test 7: Weight Normalization
console.log('\n7️⃣ Testing Weight Normalization...');
function testWeightNormalization() {
  const weights = { a: 2, b: 2, c: 1 };
  const normalized = normalizeWeights(weights);
  
  const sum = Object.values(normalized).reduce((s, w) => s + w, 0);
  console.log(`  Original weights:`, weights);
  console.log(`  Normalized weights:`, normalized);
  console.log(`  Sum of normalized weights: ${sum.toFixed(3)} (should be 1.0)`);
  console.log(`  ✅ ${Math.abs(sum - 1.0) < 0.01 ? 'PASSED' : 'FAILED'}`);
}

// Test 8: Warning Logic
console.log('\n8️⃣ Testing Warning Logic...');
function testWarningLogic() {
  const tests = [
    { score: 0.9, expectedType: 'high_similarity' },
    { score: 0.7, expectedType: 'moderate_similarity' },
    { score: 0.5, expectedType: null }
  ];

  tests.forEach((test, index) => {
    const warningType = getWarningType(test.score);
    const message = getWarningMessage(warningType);
    const passed = warningType === test.expectedType;
    
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} Score ${test.score} -> ${warningType || 'none'}`);
    if (message) console.log(`    Message: ${message}`);
  });
}

// Test 9: Learning Logic
console.log('\n9️⃣ Testing Learning Logic...');
function testLearningLogic() {
  console.log('  Should learn with 5 interactions:', shouldLearn(5));
  console.log('  Should learn with 10 interactions:', shouldLearn(10));
  console.log('  Should learn with 15 interactions:', shouldLearn(15));
  
  const currentWeights = { title: 0.4, ingredients: 0.4, cuisine: 0.1, time: 0.1 };
  const features = { title: 0.8, ingredients: 0.6, cuisine: 1.0, time: 0.5 };
  const score = 0.7;
  const target = 0.9;
  
  const updatedWeights = onlineUpdateWeights(currentWeights, features, score, target);
  console.log('  Weight update test:');
  console.log('    Original:', currentWeights);
  console.log('    Updated:', updatedWeights);
  
  const targetValues = ['ignored', 'viewed', 'used_autofill'];
  targetValues.forEach(decision => {
    const target = getTargetValue(decision);
    console.log(`    Target for '${decision}': ${target}`);
  });
}

// Run all tests
testJaccardSimilarity();
testTitleSimilarity();
testCuisineMatch();
testTimeMatch();
testFeatureExtraction();
testSimilarityScoring();
testWeightNormalization();
testWarningLogic();
testLearningLogic();

console.log('\n🎉 Similarity system tests completed!'); 