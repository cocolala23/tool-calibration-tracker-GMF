const cron = require('node-cron');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // dari Neon.tech
  ssl: { rejectUnauthorized: false }
});

// Contoh pengirim pesan WA — akan diganti sesuai API yang dipilih
async function sendWA(to, message) {
  // ganti dengan salah satu versi di bawah
}

cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Checking calibration reminders...');

  try {
    const result = await pool.query(`
      SELECT t.tool_name_description, t.next_calibration, u.full_name, u.whatsapp
      FROM tools t
      JOIN users u ON t.user_id = u.id
      WHERE DATE(t.next_calibration) = CURRENT_DATE + INTERVAL '7 days'
    `);

    for (const row of result.rows) {
      const msg = `Halo ${row.full_name}, alat *${row.tool_name_description}* akan jatuh tempo kalibrasi pada *${row.next_calibration.toISOString().slice(0, 10)}*. Harap segera dikalibrasi.`;
      await sendWA(row.whatsapp, msg);
    }
  } catch (err) {
    console.error('❌ Cron error:', err);
  }
});
