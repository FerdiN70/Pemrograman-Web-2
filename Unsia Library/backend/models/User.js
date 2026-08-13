const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Tidak boleh ada username yang sama
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user' // Secara bawaan, pendaftar baru adalah user biasa
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);