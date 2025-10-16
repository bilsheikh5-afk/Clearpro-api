const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

router.get('/', async (req, res) => {
  const list = await Note.find().sort({ createdAt: -1 }).lean();
  res.json(list);
});

router.post('/', async (req, res) => {
  const note = await Note.create(req.body);
  res.json({ ok: true, note });
});

module.exports = router;