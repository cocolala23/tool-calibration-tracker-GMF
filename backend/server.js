// 1. Memuat library yang dibutuhkan
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
// const bcrypt = require('bcryptjs'); // Akan kita gunakan nanti untuk enkripsi password

const app = express();
const port = 3000;

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Konfigurasi koneksi ke database Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// =================================
// ENDPOINTS UNTUK ALAT
// =================================

// server.js
app.get('/api/alat', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alat ORDER BY registration ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Error saat mengambil data alat:", err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// POST: Menambah alat baru
app.post('/api/alat', async (req, res) => {
    const { registration, description, merk, model, pn, sn, unit, unitDesc, location, nextDue } = req.body;
    if (!sn || !registration || !description || !nextDue) {
        return res.status(400).json({ error: 'Data wajib (Registration, Description, S/N, Next Due) tidak boleh kosong.' });
    }
    try {
        const queryText = 'INSERT INTO alat(registration, description, merk, model, pn, sn, unit, unit_desc, location, next_due, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
        const values = [registration, description, merk, model, pn, sn, unit, unitDesc, location, nextDue, '-'];
        const result = await pool.query(queryText, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error saat menambah alat:", err);
        res.status(500).json({ error: 'Gagal menambahkan alat baru. Pastikan S/N atau Registration unik.' });
    }
});

// PUT: Mengedit data alat berdasarkan Serial Number (sn)
app.put('/api/alat/:sn', async (req, res) => {
    const { sn } = req.params;
    const { registration, description, merk, model, pn, unit, unitDesc, location, nextDue } = req.body;
    try {
        const queryText = 'UPDATE alat SET registration = $1, description = $2, merk = $3, model = $4, pn = $5, unit = $6, unit_desc = $7, location = $8, next_due = $9 WHERE sn = $10 RETURNING *';
        const values = [registration, description, merk, model, pn, unit, unitDesc, location, nextDue, sn];
        const result = await pool.query(queryText, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error saat mengedit alat:", err);
        res.status(500).json({ error: 'Gagal mengedit alat.' });
    }
});

// DELETE: Menghapus alat berdasarkan Serial Number (sn)
app.delete('/api/alat/:sn', async (req, res) => {
    // 1. Ambil Serial Number dari parameter URL
    const { sn } = req.params;

    try {
        // 2. Kirim perintah SQL untuk menghapus baris yang cocok dengan S/N
        const result = await pool.query('DELETE FROM alat WHERE sn = $1 RETURNING *', [sn]);

        // 3. Cek apakah ada baris yang dihapus. Jika tidak, berarti alat tidak ditemukan.
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        }

        // 4. Kirim pesan sukses jika berhasil
        res.status(200).json({ message: 'Alat berhasil dihapus.' });

    } catch (err) {
        // 5. Tangani jika terjadi error
        console.error("Error saat menghapus alat:", err);
        res.status(500).json({ error: 'Gagal menghapus alat.' });
    }
});

// PUT: Memperbarui status kalibrasi
app.put('/api/alat/kalibrasi/:sn', async (req, res) => {
    // 1. Ambil Serial Number dari URL
    const { sn } = req.params;
    // 2. Ambil data baru dari body request
    const { status, calibration_start, calibration_end, next_due } = req.body;

    try {
        let queryText;
        let values;

        if (status === 'Selesai') {
            // Jika statusnya 'Selesai', kita juga perlu mengosongkan tanggal kalibrasi
            // dan mengatur next_due baru.
            queryText = 'UPDATE alat SET status = $1, calibration_start = NULL, calibration_end = NULL, next_due = $2 WHERE sn = $3 RETURNING *';
            values = ['-', next_due, sn]; // Kembalikan status ke standar ('-') dan set next_due baru
        } else {
            // Jika statusnya 'Proses'
            queryText = 'UPDATE alat SET status = $1, calibration_start = $2, calibration_end = $3 WHERE sn = $4 RETURNING *';
            values = [status, calibration_start, calibration_end, sn];
        }

        const result = await pool.query(queryText, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Error saat update status kalibrasi:", err);
        res.status(500).json({ error: 'Gagal update status kalibrasi.' });
    }
});


// =================================
// ENDPOINTS UNTUK PENGGUNA (USERS)
// =================================

// POST: Registrasi pengguna baru
app.post('/api/register', async (req, res) => {
    const { id, username, password, phone } = req.body;
    if (!id || !username || !password || !phone) {
        return res.status(400).json({ error: 'Semua kolom wajib diisi.' });
    }

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1 OR id = $2', [username, id]);
        if (userExists.rowCount > 0) {
            // Kirim status 409 (Conflict) jika username atau ID sudah ada
            return res.status(409).json({ error: 'Username atau ID Pegawai sudah terdaftar.' });
        }
        // Enkripsi password dengan 'salt' 10 putaran
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const queryText = 'INSERT INTO users(id, username, password, phone) VALUES($1, $2, $3, $4) RETURNING *';
        // Simpan password yang sudah di-hash
        const values = [id, username, hashedPassword, phone]; 
        
        const result = await pool.query(queryText, values);
        res.status(201).json({ message: 'Registrasi berhasil!', user: result.rows[0] });
    } catch (err) {
        console.error("Error saat registrasi:", err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat mendaftar.' });
    }
});

// POST: Login pengguna
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }
        
        // Bandingkan password yang diinput dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }

        const { password: _, ...userData } = user;
        res.json({ message: 'Login berhasil!', user: userData });

    } catch (err) {
        console.error("Error saat login:", err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, phone, password } = req.body; // Terima password baru (opsional)

    try {
        let queryText;
        let values;

        if (password) {
            // Jika ada password baru, hash password tersebut
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            queryText = 'UPDATE users SET username = $1, phone = $2, password = $3 WHERE id = $4 RETURNING *';
            values = [username, phone, hashedPassword, id];
        } else {
            // Jika tidak ada password baru, jangan update password
            queryText = 'UPDATE users SET username = $1, phone = $2 WHERE id = $3 RETURNING *';
            values = [username, phone, id];
        }

        const result = await pool.query(queryText, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        const { password: _, ...updatedUser } = result.rows[0];
        res.json({ message: 'Profil berhasil diperbarui!', user: updatedUser });

    } catch (err) {
        console.error("Error saat update profil:", err);
        res.status(500).json({ error: 'Gagal memperbarui profil.' });
    }
});

app.put('/api/alat/selesai/:sn', async (req, res) => {
    const { sn } = req.params;
    // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
    const tanggalSelesai = new Date().toISOString().split('T')[0];

    try {
        // Ganti 'tanggal_selesai' menjadi 'calibration_end' agar sesuai dengan database Anda
        const queryText = 'UPDATE alat SET status = $1, calibration_end = $2 WHERE sn = $3 RETURNING *';
        const values = ['Selesai', tanggalSelesai, sn];

        const result = await pool.query(queryText, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        }
        res.json(result.rows[0]);

    } catch (err) {
        console.error("Error saat menyelesaikan kalibrasi:", err);
        res.status(500).json({ error: 'Gagal menyelesaikan kalibrasi.' });
    }
});

// DELETE: Menghapus pengguna berdasarkan ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Akun berhasil dihapus secara permanen.' });

    } catch (err) {
        console.error("Error saat menghapus akun:", err);
        res.status(500).json({ error: 'Gagal menghapus akun dari server.' });
    }
});


// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
