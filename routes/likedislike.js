const express = require('express');
const router = express.Router();
const LikeDislike = require('../models/LikeDislike');

router.post('/', async (req, res) => {
  const { itemId, action } = req.body;

  try {
    let item = await LikeDislike.findOne({ itemId });
    if (!item) {
      item = new LikeDislike({ itemId, likes: 0, dislikes: 0 });
    }

    // Handle the different actions accordingly
    switch (action) {
      case 'like':
        item.likes += 1;
        break;
      case 'dislike':
        item.dislikes += 1;
        break;
      case 'undo-like':
        if (item.likes > 0) item.likes -= 1;
        break;
      case 'undo-dislike':
        if (item.dislikes > 0) item.dislikes -= 1;
        break;
      case 'switch-to-like':
        if (item.dislikes > 0) item.dislikes -= 1;
        item.likes += 1;
        break;
      case 'switch-to-dislike':
        if (item.likes > 0) item.likes -= 1;
        item.dislikes += 1;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await item.save();
    res.json({ likes: item.likes, dislikes: item.dislikes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

module.exports = router;
