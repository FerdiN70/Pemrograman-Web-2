require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db'); 
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');
const memberRoutes = require('./routes/memberRoutes');
// ... di bagian bawah bersama rute lain:

// Inisialisasi aplikasi Express
const app = express();

// Koneksi ke Database
connectDB(); // Koneksi ke Database

// Middleware Keamanan dan Parsing JSON (Sesuai Syarat Poin 11)
app.use(helmet());
app.use(cors({
    origin: 'https://pemrograman-web-2-git-main-ferdin70s-projects.vercel.app', // Ganti atau tambahkan domain lain jika perlu
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Diperlukan jika menggunakan Cookie / Authorization Header dengan kredensial
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/members', memberRoutes);
// Endpoint Dasar untuk Testing
app.get('/', (req, res) => {
    res.json({ message: "API Secure UNSIA Digital Library Dashboard Berjalan!" });
});

// Menjalankan Server
const PORT = process.env.PORT || 5000;
// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Terjadi kesalahan pada server!", 
        error: err.message 
    });
});
app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di port ${PORT}`);
});