const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
};

// POST /api/auth/register (Public)
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username dan password wajib diisi" });
        }
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: "Username sudah terdaftar" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ username, password: hashedPassword });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: "Data pengguna tidak valid" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login (Public)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                user: { id: user._id, username: user.username },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "Username atau password salah" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/me (Protected)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};