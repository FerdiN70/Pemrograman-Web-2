const express = require('express');
const router = express.Router();
const { 
    getLoans, 
    createLoan, 
    updateLoan, 
    returnLoan, 
    deleteLoan 
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

// Rute Peminjaman (Protected)
router.get('/', protect, getLoans);
router.post('/', protect, createLoan);
router.put('/:id', protect, updateLoan);
router.put('/:id/return', protect, returnLoan); // <-- Endpoint pengembalian buku
router.delete('/:id', protect, deleteLoan);

module.exports = router;