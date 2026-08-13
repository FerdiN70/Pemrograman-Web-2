const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();

// Middleware Keamanan & Parser
app.use(helmet());
app.use(cors());
app.use(express.json());

// Koneksi Database MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unsia_library')
    .then(() => console.log('MongoDB Terhubung'))
    .catch(err => console.log('Koneksi MongoDB Gagal:', err));

// Daftar Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const loanRoutes = require('./routes/loanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Endpoint API
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Terjadi kesalahan pada server!", 
        error: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));