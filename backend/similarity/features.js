/**
 * Feature extraction module for recipe similarity
 * Implements Jaccard, Levenshtein, and other similarity metrics
 */

/**
 * Compute Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Title similarity using normalized Levenshtein distance
 * Returns similarity score between 0 and 1
 */
function titleSimilarity(a, b) {
  if (!a || !b) return 0;
  
  // Normalize strings
  const normalizedA = a.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normalizedB = b.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  
  if (normalizedA === normalizedB) return 1;
  if (normalizedA.length === 0 || normalizedB.length === 0) return 0;
  
  const distance = levenshteinDistance(normalizedA, normalizedB);
  const maxLength = Math.max(normalizedA.length, normalizedB.length);
  
  return 1 - (distance / maxLength);
}

/**
 * Jaccard similarity between two arrays (case-insensitive)
 * Returns similarity score between 0 and 1
 */
function jaccardSimilarity(listA, listB) {
  if (!listA || !listB) return 0;
  
  // Normalize and create sets
  const setA = new Set(listA.map(item => 
    typeof item === 'string' ? item.toLowerCase().trim() : String(item).toLowerCase().trim()
  ));
  const setB = new Set(listB.map(item => 
    typeof item === 'string' ? item.toLowerCase().trim() : String(item).toLowerCase().trim()
  ));
  
  // Remove empty strings
  setA.delete('');
  setB.delete('');
  
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  
  // Calculate intersection and union
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * Cuisine match - returns 1 if strings match case-insensitively, else 0
 */
function cuisineMatch(a, b) {
  if (!a || !b) return 0;
  return a.toLowerCase().trim() === b.toLowerCase().trim() ? 1 : 0;
}

/**
 * Time match - returns 1 if difference is within ±15 minutes, else 0
 */
function timeMatch(a, b) {
  if (a === undefined || b === undefined || a === null || b === null) return 0;
  
  const timeA = parseInt(a) || 0;
  const timeB = parseInt(b) || 0;
  
  if (timeA === 0 || timeB === 0) return 0;
  
  const difference = Math.abs(timeA - timeB);
  return difference <= 15 ? 1 : 0;
}

/**
 * Extract all similarity features between input and candidate recipes
 */
function extractSimilarityFeatures(input, candidate) {
  return {
    title: titleSimilarity(input.title, candidate.title),
    ingredients: jaccardSimilarity(input.ingredients || [], candidate.ingredients || []),
    cuisine: cuisineMatch(input.cuisine, candidate.cuisine),
    time: timeMatch(input.readyInMinutes, candidate.readyInMinutes)
  };
}

module.exports = {
  titleSimilarity,
  jaccardSimilarity,
  cuisineMatch,
  timeMatch,
  extractSimilarityFeatures,
  levenshteinDistance
}; 