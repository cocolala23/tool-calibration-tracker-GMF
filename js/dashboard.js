// === EVENT LISTENER UTAMA UNTUK MEMASTIKAN HALAMAN SELALU TER-UPDATE ===

// Jalankan saat HTML selesai dimuat (untuk pemuatan pertama)
window.addEventListener('DOMContentLoaded', inisialisasiDashboard);

// Jalankan saat halaman ditampilkan (termasuk saat navigasi back/forward dari cache)
window.addEventListener('pageshow', function(event) {
    // 'persisted' bernilai true jika halaman diambil dari cache
    if (event.persisted) {
        console.log("Halaman Dashboard dimuat dari cache. Inisialisasi ulang.");
        inisialisasiDashboard();
    }
});


// === FUNGSI UTAMA UNTUK MENGINISIALISASI SELURUH HALAMAN ===
function inisialisasiDashboard() {
    console.log("Memulai inisialisasi Dashboard...");
    
    // --- Bagian Logika Navbar Modern ---
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("❗ Anda harus login terlebih dahulu.");
        window.location.href = "index.html";
        return;
    }
    const loggedInUserDisplay = document.getElementById("loggedInUser");
    if (loggedInUserDisplay) loggedInUserDisplay.textContent = loggedInUser;
    
    const userAvatar = document.querySelector(".user-avatar");
    if (userAvatar) userAvatar.textContent = loggedInUser.charAt(0).toUpperCase();
    
    const dropdownTrigger = document.getElementById("userDropdownTrigger");
    const dropdownContent = document.getElementById("userDropdownContent");
    if (dropdownTrigger && dropdownContent) {
        dropdownTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    }
    window.onclick = function(event) {
        if (dropdownContent && dropdownContent.style.display === 'block') {
            dropdownContent.style.display = "none";
        }
    }
    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }
    // --- Akhir Bagian Logika Navbar ---


    // --- Bagian Logika Dashboard ---
    const alatList = JSON.parse(localStorage.getItem("alatList")) || [];

    // Pastikan Chart.js tidak membuat grafik ganda
    let chartInstance = Chart.getChart("grafikKalibrasi");
    if (chartInstance) {
        chartInstance.destroy();
    }

    renderStatCards(alatList);
    renderGrafikKalibrasi(alatList);
    renderJadwalKalibrasi(alatList);
    renderStatusKalibrasi(alatList);
}


function renderStatCards(alatList) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let prosesCount = 0;
  let segeraCount = 0;
  let lewatCount = 0;

  alatList.forEach(alat => {
    if (alat.status === "Proses") {
      prosesCount++;
    } else if (alat.status === "-") {
      const dueDate = new Date(alat.nextDue);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
      if (diffDays < 0) lewatCount++;
      else if (diffDays >= 0 && diffDays <= 7) segeraCount++;
    }
  });

  document.getElementById("statTotalAlat").textContent = alatList.length;
  document.getElementById("statProses").textContent = prosesCount;
  document.getElementById("statSegeraJatuhTempo").textContent = segeraCount;
  document.getElementById("statLewatTenggat").textContent = lewatCount;
}

function renderGrafikKalibrasi(alatList) {
  const ctx = document.getElementById("grafikKalibrasi").getContext("2d");
  const labels = [];
  const data = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const monthlyData = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    labels.push(`${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`);
    monthlyData[monthKey] = 0;
  }

  alatList.forEach(alat => {
    if (alat.status === 'Selesai' && alat.tanggalSelesai) {
      const selesaiDate = new Date(alat.tanggalSelesai);
      const monthKey = `${selesaiDate.getFullYear()}-${selesaiDate.getMonth()}`;
      if (monthKey in monthlyData) {
        monthlyData[monthKey]++;
      }
    }
  });

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

function renderJadwalKalibrasi(alatList) {
  const table = document.querySelector("#jadwalKalibrasiTable tbody");
  if(!table) return;
  table.innerHTML = "";
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const data = alatList
    .filter(alat => alat.status === "-")
    .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))
    .slice(0, 5);

  data.forEach(item => {
    const dueDate = new Date(item.nextDue);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    let statusLabel, statusColor;

    if (diffDays < 0) { statusLabel = "Jatuh Tempo"; statusColor = "#d62839"; }
    else if (diffDays === 0) { statusLabel = "Hari Ini"; statusColor = "#f9a825"; }
    else if (diffDays <= 7) { statusLabel = "Segera"; statusColor = "#f9a825"; }
    else { statusLabel = "Aman"; statusColor = "#00b4d8"; }

    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.description}</td><td>${item.nextDue}</td><td><span class="status-label" style="background-color:${statusColor}">${statusLabel}</span></td>`;
    table.appendChild(row);
});
}

function renderStatusKalibrasi(alatList) {
  const table = document.querySelector("#statusKalibrasiTable tbody");
  if(!table) return;
  table.innerHTML = "";
  const today = new Date();
  today.setHours(0,0,0,0);

  const data = alatList
    .filter(alat => alat.status === "Proses")
    .slice(0, 5);

  data.forEach(item => {
    const selesai = new Date(item.tanggalSelesai);
    const sisaHari = Math.ceil((selesai - today) / (1000 * 60 * 60 * 24));
    let sisaWaktuLabel = `✅ Selesai`;
    if (sisaHari > 0) sisaWaktuLabel = `⏳ ${sisaHari} hari lagi`;
    else if (sisaHari === 0) sisaWaktuLabel = `Hari Ini`;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.description}</td><td>${item.tanggalSelesai || "-"}</td><td>${sisaWaktuLabel}</td>`;
    table.appendChild(row);
  });
}