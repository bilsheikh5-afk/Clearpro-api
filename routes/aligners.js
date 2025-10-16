const express = require('express');
const router = express.Router();
const Aligner = require('../models/Aligner');

// Get current aligner data (single doc)
router.get('/', async (req, res) => {
  const doc = await Aligner.findOne().lean();
  res.json(doc || {});
});

// Create/update aligner data
router.post('/', async (req, res) => {
  const payload = req.body;
  let doc = await Aligner.findOne();
  if (!doc) doc = new Aligner(payload);
  else Object.assign(doc, payload, { updatedAt: new Date() });
  await doc.save();
  res.json({ ok: true, doc });
});

module.exports = router;