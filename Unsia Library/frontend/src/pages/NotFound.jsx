import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
            <h1 style={{ fontSize: '72px', color: '#dc3545', margin: '0' }}>404</h1>
            <h2>Halaman Tidak Ditemukan</h2>
            <p style={{ color: '#6c757d' }}>Maaf, alamat yang Anda akses tidak tersedia di sistem perpustakaan.</p>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                &larr; Kembali ke Halaman Utama
            </Link>
        </div>
    );
}