// === CEK LOGIN ===
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

// === BACA DATA ALAT ===
const alatList = JSON.parse(localStorage.getItem("alatList")) || [];

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

function renderJadwalKalibrasi() {
  const table = document.querySelector("#jadwalKalibrasiTable tbody");
  table.innerHTML = "";
  const data = alatList.filter(alat => alat.status === "-" && alat.nextDue).sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue)).slice(0, 5);
  data.forEach(item => {
    const status = getStatusLabel(item.nextDue);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.registration}</td>
      <td>${item.description}</td>
      <td>${item.nextDue}</td>
      <td style="color:${status.color}; font-weight: bold;">${status.label}</td>
      <td><i>${getKeteranganWaktu(item.nextDue)}</i></td>
    `;
    table.appendChild(row);
  });
}

function renderStatusKalibrasi() {
  const table = document.querySelector("#statusKalibrasiTable tbody");
  table.innerHTML = "";
  const data = alatList.filter(alat => alat.status === "Proses").slice(0, 5);
  data.forEach(item => {
    const today = new Date();
    const selesai = new Date(item.tanggalSelesai);
    const sisaHari = Math.ceil((selesai - today) / (1000 * 60 * 60 * 24));
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.registration}</td>
      <td>${item.description}</td>
      <td>${item.tanggalMulai || "-"}</td>
      <td>${item.lamaKalibrasi || "-"}</td>
      <td>${sisaHari > 0 ? `⏳ ${sisaHari} hari lagi` : "✅ Selesai"}</td>
    `;
    table.appendChild(row);
  });
}

function renderGrafikKalibrasi() {
  const ctx = document.getElementById("grafikKalibrasi").getContext("2d");
  const minggu = [0, 0, 0, 0];
  const bulanIni = new Date().getMonth();
  alatList.forEach(alat => {
    if (alat.status === "Proses") {
      const tgl = new Date(alat.tanggalSelesai);
      if (tgl.getMonth() === bulanIni) {
        const week = Math.floor(tgl.getDate() / 7);
        minggu[week]++;
      }
    }
  });
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
      datasets: [{
        label: "Alat Dikalibrasi",
        data: minggu,
        backgroundColor: "#00b4d8"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

renderJadwalKalibrasi();
renderStatusKalibrasi();
renderGrafikKalibrasi();
