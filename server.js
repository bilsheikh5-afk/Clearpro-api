require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Static
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearpro';
mongoose.connect(uri, { })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// Routes
app.use('/api/aligners', require('./routes/aligners'));
app.use('/api/ipr', require('./routes/ipr'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/appointments', require('./routes/appointments'));

// Fallback to serve app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Clearpro.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ ClearPro backend running on port ${port}`));