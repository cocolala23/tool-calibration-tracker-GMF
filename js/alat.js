// === KONSTANTA DAN VARIABEL ===
const alatListKey = "alatList";
let alatList = JSON.parse(localStorage.getItem(alatListKey)) || [];
let currentEditIndex = null;
let indexKalibrasi = null;
const itemsPerPage = 10;
let currentPage = 1;

// === ELEMENT DOM ===
const tableBody = document.querySelector("#alatTable tbody");
const totalDisplay = document.getElementById("totalAlat");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("pagination");

const alatForm = document.getElementById("alatForm");
const editForm = document.getElementById("editForm");
const kalibrasiForm = document.getElementById("kalibrasiForm");
const modalTambah = document.getElementById("alatModal");
const modalEdit = document.getElementById("editModal");
const modalKalibrasi = document.getElementById("kalibrasiModal");

const batalTambahBtn = document.getElementById("batalBtn");
const batalEditBtn = document.getElementById("cancelEditBtn");
const batalKalibrasiBtn = document.getElementById("batalKalibrasiBtn");

// === UTILITY ===
function hitungTenggat(nextDue) {
  const now = new Date();
  const due = new Date(nextDue);
  const selisih = (due - now) / (1000 * 60 * 60 * 24); // dalam hari

  if (selisih > 30) {
    return `${Math.ceil(selisih / 30)} bulan lagi`;
  } else if (selisih > 7) {
    return `${Math.ceil(selisih / 7)} minggu lagi`;
  } else if (selisih > 0) {
    return `${Math.ceil(selisih)} hari lagi`;
  } else {
    return `❗ Lewat tenggat`;
  }
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

// === TOMBOL TAMBAH ALAT ===
document.getElementById("btnTambahAlat").addEventListener("click", () => {
  alatForm.reset();
  showModal(modalTambah);
});
batalTambahBtn.addEventListener("click", () => hideModal(modalTambah));
batalEditBtn.addEventListener("click", () => hideModal(modalEdit));
batalKalibrasiBtn.addEventListener("click", () => hideModal(modalKalibrasi));

// === TOMBOL LOGOUT ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});

document.getElementById("loggedInUser").textContent = localStorage.getItem("loggedInUser") || "Pengguna";

// === TAMBAH ALAT ===
alatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const alat = {
    registration: document.getElementById("registration").value,
    description: document.getElementById("description").value,
    model: document.getElementById("model").value,
    pn: document.getElementById("pn").value,
    sn: document.getElementById("sn").value,
    unit: document.getElementById("unit").value,
    unitDesc: document.getElementById("unitDesc").value,
    location: document.getElementById("location").value,
    nextDue: document.getElementById("nextDue").value,
    status: "-",
    lamaKalibrasi: "-",
    tanggalSelesai: "-",
  };
  alatList.push(alat);
  localStorage.setItem(alatListKey, JSON.stringify(alatList));
  renderTable();
  hideModal(modalTambah);
});

// === RENDER TABEL ===
function renderTable() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = alatList.filter(alat =>
    Object.values(alat).some(val => val && val.toLowerCase().includes(keyword))
  );
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(start, start + itemsPerPage);
  tableBody.innerHTML = "";

  currentData.forEach((alat, index) => {
    const tenggat = (alat.status === "Proses") ? "-" : hitungTenggat(alat.nextDue);
    const nextDue = (alat.status === "Proses") ? "-" : alat.nextDue;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${alat.registration}</td>
      <td>${alat.description}</td>
      <td>${alat.model}</td>
      <td>${alat.pn}</td>
      <td>${alat.sn}</td>
      <td>${alat.unit}</td>
      <td>${alat.unitDesc}</td>
      <td>${alat.location}</td>
      <td>${nextDue}</td>
      <td>${tenggat}</td>
      <td>${alat.status || "-"}</td>
      <td>${alat.lamaKalibrasi || "-"}</td>
      <td>${alat.tanggalSelesai || "-"}</td>
      <td>
        <button onclick="editAlat(${index})">Edit</button>
        <button onclick="hapusAlat(${index})">Hapus</button>
        ${alat.status === "Proses" || alat.status === "Selesai" ? "" : `<button onclick="openKalibrasi(${index})">Kalibrasi</button>`}
      </td>
    `;
    tableBody.appendChild(row);
  });
  totalDisplay.textContent = alatList.length;
  renderPagination(filtered.length);
}

// === KALIBRASI ===
function openKalibrasi(index) {
  indexKalibrasi = index;
  kalibrasiForm.reset();
  showModal(modalKalibrasi);
}

kalibrasiForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const mulai = document.getElementById("kalMulai").value;
  const selesai = document.getElementById("kalSelesai").value;

  if (!mulai || !selesai || new Date(mulai) > new Date(selesai)) {
    alert("Tanggal tidak valid!");
    return;
  }

  const lama = hitungLamaKalibrasi(mulai, selesai);
  alatList[indexKalibrasi].status = "Proses";
  alatList[indexKalibrasi].nextDue = "-";
  alatList[indexKalibrasi].lamaKalibrasi = lama;
  alatList[indexKalibrasi].tanggalSelesai = selesai;

  localStorage.setItem(alatListKey, JSON.stringify(alatList));
  renderTable();
  hideModal(modalKalibrasi);
});

// === EDIT ALAT ===
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
  document.getElementById("editNextDue").value = alat.nextDue;

  showModal(modalEdit);
}

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

    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    renderTable();
    hideModal(modalEdit);
  }
});

// === HAPUS ===
function hapusAlat(index) {
  if (confirm("Hapus alat ini?")) {
    alatList.splice(index, 1);
    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    renderTable();
  }
}

// === PENCARIAN ===
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

// === PAGINATION ===
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

// === INISIALISASI ===
renderTable();
