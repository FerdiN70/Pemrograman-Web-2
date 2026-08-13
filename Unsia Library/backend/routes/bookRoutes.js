const express = require('express');
const router = express.Router();
const { getBooks, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBooks);
router.post('/', protect, createBook);
router.put('/:id', protect, updateBook);      // Sesuai ketentuan
router.delete('/:id', protect, deleteBook);   // Sesuai ketentuan

module.exports = router;