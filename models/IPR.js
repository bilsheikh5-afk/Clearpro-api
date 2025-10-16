const mongoose = require('mongoose');
const IPRSchema = new mongoose.Schema({
  teeth: String,
  amount: Number,
  date: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('IPR', IPRSchema);