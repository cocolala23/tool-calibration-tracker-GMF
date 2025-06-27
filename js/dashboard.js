// Ambil username dari localStorage setelah login
const loggedInUser = localStorage.getItem("loggedInUser");

// Jika belum login, arahkan ke login
if (!loggedInUser) {
  alert("❗ Anda harus login terlebih dahulu.");
  window.location.href = "index.html";
}

// Tampilkan username
document.getElementById("loggedInUser").textContent = loggedInUser;

// Toggle dropdown saat klik username
document.getElementById("loggedInUser").addEventListener("click", () => {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});

// Edit profil
document.getElementById("editProfileBtn").addEventListener("click", () => {
  window.location.href = "edit-profile.html";
});

// Contoh data alat (nantinya ambil dari localStorage atau database)
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
  }
];

// Tampilkan daftar alat
const tableBody = document.querySelector("#alatTable tbody");

alatKalibrasi.forEach(alat => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${alat.kode}</td>
    <td>${alat.nama}</td>
    <td>${alat.nextDue}</td>
  `;
  tableBody.appendChild(row);
});
