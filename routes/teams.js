const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Create new team
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    
    const team = new Team({
      name: name.trim(),
      color: color || '#667eea'
    });
    
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Team name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team
router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    if (name !== undefined) team.name = name.trim();
    if (color !== undefined) team.color = color;
    
    await team.save();
    res.json(team);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Team name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    const Player = require('../models/Player');
    // Check if team has any players
    const playersCount = await Player.countDocuments({ teamId: req.params.id });
    if (playersCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete team. ${playersCount} player(s) are assigned to this team.` 
      });
    }
    
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

