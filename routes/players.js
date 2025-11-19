const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Player = require('../models/Player');
const Event = require('../models/Event');

// Configure multer for in-memory file processing (compatible with serverless)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.jfif', '.webp'];
    const mimetypeValid = file.mimetype && allowedMimeTypes.includes(file.mimetype);
    const extValid = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());

    if (mimetypeValid && extValid) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Generate fingerprint for duplicate detection
function generateFingerprint(name, age, type) {
  const data = `${name.toLowerCase().trim()}-${age}-${type}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

function createDataUri(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const status = err instanceof multer.MulterError ? 400 : 400;
      return res.status(status).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}

// Register player
router.post('/', handleUpload, async (req, res) => {
  try {
    const { eventId, name, age, type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    if (!eventId || !name || !age || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if event exists and is in registration status
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.status !== 'registration') {
      return res.status(400).json({ error: 'Event registration is closed' });
    }
    
    // Generate fingerprint for duplicate detection
    const fingerprint = generateFingerprint(name, age, type);
    
    // Check for duplicates
    const existingPlayer = await Player.findOne({ eventId, fingerprint });
    if (existingPlayer) {
      return res.status(409).json({ 
        error: 'Duplicate player detected',
        duplicateInfo: {
          name: existingPlayer.name,
          age: existingPlayer.age,
          type: existingPlayer.type,
          registeredAt: existingPlayer.registeredAt
        }
      });
    }
    
    const player = new Player({
      eventId,
      name,
      age: parseInt(age),
      type,
      image: createDataUri(req.file),
      fingerprint
    });
    
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Duplicate player detected' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Get all players for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const players = await Player.find({ eventId: req.params.eventId })
      .populate('teamId', 'name color')
      .sort({ registeredAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sold players for an event (must come before /:id route)
router.get('/event/:eventId/sold', async (req, res) => {
  try {
    const players = await Player.find({ 
      eventId: req.params.eventId,
      auctioned: true
    })
      .populate('teamId', 'name color')
      .sort({ auctionedAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sold players by team (must come before /:id route)
router.get('/event/:eventId/team/:teamId', async (req, res) => {
  try {
    const players = await Player.find({ 
      eventId: req.params.eventId,
      teamId: req.params.teamId,
      auctioned: true
    })
      .populate('teamId', 'name color')
      .sort({ auctionedAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get players by type for an event
router.get('/event/:eventId/type/:type', async (req, res) => {
  try {
    const players = await Player.find({ 
      eventId: req.params.eventId,
      type: req.params.type,
      auctioned: false
    }).sort({ registeredAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player by ID (must be last)
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('teamId', 'name color');
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark player as auctioned
router.patch('/:id/auctioned', async (req, res) => {
  try {
    const { teamId, soldPrice } = req.body;
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }
    
    // Verify team exists
    const Team = require('../models/Team');
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    player.auctioned = true;
    player.auctionedAt = new Date();
    player.teamId = teamId;
    if (soldPrice) {
      player.soldPrice = parseFloat(soldPrice);
    }
    
    await player.save();
    await player.populate('teamId', 'name color');
    res.json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete player
router.delete('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Delete image file
    if (player.image && player.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', player.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Player.findByIdAndDelete(req.params.id);
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

