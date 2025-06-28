// Ambil username dari localStorage setelah login
const loggedInUser = localStorage.getItem("loggedInUser");

// Cek apakah user sudah login
if (!loggedInUser) {
  alert("❗ Anda harus login terlebih dahulu.");
  window.location.href = "index.html";
}

// Tampilkan username di navbar
document.getElementById("loggedInUser").textContent = loggedInUser;

// Toggle dropdown user
document.getElementById("loggedInUser").addEventListener("click", () => {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});

// Navigasi ke edit profil
document.getElementById("editProfileBtn").addEventListener("click", () => {
  window.location.href = "profile.html"; // Sesuai dengan HTML yang kamu gunakan
});

// ================================================
// Contoh data alat (harusnya nanti dari localStorage)
const alatKalibrasi = [
  {
    kode: "2TBAXX055",
    nama: "VERNIER CALIPER",
    nextDue: "2025-07-01"
  },
  {
    kode: "2TBAAY033",
    nama: "MICROMETER",
    nextDue: "2025-08-10"
  },
  {
    kode: "3TBAZZ011",
    nama: "TORQUE WRENCH",
    nextDue: "2025-06-30"
  },
  {
    kode: "4TBAQQ088",
    nama: "PRESSURE GAUGE",
    nextDue: "2025-07-15"
  },
  {
    kode: "5TBARR099",
    nama: "MULTIMETER",
    nextDue: "2025-07-05"
  },
  {
    kode: "6TBAMM002",
    nama: "THERMOMETER",
    nextDue: "2025-07-03"
  }
];

// ===============================
// Tampilkan semua alat ke tabel utama
const tableAll = document.querySelector("#alatTable tbody");
alatKalibrasi.forEach(alat => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${alat.kode}</td>
    <td>${alat.nama}</td>
    <td>${alat.nextDue}</td>
  `;
  tableAll.appendChild(row);
});

// ===============================
// Tampilkan 5 alat terdekat ke tabel "Kalibrasi Terdekat"
const sortedAlat = [...alatKalibrasi].sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
const top5 = sortedAlat.slice(0, 5);

const tableTerdekat = document.querySelector("#tabelTerdekat tbody");
top5.forEach(alat => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${alat.kode}</td>
    <td>${alat.nama}</td>
    <td>${alat.nextDue}</td>
  `;
  tableTerdekat.appendChild(row);
});
