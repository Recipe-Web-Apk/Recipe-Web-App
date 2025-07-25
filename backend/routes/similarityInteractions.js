/**
 * Similarity interactions route for learning
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const { shouldLearn, updateUserWeights } = require('../similarity/learn');
const { insertInteraction, getInteractionCount, getUserWeights, saveUserWeights } = require('../similarity/storage');

/**
 * POST /api/similarity/interaction
 * Log user interaction and update weights if enough data
 */
router.post('/interaction', authenticateToken, async (req, res) => {
  try {
    const { recipeId, decision, modelScore, features } = req.body;
    const userId = req.user.id;

    if (!recipeId || !decision || modelScore === undefined || !features) {
      return res.status(400).json({ 
        error: 'Missing required fields: recipeId, decision, modelScore, features' 
      });
    }

    console.log('Recording similarity interaction:', {
      userId,
      recipeId,
      decision,
      modelScore,
      features
    });

    // Insert interaction record
    const insertSuccess = await insertInteraction(userId, recipeId, decision, modelScore, features);
    
    if (!insertSuccess) {
      return res.status(500).json({ error: 'Failed to record interaction' });
    }

    // Check if user has enough interactions to start learning
    const interactionCount = await getInteractionCount(userId);
    const canLearn = shouldLearn(interactionCount);

    let updatedWeights = null;
    let weightsUpdated = false;

    if (canLearn) {
      // Get current weights
      const currentWeights = await getUserWeights(userId);
      
      // Update weights based on interaction
      updatedWeights = await updateUserWeights(userId, currentWeights, features, modelScore, decision);
      
      // Save updated weights
      const saveSuccess = await saveUserWeights(userId, updatedWeights);
      
      if (saveSuccess) {
        weightsUpdated = true;
        console.log('Updated user weights:', updatedWeights);
      } else {
        console.error('Failed to save updated weights');
      }
    }

    res.json({
      success: true,
      interactionRecorded: true,
      canLearn,
      interactionCount,
      weightsUpdated,
      weights: updatedWeights
    });

  } catch (error) {
    console.error('Error recording similarity interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

/**
 * GET /api/similarity/stats
 * Get user's similarity learning statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get interaction count
    const interactionCount = await getInteractionCount(userId);
    
    // Get current weights
    const currentWeights = await getUserWeights(userId);
    
    // Check if learning is active
    const canLearn = shouldLearn(interactionCount);

    res.json({
      interactionCount,
      canLearn,
      weights: currentWeights,
      interactionsNeeded: Math.max(0, 10 - interactionCount)
    });

  } catch (error) {
    console.error('Error getting similarity stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router; 