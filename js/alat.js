// === EVENT LISTENER UTAMA ===
window.addEventListener('DOMContentLoaded', inisialisasiHalamanAlat);
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        inisialisasiHalamanAlat();
    }
});

// === FUNGSI UTAMA UNTUK MENGINISIALISASI HALAMAN ===
function inisialisasiHalamanAlat() {
    
    // === KONSTANTA DAN VARIABEL GLOBAL ===
    const alatListKey = "alatList";
    let alatList = JSON.parse(localStorage.getItem(alatListKey)) || [];
    let currentDeleteIndex = null; // Variabel baru untuk menyimpan index yang akan dihapus
    let currentEditIndex = null;
    const itemsPerPage = 10;
    let currentPage = 1;
    let currentFilter = "semua";

    // === ELEMENT DOM ===
    const tableBody = document.querySelector("#alatTable tbody");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const pagination = document.getElementById("pagination");
    const paginationInfo = document.getElementById("paginationInfo");
    const emptyState = document.getElementById("emptyState");
    const tableElement = document.getElementById("alatTable");
    const notificationBox = document.getElementById("notificationBox");
    const modalTambah = document.getElementById("alatModal");
    const modalEdit = document.getElementById("editModal");
    const modalKalibrasi = document.getElementById("kalibrasiModal");
    const modalHapus = document.getElementById("deleteAlatModal"); // Ambil elemen modal hapus
    const alatForm = document.getElementById("alatForm");
    const editForm = document.getElementById("editForm");
    const kalibrasiForm = document.getElementById("kalibrasiForm");
    const confirmDeleteAlatBtn = document.getElementById("confirmDeleteAlatBtn"); // Ambil tombol konfirmasi hapus

    // === LOGIKA NAVBAR MODERN ===
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

    // === FUNGSI UTILITY ===
    const showNotification = (message, type = 'success') => {
        if(notificationBox) {
            notificationBox.innerHTML = message;
            notificationBox.className = 'notification';
            notificationBox.classList.add(type === 'success' ? 'notif-success' : 'notif-warning', 'show');
            setTimeout(() => {
                notificationBox.classList.remove('show');
            }, 3000);
        }
    };
    const hitungTenggat = (nextDue) => {
        const now = new Date(); now.setHours(0,0,0,0);
        const due = new Date(nextDue); due.setHours(0,0,0,0);
        const diff = (due - now) / (1000 * 60 * 60 * 24);
        if (diff < 0) return { text: `Lewat ${Math.abs(diff)} hari`, class: 'tenggat-lewat' };
        if (diff === 0) return { text: `Hari Ini`, class: 'tenggat-segera' };
        if (diff <= 7) return { text: `${diff} hari lagi`, class: 'tenggat-segera' };
        return { text: `${diff} hari lagi`, class: 'tenggat-aman' };
    };
    const showModal = (modalElement) => { if(modalElement) modalElement.classList.remove('hidden'); };
    const hideModal = (modalElement) => { if(modalElement) modalElement.classList.add('hidden'); };
    const hitungLamaKalibrasi = (mulai, selesai) => {
        const t1 = new Date(mulai);
        const t2 = new Date(selesai);
        const diffMs = t2 - t1;
        const hari = diffMs / (1000 * 60 * 60 * 24);
        return `${Math.ceil(hari)} hari`;
    };

    // === FUNGSI AKSI ===
    window.openEditModal = function(index) {
        currentEditIndex = index;
        const alat = alatList[index];
        if(alat) {
            document.getElementById("editRegistration").value = alat.registration;
            document.getElementById("editDescription").value = alat.description;
            document.getElementById("editMerk").value = alat.merk;
            document.getElementById("editModel").value = alat.model;
            document.getElementById("editPn").value = alat.pn;
            document.getElementById("editSn").value = alat.sn;
            document.getElementById("editUnit").value = alat.unit;
            document.getElementById("editUnitDesc").value = alat.unitDesc;
            document.getElementById("editLocation").value = alat.location;
            document.getElementById("editNextDue").value = alat.status === 'Selesai' ? '' : alat.nextDue;
            showModal(modalEdit);
        }
    };

    // **PERBAIKAN FUNGSI HAPUS ALAT**
    window.hapusAlat = function(index) {
        // Simpan index yang akan dihapus
        currentDeleteIndex = index;
        // Tampilkan nama alat di modal
        const namaAlatDihapus = document.getElementById("namaAlatDihapus");
        if (namaAlatDihapus) {
            namaAlatDihapus.textContent = alatList[index].description;
        }
        // Tampilkan modal konfirmasi
        showModal(modalHapus);
    };

    window.openKalibrasiModal = function(index) {
        currentEditIndex = index;
        if(kalibrasiForm) kalibrasiForm.reset();
        showModal(modalKalibrasi);
    };
    window.selesaiKalibrasi = function(index) {
        alatList[index].status = "Selesai";
        localStorage.setItem(alatListKey, JSON.stringify(alatList));
        renderTable();
        showNotification("✅ Kalibrasi selesai! Silakan <b>EDIT</b> alat untuk mengatur jadwal 'Next Due' selanjutnya.", 'success');
    };

    // === RENDER TABEL UTAMA ===
    function renderTable() {
        if (!tableBody) return;
        const keyword = searchInput.value.toLowerCase();
        let filteredData = alatList.filter(alat => {
            const matchesKeyword = Object.values(alat).some(val => String(val).toLowerCase().includes(keyword));
            const matchesFilter = (currentFilter === "semua") || (alat.status === currentFilter);
            return matchesKeyword && matchesFilter;
        });

        if (filteredData.length === 0) {
            if(tableElement) tableElement.classList.add('hidden');
            if(pagination) pagination.classList.add('hidden');
            if(paginationInfo) paginationInfo.classList.add('hidden');
            if(emptyState) emptyState.classList.remove('hidden');
            tableBody.innerHTML = "";
            return;
        } else {
            if(tableElement) tableElement.classList.remove('hidden');
            if(pagination) pagination.classList.remove('hidden');
            if(paginationInfo) paginationInfo.classList.remove('hidden');
            if(emptyState) emptyState.classList.add('hidden');
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedData = filteredData.slice(start, end);
        tableBody.innerHTML = "";
        paginatedData.forEach(alat => {
            const globalIndex = alatList.findIndex(item => item.sn === alat.sn && item.registration === alat.registration);
            const tenggat = (alat.status === "Proses" || alat.status === "Selesai") ? { text: '-', class: '' } : hitungTenggat(alat.nextDue);
            let statusHtml = '-';
            if (alat.status === 'Proses') statusHtml = `<span class="status-badge status-proses">Proses</span>`;
            else if (alat.status === 'Selesai') statusHtml = `<span class="status-badge status-selesai">Selesai</span>`;
            let aksiHtml = `<button class="action-btn edit-btn" title="Edit" onclick="openEditModal(${globalIndex})"><i class="fa-solid fa-pen-to-square"></i></button><button class="action-btn delete-btn" title="Hapus" onclick="hapusAlat(${globalIndex})"><i class="fa-solid fa-trash-can"></i></button>`;
            if (alat.status === 'Proses') {
                aksiHtml += `<button class="action-btn complete-btn" title="Selesaikan Kalibrasi" onclick="selesaiKalibrasi(${globalIndex})"><i class="fa-solid fa-check"></i></button>`;
            } else if (alat.status !== 'Selesai') {
                aksiHtml += `<button class="action-btn calibrate-btn" title="Mulai Kalibrasi" onclick="openKalibrasiModal(${globalIndex})"><i class="fa-solid fa-sliders"></i></button>`;
            }
            const row = document.createElement("tr");
            row.innerHTML = `<td>${alat.registration}</td><td>${alat.description}</td><td>${alat.merk || '-'}</td><td>${alat.model || '-'}</td><td>${alat.pn || '-'}</td><td>${alat.sn || '-'}</td><td>${alat.unit || '-'}</td><td>${alat.unitDesc || '-'}</td><td>${alat.location || '-'}</td><td>${(alat.status === "Proses" || alat.status === "Selesai") ? '-' : alat.nextDue}</td><td class="${tenggat.class}">${tenggat.text}</td><td>${statusHtml}</td><td>${alat.lamaKalibrasi || '-'}</td><td>${alat.tanggalSelesai || '-'}</td><td class="kolom-aksi-modern">${aksiHtml}</td>`;
            tableBody.appendChild(row);
        });
        renderPaginationControls(filteredData.length);
        if(paginationInfo) paginationInfo.textContent = `Menampilkan ${paginatedData.length > 0 ? start + 1 : 0} - ${start + paginatedData.length} dari ${filteredData.length} alat`;
    }

    function renderPaginationControls(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if(pagination) {
            pagination.innerHTML = "";
            if (totalPages > 1) {
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
        }
    }

    // === EVENT LISTENERS ===
    if(searchInput) searchInput.addEventListener("input", () => { currentPage = 1; renderTable(); });
    if(statusFilter) statusFilter.addEventListener("change", (e) => { currentPage = 1; currentFilter = e.target.value; renderTable(); });
    const btnTambahAlat = document.getElementById("btnTambahAlat");
    if(btnTambahAlat) btnTambahAlat.addEventListener("click", () => {
        if(alatForm) alatForm.reset();
        showModal(modalTambah);
    });
    document.querySelectorAll('.modal-close-btn, .btn-secondary').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            const modalToHide = document.getElementById(modalId);
            hideModal(modalToHide);
        });
    });
    if(alatForm) alatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alatList.push({
            registration: document.getElementById("registration").value, description: document.getElementById("description").value, merk: document.getElementById("merk").value,
            model: document.getElementById("model").value, pn: document.getElementById("pn").value, sn: document.getElementById("sn").value,
            unit: document.getElementById("unit").value, unitDesc: document.getElementById("unitDesc").value, location: document.getElementById("location").value,
            nextDue: document.getElementById("nextDue").value, status: "-", lamaKalibrasi: "-", tanggalMulai: "-", tanggalSelesai: "-",
        });
        localStorage.setItem(alatListKey, JSON.stringify(alatList));
        renderTable();
        hideModal(modalTambah);
        showNotification("✅ Alat baru berhasil ditambahkan!");
    });
    if(editForm) editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (currentEditIndex !== null) {
            const alat = alatList[currentEditIndex];
            alat.registration = document.getElementById("editRegistration").value;
            alat.description = document.getElementById("editDescription").value;
            alat.merk = document.getElementById("editMerk").value;
            alat.model = document.getElementById("editModel").value;
            alat.pn = document.getElementById("editPn").value;
            alat.sn = document.getElementById("editSn").value;
            alat.unit = document.getElementById("editUnit").value;
            alat.unitDesc = document.getElementById("editUnitDesc").value;
            alat.location = document.getElementById("editLocation").value;
            alat.nextDue = document.getElementById("editNextDue").value;
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
            showNotification("✅ Data alat berhasil diperbarui!");
        }
    });
    if(kalibrasiForm) kalibrasiForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (currentEditIndex !== null) {
            const alat = alatList[currentEditIndex];
            const mulai = document.getElementById("kalMulai").value;
            const selesai = document.getElementById("kalSelesai").value;
            if (!mulai || !selesai || new Date(mulai) > new Date(selesai)) {
                showNotification("Tanggal tidak valid!", "warning"); return;
            }
            alat.status = "Proses";
            alat.lamaKalibrasi = hitungLamaKalibrasi(mulai, selesai);
            alat.tanggalMulai = mulai;
            alat.tanggalSelesai = selesai;
            localStorage.setItem(alatListKey, JSON.stringify(alatList));
            renderTable();
            hideModal(modalKalibrasi);
            currentEditIndex = null;
            showNotification("⚙️ Proses kalibrasi berhasil dimulai!");
        }
    });

    // **EVENT LISTENER BARU UNTUK TOMBOL KONFIRMASI HAPUS**
    if (confirmDeleteAlatBtn) {
        confirmDeleteAlatBtn.addEventListener("click", () => {
            if (currentDeleteIndex !== null) {
                alatList.splice(currentDeleteIndex, 1);
                localStorage.setItem(alatListKey, JSON.stringify(alatList));
                renderTable();
                hideModal(modalHapus);
                showNotification("🗑️ Alat berhasil dihapus.", "warning");
                currentDeleteIndex = null; // Reset index setelah dihapus
            }
        });
    }
    
    // Panggil renderTable() sekali di akhir untuk menampilkan data saat pertama kali dimuat
    renderTable();
}