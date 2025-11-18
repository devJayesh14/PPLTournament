const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/players', require('./routes/players'));
app.use('/api/auction', require('./routes/auction'));

// Teams route
try {
  app.use('/api/teams', require('./routes/teams'));
  console.log('Teams route loaded successfully');
} catch (error) {
  console.error('Error loading teams route:', error);
}

// MongoDB Connection
mongoose.connect('mongodb+srv://bsp7779:FNo92TAJCIj0Yfgv@cluster0.i4orfae.mongodb.net/cricket-auction?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

