// server.js (diubah untuk menggunakan ES Modules & library postgres)

import 'dotenv/config'; // Gantikan require('dotenv').config()
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import sql from './db.js'; // Impor koneksi dari db.js

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =================================
// ENDPOINTS UNTUK ALAT
// =================================

// GET: Mengambil semua alat
app.get('/api/alat', async (req, res) => {
    try {
        const alat = await sql`SELECT * FROM alat ORDER BY registration ASC`;
        res.json(alat);
    } catch (err) {
        console.error("Error saat mengambil data alat:", err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// POST: Menambah alat baru (SUDAH DIPERBAIKI)
app.post('/api/alat', async (req, res) => {
    // Ambil semua data dari body
    const { registration, description, merk, model, pn, unit, unitDesc, location, nextDue } = req.body;
    
    // PERUBAHAN KUNCI: Cara aman untuk memproses 'sn'
    // Cek dulu apakah req.body.sn ada, baru diproses.
    const sn = (req.body.sn && req.body.sn.trim()) ? req.body.sn.trim() : null;

    // Validasi data wajib
    if (!registration || !description || !nextDue) {
        return res.status(400).json({ error: 'Data wajib (Registration, Description, Next Due) tidak boleh kosong.' });
    }

    try {
        const [alatBaru] = await sql`
            INSERT INTO alat(registration, description, merk, model, pn, sn, unit, unit_desc, location, next_due, status)
            VALUES(${registration}, ${description}, ${merk}, ${model}, ${pn}, ${sn}, ${unit}, ${unitDesc}, ${location}, ${nextDue}, '-')
            RETURNING *
        `;
        res.status(201).json(alatBaru);
    } catch (err) {
        console.error("Error saat menambah alat:", err);
        if (err.code === '23505') { 
            if (err.constraint_name === 'alat_pkey') {
                return res.status(409).json({ error: `Gagal: Kode Registrasi sudah ada.` });
            }
            if (err.constraint_name === 'alat_sn_key') {
                return res.status(409).json({ error: `Gagal: Serial Number sudah digunakan.` });
            }
        }
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat menambah alat.' });
    }
});

// PUT: Mengedit data alat berdasarkan Registration (SUDAH DIPERBAIKI)
app.put('/api/alat/:registration', async (req, res) => {
    const { registration: targetRegistration } = req.params;
    const { registration, description, merk, model, pn, unit, unitDesc, location, nextDue } = req.body;
    
    // Proses 'sn' secara terpisah, sama seperti di atas
    const sn = req.body.sn && req.body.sn.trim() !== '' ? req.body.sn.trim() : null;

    try {
        const [alatDiedit] = await sql`
            UPDATE alat SET
                registration = ${registration},
                description = ${description},
                merk = ${merk},
                model = ${model},
                pn = ${pn},
                sn = ${sn}, -- Menggunakan 'sn' yang sudah diproses
                unit = ${unit},
                unit_desc = ${unitDesc},
                location = ${location},
                next_due = ${nextDue}
            WHERE registration = ${targetRegistration}
            RETURNING *
        `;
        if (!alatDiedit) return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        res.json(alatDiedit);
    } catch (err) {
        // ... (blok catch bisa disesuaikan seperti di atas juga)
        console.error("Error saat mengedit alat:", err);
        if (err.code === '23505') {
            return res.status(409).json({ error: `Gagal: S/N atau Registration yang baru sudah digunakan.` });
        }
        res.status(500).json({ error: 'Gagal mengedit alat.' });
    }
});

// DELETE: Menghapus alat berdasarkan Registration (KODE BARU)
app.delete('/api/alat/:registration', async (req, res) => {
    const { registration } = req.params;
    try {
        const result = await sql`DELETE FROM alat WHERE registration = ${registration} RETURNING *`;
        if (result.count === 0) return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        res.status(200).json({ message: 'Alat berhasil dihapus.' });
    } catch (err) {
        console.error("Error saat menghapus alat:", err);
        res.status(500).json({ error: 'Gagal menghapus alat.' });
    }
});

// PUT: Memperbarui status kalibrasi
app.put('/api/alat/kalibrasi/:registration', async (req, res) => {
    const { registration } = req.params;
    const { status, calibration_start, calibration_end } = req.body;
    try {
        const [alatDikalibrasi] = await sql`
            UPDATE alat SET
                status = ${status}, calibration_start = ${calibration_start},
                calibration_end = ${calibration_end}
            WHERE registration = ${registration}
            RETURNING *
        `;
        if (!alatDikalibrasi) return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        res.json(alatDikalibrasi);
    } catch (err) {
        console.error("Error saat update status kalibrasi:", err);
        res.status(500).json({ error: 'Gagal update status kalibrasi.' });
    }
});

// PUT: Menyelesaikan proses kalibrasi
app.put('/api/alat/selesai/:registration', async (req, res) => {
    const { registration } = req.params;
    const tanggalSelesai = new Date();
    try {
        const [alatSelesai] = await sql`
            UPDATE alat SET status = 'Selesai', calibration_end = ${tanggalSelesai}
            WHERE registration = ${registration}
            RETURNING *
        `;
        if (!alatSelesai) return res.status(404).json({ error: 'Alat tidak ditemukan.' });
        res.json(alatSelesai);
    } catch (err) {
        console.error("Error saat menyelesaikan kalibrasi:", err);
        res.status(500).json({ error: 'Gagal menyelesaikan kalibrasi.' });
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
        const users = await sql`SELECT * FROM users WHERE username = ${username} OR id = ${id}`;
        if (users.count > 0) {
            return res.status(409).json({ error: 'Username atau ID Pegawai sudah terdaftar.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [userBaru] = await sql`
            INSERT INTO users(id, username, password, phone)
            VALUES(${id}, ${username}, ${hashedPassword}, ${phone})
            RETURNING *
        `;
        res.status(201).json({ message: 'Registrasi berhasil!', user: userBaru });
    } catch (err) {
        console.error("Error saat registrasi:", err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat mendaftar.' });
    }
});

// POST: Login pengguna
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah.' });
        }
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

// PUT: Mengupdate profil pengguna
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, phone, password } = req.body;
    try {
        let updatedUser;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            [updatedUser] = await sql`
                UPDATE users SET username = ${username}, phone = ${phone}, password = ${hashedPassword}
                WHERE id = ${id} RETURNING *
            `;
        } else {
            [updatedUser] = await sql`
                UPDATE users SET username = ${username}, phone = ${phone}
                WHERE id = ${id} RETURNING *
            `;
        }
        if (!updatedUser) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        const { password: _, ...userData } = updatedUser;
        res.json({ message: 'Profil berhasil diperbarui!', user: userData });
    } catch (err) {
        console.error("Error saat update profil:", err);
        res.status(500).json({ error: 'Gagal memperbarui profil.' });
    }
});

// DELETE: Menghapus pengguna
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING *`;
        if (result.count === 0) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
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