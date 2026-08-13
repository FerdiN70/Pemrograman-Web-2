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
        <div style={{ display: 'flex', height: '100vh', background: '#f4f6f9', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
            
            {/* SIDEBAR KIRI */}
            <div className="no-print" style={{ width: '260px', background: '#0b3c5d', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0', boxSizing: 'border-box', flexShrink: 0 }}>
                <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'white', color: '#0b3c5d', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>UNSIA</div>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.5px' }}>Digital Library</span>
                </div>

                <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '50px', height: '50px', background: '#cbd5e1', borderRadius: '50%', margin: '0 auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#333' }}>👤</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{username}</div>
                    <div style={{ fontSize: '11px', color: '#93c5fd' }}>admin@unsia.ac.id</div>
                </div>

                <div style={{ flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '11px', color: '#93c5fd', padding: '5px 10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Menu Utama</div>
                    <button onClick={() => setActiveTab('overview')} style={{ textAlign: 'left', background: activeTab === 'overview' ? '#1d4ed8' : 'transparent', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>📊 Dashboard</button>
                    <button onClick={() => setActiveTab('books')} style={{ textAlign: 'left', background: activeTab === 'books' ? '#1d4ed8' : 'transparent', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>📖 Data Buku</button>
                    <button onClick={() => setActiveTab('members')} style={{ textAlign: 'left', background: activeTab === 'members' ? '#1d4ed8' : 'transparent', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>👥 Data Anggota</button>
                    <button onClick={() => setActiveTab('loans')} style={{ textAlign: 'left', background: activeTab === 'loans' ? '#1d4ed8' : 'transparent', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>🔄 Transaksi Peminjaman</button>
                </div>

                <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </div>
            </div>

            {/* KONTEN UTAMA KANAN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* TOP NAVBAR */}
                <div className="no-print" style={{ height: '60px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxSizing: 'border-box' }}>
                    <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '16px' }}>
                        {activeTab === 'overview' && 'Dashboard Overview'}
                        {activeTab === 'books' && 'Data Buku Perpustakaan'}
                        {activeTab === 'members' && 'Data Anggota Perpustakaan'}
                        {activeTab === 'loans' && 'Data Transaksi Peminjaman'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>Halo, {username}</span>
                    </div>
                </div>

                {/* ISI HALAMAN (SCROLLABLE) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '25px', boxSizing: 'border-box' }}>
                    
                    {/* TAB OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <div style={{ background: 'white', padding: '20px 25px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '20px' }}>Laporan Ringkasan Sistem - UNSIA Digital Library</h2>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Data diambil secara real-time dari endpoint /api/dashboard/summary.</p>
                                </div>
                                <button 
                                    className="no-print"
                                    onClick={handleDownloadPDF} 
                                    style={{ padding: '10px 18px', background: '#0b3c5d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    📥 Unduh Ringkasan PDF
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #0b3c5d' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Total Buku</div>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{summary.totalBooks}</div>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Total Anggota</div>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{summary.totalMembers}</div>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Total Peminjaman</div>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{summary.totalLoans}</div>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '5px' }}>Sedang Dipinjam</div>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{summary.activeLoans}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Grafik Statistik Ringkasan</h4>
                                    <div style={{ height: '220px', position: 'relative' }}>
                                        <canvas ref={chartRef1}></canvas>
                                    </div>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>{editBookId ? 'Edit Data Buku' : 'Daftar Buku Perpustakaan'}</h3>
                            <form onSubmit={handleSaveBook} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '15px', alignItems: 'end', marginBottom: '25px', boxSizing: 'border-box' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Judul Buku</label>
                                    <input type="text" placeholder="Masukkan judul..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Penulis</label>
                                    <input type="text" placeholder="Masukkan penulis..." value={author} onChange={(e) => setAuthor(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tahun</label>
                                    <input type="number" placeholder="Tahun" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Genre</label>
                                    <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', outline: 'none', background: 'white' }} />
                                </div>
                                <button type="submit" style={{ padding: '9px 20px', background: '#0b3c5d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '37px' }}>
                                    {editBookId ? 'Update' : '+ Tambah'}
                                </button>
                            </form>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ background: '#0b3c5d', color: 'white', textAlign: 'left' }}>
                                        <th style={{ padding: '14px 15px', width: '6%', verticalAlign: 'middle' }}>#</th>
                                        <th style={{ padding: '14px 15px', width: '34%', verticalAlign: 'middle' }}>JUDUL BUKU</th>
                                        <th style={{ padding: '14px 15px', width: '25%', verticalAlign: 'middle' }}>PENULIS</th>
                                        <th style={{ padding: '14px 15px', width: '10%', verticalAlign: 'middle' }}>TAHUN</th>
                                        <th style={{ padding: '14px 15px', width: '15%', verticalAlign: 'middle' }}>GENRE</th>
                                        <th style={{ padding: '14px 15px', width: '10%', textAlign: 'center', verticalAlign: 'middle' }}>AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#6b7280' }}>Belum ada data buku.</td></tr>
                                    ) : (
                                        books.map((b, index) => (
                                            <tr key={b._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={{ padding: '14px 15px', color: '#6b7280', verticalAlign: 'middle' }}>{index + 1}</td>
                                                <td style={{ padding: '14px 15px', fontWeight: '600', color: '#1f2937', verticalAlign: 'middle', wordBreak: 'break-word' }}>{b.title}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle', wordBreak: 'break-word' }}>{b.author}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle' }}>{b.publishedYear}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle', wordBreak: 'break-word' }}>{b.genre}</td>
                                                <td style={{ padding: '14px 15px', textAlign: 'center', verticalAlign: 'middle' }}>
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
                    )}

                    {/* TAB DATA ANGGOTA */}
                    {activeTab === 'members' && (
                        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Data Anggota Perpustakaan</h3>
                            <form onSubmit={handleSaveMember} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: '15px', alignItems: 'end', marginBottom: '25px', boxSizing: 'border-box' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nama Lengkap</label>
                                    <input type="text" placeholder="Nama..." value={memberName} onChange={(e) => setMemberName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', background: 'white', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email</label>
                                    <input type="email" placeholder="Email..." value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', background: 'white', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>No. Telepon</label>
                                    <input type="text" placeholder="Telepon..." value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', background: 'white', outline: 'none' }} />
                                </div>
                                <button type="submit" style={{ padding: '9px 20px', background: '#0b3c5d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '37px' }}>+ Tambah</button>
                            </form>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ background: '#0b3c5d', color: 'white', textAlign: 'left' }}>
                                        <th style={{ padding: '14px 15px', width: '8%', verticalAlign: 'middle' }}>#</th>
                                        <th style={{ padding: '14px 15px', width: '32%', verticalAlign: 'middle' }}>NAMA</th>
                                        <th style={{ padding: '14px 15px', width: '32%', verticalAlign: 'middle' }}>EMAIL</th>
                                        <th style={{ padding: '14px 15px', width: '18%', verticalAlign: 'middle' }}>TELEPON</th>
                                        <th style={{ padding: '14px 15px', width: '10%', textAlign: 'center', verticalAlign: 'middle' }}>AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#6b7280' }}>Belum ada data anggota.</td></tr>
                                    ) : (
                                        members.map((m, index) => (
                                            <tr key={m._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={{ padding: '14px 15px', color: '#6b7280', verticalAlign: 'middle' }}>{index + 1}</td>
                                                <td style={{ padding: '14px 15px', fontWeight: '600', color: '#1f2937', verticalAlign: 'middle' }}>{m.name}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle' }}>{m.email}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle' }}>{m.phone}</td>
                                                <td style={{ padding: '14px 15px', textAlign: 'center', verticalAlign: 'middle' }}>
                                                    <span onClick={() => handleDeleteMember(m._id)} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>Hapus</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB TRANSAKSI PEMINJAMAN */}
                    {activeTab === 'loans' && (
                        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Data Transaksi Peminjaman</h3>
                            <form onSubmit={handleSaveLoan} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: '15px', alignItems: 'end', marginBottom: '25px', boxSizing: 'border-box' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pilih Buku</label>
                                    <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', outline: 'none' }}>
                                        <option value="">-- Pilih Buku --</option>
                                        {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pilih Anggota</label>
                                    <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', outline: 'none' }}>
                                        <option value="">-- Pilih Anggota --</option>
                                        {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Batas Pengembalian</label>
                                    <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', outline: 'none' }} />
                                </div>
                                <button type="submit" style={{ padding: '9px 20px', background: '#0b3c5d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '37px' }}>+ Pinjam</button>
                            </form>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ background: '#0b3c5d', color: 'white', textAlign: 'left' }}>
                                        <th style={{ padding: '14px 15px', width: '6%', verticalAlign: 'middle' }}>#</th>
                                        <th style={{ padding: '14px 15px', width: '28%', verticalAlign: 'middle' }}>JUDUL BUKU</th>
                                        <th style={{ padding: '14px 15px', width: '22%', verticalAlign: 'middle' }}>PEMINJAM</th>
                                        <th style={{ padding: '14px 15px', width: '16%', verticalAlign: 'middle' }}>BATAS KEMBALI</th>
                                        <th style={{ padding: '14px 15px', width: '13%', verticalAlign: 'middle' }}>STATUS</th>
                                        <th style={{ padding: '14px 15px', width: '15%', textAlign: 'center', verticalAlign: 'middle' }}>AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#6b7280' }}>Belum ada transaksi.</td></tr>
                                    ) : (
                                        loans.map((l, index) => (
                                            <tr key={l._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={{ padding: '14px 15px', color: '#6b7280', verticalAlign: 'middle' }}>{index + 1}</td>
                                                <td style={{ padding: '14px 15px', fontWeight: '600', color: '#1f2937', verticalAlign: 'middle' }}>{l.book ? l.book.title : 'Buku Dihapus'}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle' }}>{l.member ? l.member.name : 'Anggota Dihapus'}</td>
                                                <td style={{ padding: '14px 15px', color: '#4b5563', verticalAlign: 'middle' }}>{new Date(l.returnDate).toLocaleDateString()}</td>
                                                <td style={{ padding: '14px 15px', verticalAlign: 'middle' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', background: l.status === 'Dikembalikan' ? '#d1fae5' : '#fef3c7', color: l.status === 'Dikembalikan' ? '#065f46' : '#92400e', fontWeight: 'bold', display: 'inline-block' }}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 15px', textAlign: 'center', verticalAlign: 'middle' }}>
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
                    )}
                </div>
            </div>
            
            <style>{`
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