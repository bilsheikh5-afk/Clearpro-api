const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({
  date: String,
  start: String,
  end: String,
  procedures: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Appointment', AppointmentSchema);