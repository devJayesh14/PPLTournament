const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Event = require('../models/Event');

// Get players for auction by type (randomized)
router.get('/event/:eventId/type/:type', async (req, res) => {
  try {
    const players = await Player.find({ 
      eventId: req.params.eventId,
      type: req.params.type,
      auctioned: false
    });
    
    // Shuffle array randomly
    const shuffled = players.sort(() => Math.random() - 0.5);
    
    res.json(shuffled);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all players for auction grouped by type
router.get('/event/:eventId/players', async (req, res) => {
  try {
    const players = await Player.find({ 
      eventId: req.params.eventId,
      auctioned: false
    });
    
    // Group by type and shuffle each group
    const grouped = {
      'Batsman': [],
      'Bowler': [],
      'Batting Allrounder': [],
      'Bowling Allrounder': []
    };
    
    players.forEach(player => {
      if (grouped[player.type]) {
        grouped[player.type].push(player);
      }
    });
    
    // Shuffle each type
    Object.keys(grouped).forEach(type => {
      grouped[type] = grouped[type].sort(() => Math.random() - 0.5);
    });
    
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next player for auction
router.get('/event/:eventId/next', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { 
      eventId: req.params.eventId,
      auctioned: false
    };
    
    if (type) {
      query.type = type;
    }
    
    const players = await Player.find(query);
    
    if (players.length === 0) {
      return res.json({ message: 'No more players available', player: null });
    }
    
    // Get random player
    const randomIndex = Math.floor(Math.random() * players.length);
    const nextPlayer = players[randomIndex];
    
    res.json(nextPlayer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auction statistics
router.get('/event/:eventId/stats', async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments({ eventId: req.params.eventId });
    const auctionedPlayers = await Player.countDocuments({ 
      eventId: req.params.eventId,
      auctioned: true
    });
    const remainingPlayers = totalPlayers - auctionedPlayers;
    
    const byType = await Player.aggregate([
      { $match: { eventId: req.params.eventId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const byTypeAuctioned = await Player.aggregate([
      { $match: { eventId: req.params.eventId, auctioned: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total: totalPlayers,
      auctioned: auctionedPlayers,
      remaining: remainingPlayers,
      byType: byType,
      byTypeAuctioned: byTypeAuctioned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

