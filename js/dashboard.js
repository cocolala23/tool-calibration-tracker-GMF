// === CEK LOGIN & SETUP USER ===
document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    alert("❗ Anda harus login terlebih dahulu.");
    window.location.href = "index.html";
    return;
  }

  // Setup Navbar User
  document.getElementById("loggedInUser").textContent = loggedInUser;
  document.getElementById("loggedInUser").addEventListener("click", () => {
    const dropdown = document.getElementById("userDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });

  // Muat semua data dashboard
  loadDashboardData();
});


// === FUNGSI UTAMA UNTUK MEMUAT SEMUA DATA ===
function loadDashboardData() {
  const alatList = JSON.parse(localStorage.getItem("alatList")) || [];

  renderStatCards(alatList);
  renderGrafikKalibrasi(alatList);
  renderJadwalKalibrasi(alatList);
  renderStatusKalibrasi(alatList);
}


// === 1. FUNGSI UNTUK KARTU STATISTIK (KPI) ===
function renderStatCards(alatList) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let prosesCount = 0;
  let segeraCount = 0;
  let lewatCount = 0;

  alatList.forEach(alat => {
    if (alat.status === "Proses") {
      prosesCount++;
    } else if (alat.status === "-") { // Hanya hitung yang belum dikalibrasi
      const dueDate = new Date(alat.nextDue);
      const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays < 0) {
        lewatCount++;
      } else if (diffDays >= 0 && diffDays <= 7) {
        segeraCount++;
      }
    }
  });

  document.getElementById("statTotalAlat").textContent = alatList.length;
  document.getElementById("statProses").textContent = prosesCount;
  document.getElementById("statSegeraJatuhTempo").textContent = segeraCount;
  document.getElementById("statLewatTenggat").textContent = lewatCount;
}


// === 2. FUNGSI UNTUK GRAFIK ===
function renderGrafikKalibrasi(alatList) {
  const ctx = document.getElementById("grafikKalibrasi").getContext("2d");
  const labels = [];
  const data = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  // Siapkan data untuk 6 bulan terakhir
  const monthlyData = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    monthlyData[monthKey] = 0;
  }

  // Hitung alat yang statusnya 'Selesai' dalam 6 bulan terakhir
  alatList.forEach(alat => {
    if (alat.status === 'Selesai' && alat.tanggalSelesai) {
      const selesaiDate = new Date(alat.tanggalSelesai);
      const monthKey = `${selesaiDate.getFullYear()}-${selesaiDate.getMonth()}`;
      if (monthKey in monthlyData) {
        monthlyData[monthKey]++;
      }
    }
  });

  // Masukkan data ke array untuk grafik
  for (const key in monthlyData) {
    data.push(monthlyData[key]);
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Alat Selesai Dikalibrasi",
        data: data,
        backgroundColor: "#0077b6",
        borderRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}


// === 3. FUNGSI UNTUK TABEL JADWAL KALIBRASI ===
function renderJadwalKalibrasi(alatList) {
  const table = document.querySelector("#jadwalKalibrasiTable tbody");
  table.innerHTML = "";
  const today = new Date();
  
  // Filter alat yang akan jatuh tempo, urutkan dari yang paling dekat
  const data = alatList
    .filter(alat => alat.status === "-")
    .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))
    .slice(0, 5); // Ambil 5 teratas

  data.forEach(item => {
    const dueDate = new Date(item.nextDue);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    let statusLabel, statusColor;

    if (diffDays < 0) { statusLabel = "Jatuh Tempo"; statusColor = "#d62839"; }
    else if (diffDays <= 7) { statusLabel = "Segera"; statusColor = "#f9a825"; }
    else { statusLabel = "Aman"; statusColor = "#00b4d8"; }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.description}</td>
      <td>${item.nextDue}</td>
      <td><span class="status-label" style="background-color:${statusColor}">${statusLabel}</span></td>
    `;
    table.appendChild(row);
  });
}


// === 4. FUNGSI UNTUK TABEL STATUS PROSES ===
function renderStatusKalibrasi(alatList) {
  const table = document.querySelector("#statusKalibrasiTable tbody");
  table.innerHTML = "";
  const today = new Date();

  const data = alatList
    .filter(alat => alat.status === "Proses")
    .slice(0, 5);

  data.forEach(item => {
    const selesai = new Date(item.tanggalSelesai);
    const sisaHari = Math.ceil((selesai - today) / (1000 * 60 * 60 * 24));
    const sisaWaktuLabel = sisaHari > 0 ? `⏳ ${sisaHari} hari lagi` : "✅ Hari ini";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.description}</td>
      <td>${item.tanggalSelesai || "-"}</td>
      <td>${sisaWaktuLabel}</td>
    `;
    table.appendChild(row);
  });
}