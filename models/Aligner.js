const mongoose = require('mongoose');
const AlignerSchema = new mongoose.Schema({
  upperAligner: { type: Number, default: 1 },
  lowerAligner: { type: Number, default: 1 },
  totalUpperAligners: { type: Number, default: 28 },
  totalLowerAligners: { type: Number, default: 28 },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Aligner', AlignerSchema);