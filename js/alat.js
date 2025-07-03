const alatListKey = "alatList";
let alatList = JSON.parse(localStorage.getItem(alatListKey)) || [];
let currentEditIndex = null;
const itemsPerPage = 15;
let currentPage = 1;

// DOM Elements
const tableBody = document.querySelector("#alatTable tbody");
const searchInput = document.getElementById("searchInput");
const totalDisplay = document.getElementById("totalAlat");
const pagination = document.getElementById("pagination");

const modal = document.getElementById("alatModal");
const modalTitle = document.getElementById("modalTitle");
const alatForm = document.getElementById("alatForm");
const batalBtn = document.getElementById("batalBtn");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const notificationBox = document.getElementById("notificationBox");
const loggedInUser = localStorage.getItem("loggedInUser");
const loggedInUserSpan = document.getElementById("loggedInUser");
const userDropdown = document.getElementById("userDropdown");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

// 1. Cek Login
if (!loggedInUser) {
  alert("❗ Anda harus login terlebih dahulu.");
  window.location.href = "index.html";
} else {
  loggedInUserSpan.textContent = loggedInUser;
}

// 2. Toggle dropdown user
loggedInUserSpan.addEventListener("click", () => {
  userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
});

// 3. Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});

editProfileBtn.addEventListener("click", () => {
  window.location.href = "profile.html";
});

// 🔔 Notifikasi
function showNotification(message, color = "#0077b6") {
  notificationBox.textContent = message;
  notificationBox.style.backgroundColor = color;
  notificationBox.classList.add("show");

  setTimeout(() => {
    notificationBox.classList.remove("show");
  }, 2500);
}

// MODAL: Tambah Alat
document.getElementById("btnTambahAlat").addEventListener("click", () => {
  alatForm.reset();
  modal.classList.remove("hidden");
});

batalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// MODAL: Edit Alat
cancelEditBtn.addEventListener("click", () => {
  editModal.classList.add("hidden");
});

// Submit Tambah Alat
alatForm.addEventListener("submit", function (e) {
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
  };

  alatList.push(alat);
  localStorage.setItem(alatListKey, JSON.stringify(alatList));
  showNotification("✅ Alat berhasil ditambahkan!");
  modal.classList.add("hidden");
  renderTable();
});

// Tampilkan Tabel
function renderTable() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = alatList.filter((alat) =>
    Object.values(alat).some((val) => val.toLowerCase().includes(keyword))
  );

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentData = filtered.slice(start, end);

  tableBody.innerHTML = "";
  currentData.forEach((alat, index) => {
    const realIndex = alatList.indexOf(alat); // Index dari array utama
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
      <td>${alat.nextDue}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editAlat(${realIndex})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteAlat(${realIndex})">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  totalDisplay.textContent = alatList.length;
  renderPagination(filtered.length);
}

// Pagination
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

// Edit Alat
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

  editModal.classList.remove("hidden");
}

// Simpan Edit
editForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (currentEditIndex !== null) {
    alatList[currentEditIndex] = {
      registration: document.getElementById("editRegistration").value,
      description: document.getElementById("editDescription").value,
      model: document.getElementById("editModel").value,
      pn: document.getElementById("editPn").value,
      sn: document.getElementById("editSn").value,
      unit: document.getElementById("editUnit").value,
      unitDesc: document.getElementById("editUnitDesc").value,
      location: document.getElementById("editLocation").value,
      nextDue: document.getElementById("editNextDue").value,
    };

    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    showNotification("✏️ Data alat berhasil diperbarui!", "#f9a826");
    editModal.classList.add("hidden");
    renderTable();
  }
});

// Hapus Alat
function deleteAlat(index) {
  if (confirm("Yakin ingin menghapus alat ini?")) {
    alatList.splice(index, 1);
    localStorage.setItem(alatListKey, JSON.stringify(alatList));
    showNotification("🗑️ Alat berhasil dihapus!", "#ef476f");
    renderTable();
  }
}

// Cari Alat
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

// Inisialisasi
renderTable();
