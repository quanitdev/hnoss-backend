const express = require('express');
const router = express.Router();
const db = require('../config/db'); // db là pool promise

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categories');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy 1 danh mục theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
