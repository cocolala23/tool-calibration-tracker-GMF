// Cek login
const loggedInUser = localStorage.getItem("loggedInUser");
if (!loggedInUser) {
  alert("❗ Anda harus login terlebih dahulu.");
  window.location.href = "index.html";
}

document.getElementById("loggedInUser").textContent = loggedInUser;
document.getElementById("loggedInUser").addEventListener("click", () => {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});
document.getElementById("editProfileBtn").addEventListener("click", () => {
  window.location.href = "profile.html";
});

// Data dummy jadwal kalibrasi (lebih dari 5 untuk pengujian)
const jadwalKalibrasi = [
  { kode: "2TBAXX055", nama: "VERNIER CALIPER", nextDue: "2025-07-01" },
  { kode: "2TBAAY033", nama: "MICROMETER", nextDue: "2025-06-28" },
  { kode: "3TBAZZ011", nama: "TORQUE WRENCH", nextDue: "2025-06-27" },
  { kode: "4TBBXX099", nama: "HEIGHT GAUGE", nextDue: "2025-07-15" },
  { kode: "5TBCYY101", nama: "DIAL GAUGE", nextDue: "2025-07-10" },
  { kode: "6TBCZZ111", nama: "THICKNESS GAUGE", nextDue: "2025-08-01" }
];

// Data dummy status proses kalibrasi
const statusKalibrasi = [
  { kode: "2TBAXX055", nama: "VERNIER CALIPER", mulai: "2025-06-20", sisaHari: 0, status: "✅ Selesai" },
  { kode: "2TBAAY033", nama: "MICROMETER", mulai: "2025-06-25", sisaHari: 2, status: "⏳ Dalam proses" },
  { kode: "3TBAZZ011", nama: "TORQUE WRENCH", mulai: "-", sisaHari: "-", status: "❌ Belum diminta" },
  { kode: "4TBBXX099", nama: "HEIGHT GAUGE", mulai: "2025-06-21", sisaHari: 5, status: "⏳ Dalam proses" },
  { kode: "5TBCYY101", nama: "DIAL GAUGE", mulai: "-", sisaHari: "-", status: "❌ Belum diminta" },
  { kode: "6TBCZZ111", nama: "THICKNESS GAUGE", mulai: "2025-06-18", sisaHari: 3, status: "⏳ Dalam proses" }
];

// Fungsi bantu
function getStatusLabel(nextDue) {
  const today = new Date();
  const due = new Date(nextDue);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: "🔴 Jatuh Tempo", color: "#d62839" };
  if (diff === 0) return { label: "🟡 Hari H Kalibrasi", color: "#f9a825" };
  if (diff <= 7) return { label: "🟡 Segera Kalibrasi", color: "#fbc02d" };
  if (diff <= 30) return { label: "🟡 Mendekati", color: "#ffdd57" };
  return { label: "🔵 Aman", color: "#0077b6" };
}

function getKeteranganWaktu(nextDue) {
  const today = new Date();
  const due = new Date(nextDue);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `${Math.abs(diff)} hari lalu`;
  if (diff === 0) return `Hari ini`;
  return `${diff} hari lagi`;
}

// Render tabel jadwal kalibrasi (maksimal 5 baris)
const jadwalBody = document.querySelector("#jadwalKalibrasiTable tbody");
jadwalKalibrasi.slice(0, 5).forEach(item => {
  const status = getStatusLabel(item.nextDue);
  const keterangan = getKeteranganWaktu(item.nextDue);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${item.kode}</td>
    <td>${item.nama}</td>
    <td>${item.nextDue}</td>
    <td style="color:${status.color}; font-weight: bold;">${status.label}</td>
    <td><i>${keterangan}</i></td>
  `;
  jadwalBody.appendChild(row);
});

// Render tabel status proses kalibrasi (maksimal 5 baris)
const statusBody = document.querySelector("#statusKalibrasiTable tbody");
statusKalibrasi.slice(0, 5).forEach(item => {
  const lama = item.sisaHari !== "-" ? `${item.sisaHari} hari lagi selesai` : "-";

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${item.kode}</td>
    <td>${item.nama}</td>
    <td>${item.mulai}</td>
    <td>${lama}</td>
    <td>${item.status}</td>
  `;
  statusBody.appendChild(row);

  document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById('grafikKalibrasi').getContext('2d');

    // Contoh data dummy: jumlah alat dikalibrasi per minggu
    const grafik = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
        datasets: [{
          label: 'Alat Dikalibrasi',
          data: [2, 4, 3, 5], // Ganti dengan data asli jika tersedia
          backgroundColor: '#00b4d8'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  });

});
