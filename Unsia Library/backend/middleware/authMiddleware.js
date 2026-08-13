const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.header('Authorization');

    // Cek apakah ada token yang dikirimkan
    if (!token) {
        return res.status(401).json({ message: "Akses ditolak! Anda belum login." });
    }

    try {
        // Membersihkan string token dari kata "Bearer "
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        // Verifikasi token menggunakan kunci rahasia di file .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        
        next(); // Izinkan masuk ke proses selanjutnya
    } catch (error) {
        res.status(400).json({ message: "Token tidak valid atau sudah kedaluwarsa!" });
    }
};

module.exports = { protect };