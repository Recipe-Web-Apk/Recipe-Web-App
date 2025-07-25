import axiosInstance from './axiosInstance';

export const similarityAPI = {
  // Check for similar recipes during creation
  checkSimilarity: async (title, ingredients = [], cuisine = '', readyInMinutes = 30, token = null) => {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axiosInstance.post('/recipe/check-similarity', {
        title,
        ingredients,
        cuisine,
        readyInMinutes
      }, { headers });
      
      return response.data;
    } catch (error) {
      console.error('🔍 [SIMILARITY API] Error checking similarity:', error);
      console.error('🔍 [SIMILARITY API] Error response:', error.response?.data);
      throw error;
    }
  },

  // Record user's decision about similarity warning
  recordSimilarityDecision: async (recipe1Data, recipe2Data, decision, judgment = null) => {
    try {
      const response = await axiosInstance.post('/recipe/similarity-decision', {
        recipe1Data,
        recipe2Data,
        decision,
        judgment
      });
      return response.data;
    } catch (error) {
      console.error('Error recording similarity decision:', error);
      throw error;
    }
  },

  // Get autofill data for a specific recipe
  getAutofillData: async (recipeId) => {
    try {
      const response = await axiosInstance.post('/recipe/autofill-data', {
        recipeId
      });
      return response.data;
    } catch (error) {
      console.error('Error getting autofill data:', error);
      throw error;
    }
  },

  // Record similarity feedback for learning
  recordSimilarityFeedback: async (recipe1Id, recipe2Id, recipe1Data, recipe2Data, judgment) => {
    try {
      const response = await axiosInstance.post('/similarity-feedback', {
        recipe1Id,
        recipe2Id,
        recipe1Data,
        recipe2Data,
        judgment
      });
      return response.data;
    } catch (error) {
      console.error('Error recording similarity feedback:', error);
      throw error;
    }
  },

  // Get user's similarity weights
  getSimilarityWeights: async () => {
    try {
      const response = await axiosInstance.get('/similarity-weights');
      return response.data;
    } catch (error) {
      console.error('Error getting similarity weights:', error);
      throw error;
    }
  },

  // Get similarity metrics
  getSimilarityMetrics: async () => {
    try {
      const response = await axiosInstance.get('/similarity-metrics');
      return response.data;
    } catch (error) {
      console.error('Error getting similarity metrics:', error);
      throw error;
    }
  },

  // Get autofill suggestions after user continues with recipe creation
  getAutofillSuggestions: async (title, ingredients = [], cuisine = '', readyInMinutes = 30, token = null) => {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axiosInstance.post('/recipe/get-autofill-suggestions', {
        title,
        ingredients,
        cuisine,
        readyInMinutes
      }, { headers });
      
      return response.data;
    } catch (error) {
      console.error('🔍 [SIMILARITY API] Error getting autofill suggestions:', error);
      console.error('🔍 [SIMILARITY API] Error response:', error.response?.data);
      throw error;
    }
  }
};

export default similarityAPI; 