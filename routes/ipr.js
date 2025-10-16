const express = require('express');
const router = express.Router();
const IPR = require('../models/IPR');

router.get('/', async (req, res) => {
  const list = await IPR.find().sort({ createdAt: -1 }).lean();
  res.json(list);
});

router.post('/', async (req, res) => {
  const rec = await IPR.create(req.body);
  res.json({ ok: true, rec });
});

module.exports = router;