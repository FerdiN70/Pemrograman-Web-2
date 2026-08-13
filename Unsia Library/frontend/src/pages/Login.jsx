import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png'; // Mengimpor gambar logo

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await API.post(endpoint, { username, password });

            if (isLogin) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.user.username);
                alert('Login Berhasil!');
                navigate('/dashboard');
            } else {
                alert('Registrasi berhasil! Silakan login.');
                setIsLogin(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1950&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                display: 'flex',
                width: '850px',
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
            }}>
                {/* Kolom Kiri: Form & Logo */}
                <div style={{ flex: 1, padding: '35px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    
                    {/* TAMPILAN LOGO */}
                    <img 
                        src={logoImage} 
                        alt="Logo Kampus" 
                        style={{ width: '85px', height: '85px', objectFit: 'contain', marginBottom: '15px' }} 
                    />

                    <h2 style={{ color: '#003366', marginBottom: '20px', fontSize: '22px', fontWeight: 'bold' }}>
                        {isLogin ? 'Masuk' : 'Daftar Akun'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Masukkan username"
                                style={{
                                    width: '100%',
                                    padding: '9px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Masukkan password"
                                style={{
                                    width: '100%',
                                    padding: '9px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '11px',
                                background: '#004080',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '15px',
                                boxShadow: '0 4px 10px rgba(0,64,128,0.2)'
                            }}
                        >
                            {isLogin ? 'Masuk' : 'Daftar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#666' }}>
                        {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                        <span
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ color: '#004080', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Daftar di sini' : 'Login'}
                        </span>
                    </p>
                </div>

                {/* Kolom Kanan: Panel Dekoratif Biru */}
                <div style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #002b5c 0%, #004080 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '20px',
                        fontSize: '36px'
                    }}>
                        📖
                    </div>
                    <h3 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: 'bold' }}>UNSIA Digital Library</h3>
                    <p style={{ fontSize: '14px', color: '#d0d9e4', lineHeight: '1.6' }}>
                        Sistem manajemen perpustakaan modern untuk memudahkan akses literatur dan pencatatan peminjaman buku.
                    </p>
                </div>
            </div>
        </div>
    );
}