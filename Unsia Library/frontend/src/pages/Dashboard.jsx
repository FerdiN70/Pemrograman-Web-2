import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [summary, setSummary] = useState({ totalBooks: 0, totalMembers: 0, totalLoans: 0, activeLoans: 0 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Ferdi';
    
    const chartRef1 = useRef(null);
    const chartRef2 = useRef(null);
    const chartInstance1 = useRef(null);
    const chartInstance2 = useRef(null);

    // State Form Buku
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishedYear, setPublishedYear] = useState('');
    const [genre, setGenre] = useState('');
    const [editBookId, setEditBookId] = useState(null);

    // State Form Anggota
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [memberPhone, setMemberPhone] = useState('');

    // State Form Peminjaman
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const fetchData = async () => {
        try {
            const resBooks = await API.get('/books');
            setBooks(resBooks.data);
            const resMembers = await API.get('/members');
            setMembers(resMembers.data);
            const resLoans = await API.get('/loans');
            setLoans(resLoans.data);
            
            const resSummary = await API.get('/dashboard/summary');
            setSummary(resSummary.data);
        } catch (error) {
            console.error('Gagal memuat data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'overview') {
            if (chartRef1.current) {
                if (chartInstance1.current) chartInstance1.current.destroy();
                const ctx1 = chartRef1.current.getContext('2d');
                chartInstance1.current = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['Total Buku', 'Total Anggota', 'Total Transaksi', 'Aktif Dipinjam'],
                        datasets: [
                            { 
                                label: 'Statistik Sistem', 
                                data: [summary.totalBooks, summary.totalMembers, summary.totalLoans, summary.activeLoans], 
                                backgroundColor: ['#0b3c5d', '#10b981', '#f59e0b', '#ef4444'] 
                            }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            if (chartRef2.current) {
                if (chartInstance2.current) chartInstance2.current.destroy();
                const ctx2 = chartRef2.current.getContext('2d');
                chartInstance2.current = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
                        datasets: [
                            { label: 'Peminjaman', data: [3, 8, 5, summary.totalLoans], borderColor: '#0b3c5d', tension: 0.3 },
                            { label: 'Pengembalian', data: [2, 6, 4, summary.totalLoans - summary.activeLoans], borderColor: '#10b981', tension: 0.3 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }
    }, [activeTab, summary]);

    const handleDownloadPDF = () => {
        window.print();
    };

    const handleSaveBook = async (e) => {
        e.preventDefault();
        if (!title || !author || !publishedYear || !genre) {
            alert('Semua kolom buku wajib diisi!');
            return;
        }
        try {
            if (editBookId) {
                await API.put(`/books/${editBookId}`, { title, author, publishedYear: Number(publishedYear), genre });
                alert('Buku berhasil diperbarui!');
                setEditBookId(null);
            } else {
                await API.post('/books', { title, author, publishedYear: Number(publishedYear), genre });
                alert('Buku berhasil ditambahkan!');
            }
            setTitle(''); setAuthor(''); setPublishedYear(''); setGenre('');
            fetchData();
        } catch (error) {
            alert('Gagal menyimpan buku');
        }
    };

    const handleEditBook = (book) => {
        setActiveTab('books');
        setEditBookId(book._id);
        setTitle(book.title);
        setAuthor(book.author);
        setPublishedYear(book.publishedYear);
        setGenre(book.genre);
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm('Hapus buku ini?')) {
            await API.delete(`/books/${id}`);
            fetchData();
        }
    };

    const handleSaveMember = async (e) => {
        e.preventDefault();
        if (!memberName || !memberEmail || !memberPhone) {
            alert('Semua kolom anggota wajib diisi!');
            return;
        }
        try {
            await API.post('/members', { name: memberName, email: memberEmail, phone: memberPhone });
            alert('Anggota berhasil ditambahkan!');
            setMemberName(''); setMemberEmail(''); setMemberPhone('');
            fetchData();
        } catch (error) {
            alert('Gagal menambah anggota');
        }
    };

    const handleDeleteMember = async (id) => {
        if (window.confirm('Hapus anggota ini?')) {
            await API.delete(`/members/${id}`);
            fetchData();
        }
    };

    const handleSaveLoan = async (e) => {
        e.preventDefault();
        if (!selectedBook || !selectedMember || !returnDate) {
            alert('Semua data peminjaman wajib diisi!');
            return;
        }
        try {
            await API.post('/loans', { book: selectedBook, member: selectedMember, returnDate });
            alert('Peminjaman berhasil dicatat!');
            setSelectedBook(''); setSelectedMember(''); setReturnDate('');
            fetchData();
        } catch (error) {
            alert('Gagal mencatat peminjaman');
        }
    };

    const handleReturnLoan = async (id) => {
        if (window.confirm('Ubah status buku ini menjadi sudah dikembalikan?')) {
            try {
                await API.put(`/loans/${id}/return`);
                alert('Status buku berhasil diubah menjadi Dikembalikan!');
                fetchData();
            } catch (error) {
                alert('Gagal memperbarui status pengembalian');
            }
        }
    };

    const handleDeleteLoan = async (id) => {
        if (window.confirm('Hapus data transaksi ini?')) {
            await API.delete(`/loans/${id}`);
            fetchData();
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="app-container">
            
            {/* OVERLAY MOBILE MENU */}
            {mobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* SIDEBAR KIRI */}
            <div className={`no-print sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">UNSIA</div>
                    <span className="sidebar-title">Digital Library</span>
                </div>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">👤</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{username}</div>
                    <div style={{ fontSize: '11px', color: '#93c5fd' }}>admin@unsia.ac.id</div>
                </div>

                <div className="sidebar-menu">
                    <div style={{ fontSize: '11px', color: '#93c5fd', padding: '5px 10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Menu Utama</div>
                    <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'overview' ? 'active' : ''}`}>📊 Dashboard</button>
                    <button onClick={() => { setActiveTab('books'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'books' ? 'active' : ''}`}>📖 Data Buku</button>
                    <button onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'members' ? 'active' : ''}`}>👥 Data Anggota</button>
                    <button onClick={() => { setActiveTab('loans'); setMobileMenuOpen(false); }} className={`menu-btn ${activeTab === 'loans' ? 'active' : ''}`}>🔄 Transaksi Peminjaman</button>
                </div>

                <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </div>
            </div>

            {/* KONTEN UTAMA KANAN */}
            <div className="main-content-wrapper">
                
                {/* TOP NAVBAR */}
                <div className="no-print top-navbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            ☰
                        </button>
                        <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '16px' }}>
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'books' && 'Data Buku Perpustakaan'}
                            {activeTab === 'members' && 'Data Anggota Perpustakaan'}
                            {activeTab === 'loans' && 'Data Transaksi Peminjaman'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>Halo, {username}</span>
                    </div>
                </div>

                {/* ISI HALAMAN (SCROLLABLE) */}
                <div className="content-scrollable">
                    
                    {/* TAB OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <div className="overview-header-card">
                                <div>
                                    <h2 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '18px' }}>Laporan Ringkasan Sistem - UNSIA Digital Library</h2>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>Data diambil secara real-time dari endpoint /api/dashboard/summary.</p>
                                </div>
                                <button 
                                    className="no-print"
                                    onClick={handleDownloadPDF} 
                                    style={{ padding: '8px 14px', background: '#0b3c5d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    📥 Unduh PDF
                                </button>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card" style={{ borderLeft: '4px solid #0b3c5d' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Total Buku</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{summary.totalBooks}</div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Total Anggota</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{summary.totalMembers}</div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Total Peminjaman</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{summary.totalLoans}</div>
                                </div>
                                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Sedang Dipinjam</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{summary.activeLoans}</div>
                                </div>
                            </div>

                            <div className="charts-grid">
                                <div className="chart-container-box">
                                    <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Grafik Statistik Ringkasan</h4>
                                    <div style={{ height: '220px', position: 'relative' }}>
                                        <canvas ref={chartRef1}></canvas>
                                    </div>
                                </div>
                                <div className="chart-container-box">
                                    <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Tren Transaksi Bulanan</h4>
                                    <div style={{ height: '220px', position: 'relative' }}>
                                        <canvas ref={chartRef2}></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB KELOLA BUKU */}
                    {activeTab === 'books' && (
                        <div className="table-card">
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>{editBookId ? 'Edit Data Buku' : 'Daftar Buku Perpustakaan'}</h3>
                            <form onSubmit={handleSaveBook} className="form-grid-dynamic">
                                <div>
                                    <label className="form-label">Judul Buku</label>
                                    <input type="text" placeholder="Masukkan judul..." value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Penulis</label>
                                    <input type="text" placeholder="Masukkan penulis..." value={author} onChange={(e) => setAuthor(e.target.value)} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Tahun</label>
                                    <input type="number" placeholder="Tahun" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Genre</label>
                                    <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="form-input" />
                                </div>
                                <button type="submit" className="form-submit-btn">
                                    {editBookId ? 'Update' : '+ Tambah'}
                                </button>
                            </form>

                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr style={{ background: '#0b3c5d', color: 'white', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 15px' }}>#</th>
                                            <th style={{ padding: '12px 15px' }}>JUDUL BUKU</th>
                                            <th style={{ padding: '12px 15px' }}>PENULIS</th>
                                            <th style={{ padding: '12px 15px' }}>TAHUN</th>
                                            <th style={{ padding: '12px 15px' }}>GENRE</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#6b7280' }}>Belum ada data buku.</td></tr>
                                        ) : (
                                            books.map((b, index) => (
                                                <tr key={b._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '12px 15px', color: '#6b7280' }}>{index + 1}</td>
                                                    <td style={{ padding: '12px 15px', fontWeight: '600', color: '#1f2937' }}>{b.title}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{b.author}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{b.publishedYear}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{b.genre}</td>
                                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                                        <span onClick={() => handleEditBook(b)} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600', marginRight: '8px' }}>Edit</span>
                                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                                        <span onClick={() => handleDeleteBook(b._id)} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: '600', marginLeft: '8px' }}>Hapus</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB DATA ANGGOTA */}
                    {activeTab === 'members' && (
                        <div className="table-card">
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Data Anggota Perpustakaan</h3>
                            <form onSubmit={handleSaveMember} className="form-grid-dynamic">
                                <div>
                                    <label className="form-label">Nama Lengkap</label>
                                    <input type="text" placeholder="Nama..." value={memberName} onChange={(e) => setMemberName(e.target.value)} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input type="email" placeholder="Email..." value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">No. Telepon</label>
                                    <input type="text" placeholder="Telepon..." value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} className="form-input" />
                                </div>
                                <button type="submit" className="form-submit-btn">+ Tambah</button>
                            </form>

                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr style={{ background: '#0b3c5d', color: 'white', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 15px' }}>#</th>
                                            <th style={{ padding: '12px 15px' }}>NAMA</th>
                                            <th style={{ padding: '12px 15px' }}>EMAIL</th>
                                            <th style={{ padding: '12px 15px' }}>TELEPON</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#6b7280' }}>Belum ada data anggota.</td></tr>
                                        ) : (
                                            members.map((m, index) => (
                                                <tr key={m._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '12px 15px', color: '#6b7280' }}>{index + 1}</td>
                                                    <td style={{ padding: '12px 15px', fontWeight: '600', color: '#1f2937' }}>{m.name}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{m.email}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{m.phone}</td>
                                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                                        <span onClick={() => handleDeleteMember(m._id)} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>Hapus</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB TRANSAKSI PEMINJAMAN */}
                    {activeTab === 'loans' && (
                        <div className="table-card">
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Data Transaksi Peminjaman</h3>
                            <form onSubmit={handleSaveLoan} className="form-grid-dynamic">
                                <div>
                                    <label className="form-label">Pilih Buku</label>
                                    <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} className="form-input">
                                        <option value="">-- Pilih Buku --</option>
                                        {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Pilih Anggota</label>
                                    <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="form-input">
                                        <option value="">-- Pilih Anggota --</option>
                                        {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Batas Pengembalian</label>
                                    <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="form-input" />
                                </div>
                                <button type="submit" className="form-submit-btn">+ Pinjam</button>
                            </form>

                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr style={{ background: '#0b3c5d', color: 'white', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 15px' }}>#</th>
                                            <th style={{ padding: '12px 15px' }}>JUDUL BUKU</th>
                                            <th style={{ padding: '12px 15px' }}>PEMINJAM</th>
                                            <th style={{ padding: '12px 15px' }}>BATAS KEMBALI</th>
                                            <th style={{ padding: '12px 15px' }}>STATUS</th>
                                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loans.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#6b7280' }}>Belum ada transaksi.</td></tr>
                                        ) : (
                                            loans.map((l, index) => (
                                                <tr key={l._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '12px 15px', color: '#6b7280' }}>{index + 1}</td>
                                                    <td style={{ padding: '12px 15px', fontWeight: '600', color: '#1f2937' }}>{l.book ? l.book.title : 'Buku Dihapus'}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{l.member ? l.member.name : 'Anggota Dihapus'}</td>
                                                    <td style={{ padding: '12px 15px', color: '#4b5563' }}>{new Date(l.returnDate).toLocaleDateString()}</td>
                                                    <td style={{ padding: '12px 15px' }}>
                                                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', background: l.status === 'Dikembalikan' ? '#d1fae5' : '#fef3c7', color: l.status === 'Dikembalikan' ? '#065f46' : '#92400e', fontWeight: 'bold', display: 'inline-block' }}>
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                                        {l.status !== 'Dikembalikan' && (
                                                            <span onClick={() => handleReturnLoan(l._id)} style={{ color: '#059669', cursor: 'pointer', fontWeight: '600', marginRight: '8px' }}>Kembalikan</span>
                                                        )}
                                                        <span onClick={() => handleDeleteLoan(l._id)} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>Hapus</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* CSS RESPONSIF & MEDIA QUERIES */}
            <style>{`
                .app-container {
                    display: flex;
                    height: 100vh;
                    background: #f4f6f9;
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                }
                .sidebar {
                    width: 260px;
                    background: #0b3c5d;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    padding: 20px 0;
                    box-sizing: border-box;
                    flex-shrink: 0;
                    z-index: 100;
                    transition: transform 0.3s ease;
                }
                .sidebar-header {
                    padding: 0 20px 20px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .sidebar-logo {
                    background: white;
                    color: #0b3c5d;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 12px;
                }
                .sidebar-title {
                    font-weight: bold;
                    font-size: 16px;
                    letter-spacing: 0.5px;
                }
                .sidebar-user {
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .sidebar-avatar {
                    width: 50px;
                    height: 50px;
                    background: #cbd5e1;
                    border-radius: 50%;
                    margin: 0 auto 10px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: #333;
                }
                .sidebar-menu {
                    flex: 1;
                    padding: 15px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    overflow-y: auto;
                }
                .menu-btn {
                    text-align: left;
                    background: transparent;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .menu-btn.active {
                    background: #1d4ed8;
                }
                .main-content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    width: 100%;
                }
                .top-navbar {
                    height: 60px;
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    box-sizing: border-box;
                }
                .hamburger-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 22px;
                    cursor: pointer;
                    color: #0b3c5d;
                }
                .content-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .overview-header-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 25px;
                }
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .chart-container-box {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .table-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .form-grid-dynamic {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) auto;
                    gap: 15px;
                    align-items: end;
                    margin-bottom: 25px;
                    box-sizing: border-box;
                }
                .form-label {
                    font-size: 12px;
                    color: #4b5563;
                    font-weight: bold;
                    display: block;
                    margin-bottom: 5px;
                }
                .form-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    box-sizing: border-box;
                    background: white;
                    outline: none;
                }
                .form-submit-btn {
                    padding: 9px 20px;
                    background: #0b3c5d;
                    color: white;
                    border: none;
                    borderRadius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    height: 37px;
                }
                .table-responsive {
                    width: 100%;
                    overflow-x: auto;
                }
                .custom-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    white-space: nowrap;
                }
                .sidebar-overlay {
                    display: none;
                }

                /* RESPONSIF UNTUK PONSEL & TABLET (Max 768px) */
                @media (max-width: 768px) {
                    .sidebar {
                        position: fixed;
                        top: 0;
                        left: -260px;
                        height: 100%;
                        transition: left 0.3s ease-in-out;
                    }
                    .sidebar.open {
                        left: 0;
                    }
                    .hamburger-btn {
                        display: block;
                    }
                    .sidebar-overlay {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background: rgba(0,0,0,0.4);
                        z-index: 99;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-grid-dynamic {
                        grid-template-columns: 1fr;
                    }
                }

                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
}