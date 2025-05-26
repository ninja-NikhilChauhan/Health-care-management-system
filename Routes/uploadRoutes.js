// routes/upload.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({ fileUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
