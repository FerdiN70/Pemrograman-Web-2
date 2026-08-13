const Loan = require('../models/Loan');

// GET: Mengambil semua data peminjaman
exports.getLoans = async (req, res) => {
    try {
        const loans = await Loan.find().populate('book').populate('member');
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST: Menambah data peminjaman baru
exports.createLoan = async (req, res) => {
    try {
        const newLoan = new Loan(req.body);
        const savedLoan = await newLoan.save();
        res.status(201).json(savedLoan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT: Memperbarui data peminjaman
exports.updateLoan = async (req, res) => {
    try {
        const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedLoan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT: Mengubah status peminjaman menjadi dikembalikan (Sesuai Soal)
exports.returnLoan = async (req, res) => {
    try {
        const updatedLoan = await Loan.findByIdAndUpdate(
            req.params.id, 
            { status: 'Dikembalikan' }, 
            { new: true }
        ).populate('book').populate('member');

        if (!updatedLoan) {
            return res.status(404).json({ message: "Data peminjaman tidak ditemukan" });
        }

        res.status(200).json(updatedLoan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE: Menghapus data peminjaman
exports.deleteLoan = async (req, res) => {
    try {
        await Loan.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Data peminjaman berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};