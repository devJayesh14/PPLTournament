const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { v4: uuidv4 } = require('uuid');

// Create new event
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const shareableLink = uuidv4();
    
    const event = new Event({
      name,
      description,
      shareableLink,
      status: 'registration'
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by shareable link
router.get('/link/:link', async (req, res) => {
  try {
    const event = await Event.findOne({ shareableLink: req.params.link });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event (PUT route should come before GET /:id to avoid conflicts)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (name !== undefined) event.name = name;
    if (description !== undefined) event.description = description;
    if (status !== undefined) {
      event.status = status;
      if (status === 'auction' && !event.auctionStartedAt) {
        event.auctionStartedAt = new Date();
      }
    }
    
    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (status === 'auction') {
      event.auctionStartedAt = new Date();
    }
    
    event.status = status;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const Player = require('../models/Player');
    // Delete all players associated with this event
    await Player.deleteMany({ eventId: req.params.id });
    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event and associated players deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

