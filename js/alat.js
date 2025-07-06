// === KONSTANTA DAN VARIABEL GLOBAL ===
const alatListKey = "alatList";
let alatList = JSON.parse(localStorage.getItem(alatListKey)) || [];
let currentEditIndex = null; // Menyimpan index global dari alat yang di-edit/dikalibrasi
const itemsPerPage = 10;
let currentPage = 1;

// === ELEMENT DOM ===
const tableBody = document.querySelector("#alatTable tbody");
const totalDisplay = document.getElementById("totalAlat");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("pagination");
const notificationBox = document.getElementById("notificationBox");

const alatForm = document.getElementById("alatForm");
const editForm = document.getElementById("editForm");
const kalibrasiForm = document.getElementById("kalibrasiForm");

const modalTambah = document.getElementById("alatModal");
const modalEdit = document.getElementById("editModal");
const modalKalibrasi = document.getElementById("kalibrasiModal");

// === FUNGSI UTILITY & NOTIFIKASI (BARU & DIPERBAIKI) ===

/**
 * Menampilkan notifikasi di bagian atas halaman.
 * @param {string} message - Pesan yang ingin ditampilkan.
 * @param {string} type - Tipe notifikasi ('success' atau 'warning').
 */
function showNotification(message, type = 'success') {
  notificationBox.innerHTML = message;
  notificationBox.className = 'notification'; // Reset class
  notificationBox.classList.add(type === 'success' ? 'notif-success' : 'notif-warning', 'show');

  // Sembunyikan notifikasi setelah 7 detik
  setTimeout(() => {
    notificationBox.classList.remove('show');
  }, 7000);
}

function hitungTenggat(nextDue) {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalisasi waktu
  const due = new Date(nextDue);
  const selisih = (due - now) / (1000 * 60 * 60 * 24);

  if (selisih < 0) return `❗ Lewat ${Math.abs(Math.ceil(selisih))} hari`;
  if (selisih === 0) return `Hari ini`;
  if (selisih <= 7) return `${Math.ceil(selisih)} hari lagi`;
  if (selisih <= 30) return `${Math.ceil(selisih / 7)} minggu lagi`;
  return `${Math.ceil(selisih / 30)} bulan lagi`;
}

function hitungLamaKalibrasi(mulai, selesai) {
  const t1 = new Date(mulai);
  const t2 = new Date(selesai);
  const diffMs = t2 - t1;
  const hari = diffMs / (1000 * 60 * 60 * 24);
  return `${Math.ceil(hari)} hari`;
}

function showModal(modal) {
  modal.classList.remove("hidden");
}
function hideModal(modal) {
  modal.classList.add("hidden");
}

// === FUNGSI LOGIKA BARU UNTUK ALUR KALIBRASI ===

/**
 * Fungsi ini dipanggil saat tombol "Selesai" ditekan.
 * Mengubah status alat menjadi 'Selesai' dan memberi notifikasi.
 * @param {number} index - Index global dari alat di dalam `alatList`.
 */
function selesaiKalibrasi(index) {
  alatList[index].status = "Selesai";
  localStorage.setItem(alatListKey, JSON.stringify(alatList));
  renderTable();
  showNotification("✅ Kalibrasi selesai! Silakan <b>EDIT</b> alat untuk mengatur jadwal 'Next Due' selanjutnya.", 'success');
}

/**
 * Fungsi untuk memeriksa secara otomatis status alat yang sudah melewati tanggal selesai.
 * Dijalankan setiap kali halaman dimuat.
 */
function cekStatusOtomatis() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalisasi tanggal hari ini
  let perubahanDitemukan = false;

  alatList.forEach(alat => {
    if (alat.status === "Proses") {
      const tanggalSelesai = new Date(alat.tanggalSelesai);
      if (today > tanggalSelesai) {
        alat.status = "Selesai";
        perubahanDitemukan = true;
        showNotification(`❗ Alat '${alat.description}' telah melewati estimasi selesai. Harap <b>EDIT</b> untuk mengatur 'Next Due' baru.`, 'warning');
      }
    }
  });

  if (perubahanDitemukan) {
    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    // Tabel akan di-render ulang oleh panggilan renderTable() di akhir script.
  }
}


// === FUNGSI INTI (RENDER TABEL, AKSI, DLL) - DIPERBAIKI ===

function renderTable() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = alatList.filter(alat =>
    Object.values(alat).some(val => String(val).toLowerCase().includes(keyword))
  );

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentData = filtered.slice(start, end);

  tableBody.innerHTML = "";

  currentData.forEach(alat => {
    // Dapatkan index asli dari `alatList` untuk memastikan modifikasi data yang benar
    const globalIndex = alatList.findIndex(item => item.registration === alat.registration && item.sn === alat.sn);

    const tenggat = (alat.status === "Proses" || alat.status === "Selesai") ? "-" : hitungTenggat(alat.nextDue);
    const nextDue = (alat.status === "Proses" || alat.status === "Selesai") ? "-" : alat.nextDue;

    // --- LOGIKA TOMBOL AKSI BARU ---
    let tombolAksi = '';
    if (alat.status === "Proses") {
      // Jika sedang proses, tampilkan tombol Selesai
      tombolAksi = `<button class="btn-aksi btn-selesai" onclick="selesaiKalibrasi(${globalIndex})">Selesai</button>`;
    } else if (alat.status !== "Selesai") {
      // Jika statusnya standar (bukan 'Proses' atau 'Selesai'), tampilkan tombol Kalibrasi
      tombolAksi = `<button class="btn-aksi btn-kalibrasi" onclick="openKalibrasi(${globalIndex})">Kalibrasi</button>`;
    }
    // Jika status "Selesai", tidak ada tombol kalibrasi/selesai yang muncul.

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${alat.registration}</td>
      <td>${alat.description}</td>
      <td>${alat.model || "-"}</td>
      <td>${alat.pn || "-"}</td>
      <td>${alat.sn || "-"}</td>
      <td>${alat.unit || "-"}</td>
      <td>${alat.unitDesc || "-"}</td>
      <td>${alat.location || "-"}</td>
      <td>${nextDue}</td>
      <td style="font-style: italic;">${tenggat}</td>
      <td><span class="status status-${(alat.status || "-").toLowerCase()}">${alat.status || "-"}</span></td>
      <td>${alat.lamaKalibrasi || "-"}</td>
      <td>${alat.tanggalSelesai || "-"}</td>
      <td class="kolom-aksi">
        <button class="btn-aksi btn-edit" onclick="editAlat(${globalIndex})">Edit</button>
        <button class="btn-aksi btn-hapus" onclick="hapusAlat(${globalIndex})">Hapus</button>
        ${tombolAksi}
      </td>
    `;
    tableBody.appendChild(row);
  });
  totalDisplay.textContent = filtered.length;
  renderPagination(filtered.length);
}

// Menggunakan event listener untuk handle klik pada tombol modal
document.getElementById("btnTambahAlat").addEventListener("click", () => {
  alatForm.reset();
  showModal(modalTambah);
});
modalTambah.querySelector("#batalBtn").addEventListener("click", () => hideModal(modalTambah));
modalEdit.querySelector("#cancelEditBtn").addEventListener("click", () => hideModal(modalEdit));
modalKalibrasi.querySelector("#batalKalibrasiBtn").addEventListener("click", () => hideModal(modalKalibrasi));

// --- FORM SUBMISSIONS ---
alatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const alatBaru = {
    registration: document.getElementById("registration").value,
    description: document.getElementById("description").value,
    model: document.getElementById("model").value,
    pn: document.getElementById("pn").value,
    sn: document.getElementById("sn").value,
    unit: document.getElementById("unit").value,
    unitDesc: document.getElementById("unitDesc").value,
    location: document.getElementById("location").value,
    nextDue: document.getElementById("nextDue").value,
    status: "-", // Status awal
    lamaKalibrasi: "-",
    tanggalMulai: "-",
    tanggalSelesai: "-",
  };
  alatList.push(alatBaru);
  localStorage.setItem(alatListKey, JSON.stringify(alatList));
  renderTable();
  hideModal(modalTambah);
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentEditIndex !== null) {
    const alat = alatList[currentEditIndex];
    alat.registration = document.getElementById("editRegistration").value;
    alat.description = document.getElementById("editDescription").value;
    alat.model = document.getElementById("editModel").value;
    alat.pn = document.getElementById("editPn").value;
    alat.sn = document.getElementById("editSn").value;
    alat.unit = document.getElementById("editUnit").value;
    alat.unitDesc = document.getElementById("editUnitDesc").value;
    alat.location = document.getElementById("editLocation").value;
    alat.nextDue = document.getElementById("editNextDue").value;
    // Jika statusnya 'Selesai', edit akan mengembalikannya ke status normal
    if (alat.status === "Selesai") {
      alat.status = "-";
      alat.lamaKalibrasi = "-";
      alat.tanggalMulai = "-";
      alat.tanggalSelesai = "-";
    }
    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    renderTable();
    hideModal(modalEdit);
    currentEditIndex = null;
  }
});

kalibrasiForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentEditIndex !== null) {
        const mulai = document.getElementById("kalMulai").value;
        const selesai = document.getElementById("kalSelesai").value;
        if (!mulai || !selesai || new Date(mulai) > new Date(selesai)) {
            alert("Tanggal tidak valid!");
            return;
        }
        const alat = alatList[currentEditIndex];
        alat.status = "Proses";
        alat.lamaKalibrasi = hitungLamaKalibrasi(mulai, selesai);
        alat.tanggalMulai = mulai;
        alat.tanggalSelesai = selesai;
        localStorage.setItem(alatListKey, JSON.stringify(alatList));
        renderTable();
        hideModal(modalKalibrasi);
        currentEditIndex = null;
    }
});

// --- FUNGSI AKSI (EDIT, HAPUS, BUKA KALIBRASI) ---
function editAlat(index) {
  currentEditIndex = index;
  const alat = alatList[index];
  document.getElementById("editRegistration").value = alat.registration;
  document.getElementById("editDescription").value = alat.description;
  document.getElementById("editModel").value = alat.model;
  document.getElementById("editPn").value = alat.pn;
  document.getElementById("editSn").value = alat.sn;
  document.getElementById("editUnit").value = alat.unit;
  document.getElementById("editUnitDesc").value = alat.unitDesc;
  document.getElementById("editLocation").value = alat.location;
  // Jika statusnya 'Selesai', 'Next Due' dikosongkan agar user wajib isi
  document.getElementById("editNextDue").value = alat.status === 'Selesai' ? '' : alat.nextDue;
  showModal(modalEdit);
}

function hapusAlat(index) {
  if (confirm(`Yakin ingin menghapus alat: ${alatList[index].description}?`)) {
    alatList.splice(index, 1);
    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    renderTable();
  }
}

function openKalibrasi(index) {
  currentEditIndex = index;
  kalibrasiForm.reset();
  showModal(modalKalibrasi);
}

// --- PENCARIAN & PAGINASI ---
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable();
    });
    pagination.appendChild(btn);
  }
}

// --- INISIALISASI HALAMAN ---
// Cek status otomatis dulu, baru render tabel dengan data terbaru
cekStatusOtomatis();
renderTable();

// Inisialisasi fungsionalitas Navbar
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});
document.getElementById("loggedInUser").textContent = localStorage.getItem("loggedInUser") || "Pengguna";
document.getElementById("loggedInUser").addEventListener("click", () => {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});