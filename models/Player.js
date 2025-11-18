const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  type: {
    type: String,
    enum: ['Bowler', 'Batsman', 'Bowling Allrounder', 'Batting Allrounder'],
    required: true
  },
  image: {
    type: String,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  auctioned: {
    type: Boolean,
    default: false
  },
  auctionedAt: {
    type: Date
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  soldPrice: {
    type: Number,
    default: null
  },
  // For duplicate detection
  fingerprint: {
    type: String,
    required: true
  }
});

// Index for duplicate detection
playerSchema.index({ eventId: 1, fingerprint: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);

