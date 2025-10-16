const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  const list = await Appointment.find().sort({ date: 1 }).lean();
  res.json(list);
});

router.post('/', async (req, res) => {
  const appt = await Appointment.create(req.body);
  res.json({ ok: true, appt });
});

module.exports = router;