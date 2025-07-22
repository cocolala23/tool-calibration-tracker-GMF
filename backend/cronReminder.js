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

//tambahan belom di coba, semuanya ga di coba ya nyed
import cron from 'node-cron';
import axios from 'axios';

cron.schedule('0 8 * * *', async () => {
  const tools = await db.query('SELECT * FROM tools WHERE next_due <= CURRENT_DATE + INTERVAL \'3 days\'');
  for (const tool of tools.rows) {
    await axios.post('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
      messaging_product: "whatsapp",
      to: tool.phone,
      type: "template",
      template: {
        name: "kalibrasi_notifikasi",
        language: { code: "id" },
        components: [{ type: "body", parameters: [{ type: "text", text: tool.name }] }]
      }
    }, {
      headers: {
        Authorization: `Bearer YOUR_ACCESS_TOKEN`,
        'Content-Type': 'application/json'
      }
    });
  }
});
// Uncomment and implement the sendWA function with your chosen API
//butuh nomer telp baru kalau ada info aja
