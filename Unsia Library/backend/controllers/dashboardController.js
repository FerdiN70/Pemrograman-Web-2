const Book = require('../models/book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');

// GET /api/dashboard/summary (Sesuai Soal)
exports.getDashboardSummary = async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const totalMembers = await Member.countDocuments();
        const totalLoans = await Loan.countDocuments();
        const activeLoans = await Loan.countDocuments({ status: 'Dipinjam' });

        res.status(200).json({
            totalBooks,
            totalMembers,
            totalLoans,
            activeLoans
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};