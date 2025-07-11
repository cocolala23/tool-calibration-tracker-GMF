// === EVENT LISTENER UTAMA UNTUK MEMASTIKAN HALAMAN SELALU TER-UPDATE ===
window.addEventListener('DOMContentLoaded', inisialisasiHalamanAlat);
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log("Halaman dimuat dari cache. Inisialisasi ulang.");
        inisialisasiHalamanAlat();
    }
});


// === FUNGSI UTAMA UNTUK MENGINISIALISASI SELURUH HALAMAN ===
async function inisialisasiHalamanAlat() {
    
    // === KONSTANTA DAN VARIABEL GLOBAL ===
    const alatListKey = "alatList";
    let alatList = []; // Mulai dengan array kosong

    // Ambil data dari server saat halaman dimuat
    try {
        const response = await fetch('http://localhost:3000/api/alat');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        alatList = await response.json();
        console.log("Data yang diterima dari server:", alatList);
    } catch (error) {
        console.error("Gagal mengambil data alat dari server:", error);
        showNotification("Gagal memuat data dari server!", "warning");
    }
    let currentDataSn = null;
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
    const modalHapus = document.getElementById("deleteAlatModal");
    const alatForm = document.getElementById("alatForm");
    const editForm = document.getElementById("editForm");
    const kalibrasiForm = document.getElementById("kalibrasiForm");
    const confirmDeleteAlatBtn = document.getElementById("confirmDeleteAlatBtn");

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
            // (1) Cek dan ambil data tanggal dengan nama properti yang benar
            // Kode ini akan memeriksa 'alat.nextDue', jika tidak ada, ia akan memeriksa 'alat.next_due'
            const nextDueDateValue = alat.nextDue || alat.next_due;

            // (2) Proses tanggal dengan aman untuk mencegah error
            const isProcessed = alat.status === "Proses" || alat.status === "Selesai";
            const nextDueDate = nextDueDateValue ? new Date(nextDueDateValue) : null;
            
            // (3) Siapkan variabel untuk ditampilkan di tabel
            const displayDate = !isProcessed && nextDueDate ? nextDueDate.toISOString().split('T')[0] : '-';
            const tenggat = !isProcessed && nextDueDate ? hitungTenggat(nextDueDate) : { text: '-', class: '' };

            // --- Sisa kode untuk statusHtml dan aksiHtml tidak perlu diubah ---
            let statusHtml = '-';
            if (alat.status === 'Proses') statusHtml = `<span class="status-badge status-proses">Proses</span>`;
            else if (alat.status === 'Selesai') statusHtml = `<span class="status-badge status-selesai">Selesai</span>`;

            let aksiHtml = `
                <button class="action-btn edit-btn js-edit" title="Edit" data-registration="${alat.registration}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-btn delete-btn js-delete" title="Hapus" data-registration="${alat.registration}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            if (alat.status === 'Proses') {
                aksiHtml += `<button class="action-btn complete-btn js-complete" title="Selesaikan Kalibrasi" data-registration="${alat.registration}"><i class="fa-solid fa-check"></i></button>`;
            } else if (alat.status !== 'Selesai') {
                aksiHtml += `<button class="action-btn calibrate-btn js-calibrate" title="Mulai Kalibrasi" data-registration="${alat.registration}"><i class="fa-solid fa-sliders"></i></button>`;
            }

            const row = document.createElement("tr");
            // (4) Gunakan variabel yang sudah aman di dalam HTML
            row.innerHTML = `<td>${alat.registration}</td><td>${alat.description}</td><td>${alat.merk || '-'}</td><td>${alat.model || '-'}</td><td>${alat.pn || '-'}</td><td>${alat.sn || '-'}</td><td>${alat.unit || '-'}</td><td>${alat.unitDesc || '-'}</td><td>${alat.location || '-'}</td><td>${displayDate}</td><td class="${tenggat.class}">${tenggat.text}</td><td>${statusHtml}</td><td>${alat.lamaKalibrasi || '-'}</td><td>${alat.tanggalSelesai || '-'}</td><td class="kolom-aksi-modern">${aksiHtml}</td>`;
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

    // Listener "Pintar" untuk semua tombol aksi di tabel
    if (tableBody) {
        tableBody.addEventListener('click', async function (event) {
            const button = event.target.closest('.action-btn');
            if (!button) return;

            const registration = button.dataset.registration;
            if (!registration) return;

            currentDataSn = registration; // Kita tetap pakai variabel ini, tapi isinya registration
            const index = alatList.findIndex(alat => alat.registration === registration);
            if (index === -1) return;
            
            if (button.classList.contains('js-edit')) {
                const alat = alatList[index];
                document.getElementById("editRegistration").value = alat.registration;
                document.getElementById("editDescription").value = alat.description;
                document.getElementById("editMerk").value = alat.merk;
                document.getElementById("editModel").value = alat.model;
                document.getElementById("editPn").value = alat.pn;
                document.getElementById("editSn").value = alat.sn;
                document.getElementById("editUnit").value = alat.unit;
                document.getElementById("editUnitDesc").value = alat.unitDesc;
                document.getElementById("editLocation").value = alat.location;
                document.getElementById("editNextDue").value = alat.nextDue;
                showModal(modalEdit);
            } else if (button.classList.contains('js-delete')) {
                const alat = alatList[index];
                // Simpan nama alat di modal
                document.getElementById("namaAlatDihapus").textContent = `"${alat.description}"`;
                // Simpan registration ID langsung di tombol konfirmasi hapus
                document.getElementById("confirmDeleteAlatBtn").dataset.registration = alat.registration;
                showModal(document.getElementById('deleteAlatModal'));
            } else if (button.classList.contains('js-calibrate')) {
                if(kalibrasiForm) kalibrasiForm.reset();
                showModal(modalKalibrasi);
            } else if (button.classList.contains('js-complete')) { //
    
                // TAMBAHKAN SEMUA BARIS INI:
                try {
                    const response = await fetch(`http://localhost:3000/api/alat/selesai/${registration}`, { 
                        method: 'PUT' 
                    });

                    if (!response.ok) {
                        throw new Error('Gagal update status ke server.');
                    }

                    // Muat ulang data dari awal untuk menampilkan tabel yang sudah diperbarui
                    await inisialisasiHalamanAlat(); 
                    
                    showNotification("✅ Kalibrasi selesai!", 'success');
                    
                } catch (error) {
                    console.error(error);
                    showNotification("Gagal menghubungi server.", 'warning');
                }

            }
        });
    }

    // Listener lainnya
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

    if(alatForm) alatForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Dapatkan elemen tombol
        const saveAlatButton = document.getElementById("saveAlatButton");

        // 2. Tambahkan status loading
        saveAlatButton.textContent = "Menyimpan...";
        saveAlatButton.disabled = true;

        const alatBaru = {
            registration: document.getElementById("registration").value.trim(),
            description: document.getElementById("description").value,
            merk: document.getElementById("merk").value,
            model: document.getElementById("model").value,
            pn: document.getElementById("pn").value,
            sn: document.getElementById("sn").value.trim(),
            unit: document.getElementById("unit").value,
            unitDesc: document.getElementById("unitDesc").value,
            location: document.getElementById("location").value,
            nextDue: document.getElementById("nextDue").value,
        };

        if (!alatBaru.registration) {
            showNotification("Kode Registrasi wajib diisi!", "warning");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/alat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alatBaru),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal menambahkan alat.');
            }

            await inisialisasiHalamanAlat(); // Muat ulang data dari server
            hideModal(document.getElementById('alatModal'));
            showNotification("✅ Alat baru berhasil ditambahkan!");

        } catch (error) {
            console.error("Gagal mengirim data ke server:", error);
            if (error.message.includes("alat_pkey")) {
                showNotification("Gagal: Kode Registrasi sudah digunakan. Harap gunakan kode yang unik.", "warning");
            } else {
                showNotification(error.message, "warning"); // Tampilkan pesan error lain seperti biasa
            }
        } finally {
            // 3. Tambahkan blok finally untuk mengembalikan tombol
            saveAlatButton.textContent = "Simpan Alat";
            saveAlatButton.disabled = false;
        }
    });

    if(editForm) editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Dapatkan elemen tombol
        const updateAlatButton = document.getElementById("updateAlatButton");

        // 2. Tambahkan status loading
        updateAlatButton.textContent = "Menyimpan...";
        updateAlatButton.disabled = true;

        // 1. Kumpulkan semua data yang diubah dari form
        const dataDiedit = {
            registration: document.getElementById("editRegistration").value,
            description: document.getElementById("editDescription").value,
            merk: document.getElementById("editMerk").value,
            model: document.getElementById("editModel").value,
            pn: document.getElementById("editPn").value,
            sn: document.getElementById("editSn").value, // S/N yang baru (jika diubah)
            unit: document.getElementById("editUnit").value,
            unitDesc: document.getElementById("editUnitDesc").value,
            location: document.getElementById("editLocation").value,
            nextDue: document.getElementById("editNextDue").value,
        };

        // Pastikan kita tahu S/N asli dari alat yang sedang diedit
        const registrationAsli = currentDataSn; 
        if (!registrationAsli) {
            showNotification("Gagal mengidentifikasi alat yang akan diedit.", "warning");
            return;
        }

        try {
            // 2. Kirim data ke server menggunakan fetch dengan metode PUT
            // Perhatikan URL-nya: kita menyertakan S/N asli di akhir
            const response = await fetch(`http://localhost:3000/api/alat/${registrationAsli}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataDiedit),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal memperbarui data alat.');
            }

            // 3. Jika berhasil, muat ulang data dari server untuk menampilkan tabel terbaru
            await inisialisasiHalamanAlat();

            hideModal(modalEdit);
            showNotification("✅ Data alat berhasil diperbarui!");

        } catch (error) {
            console.error("Gagal mengirim pembaruan ke server:", error);
            showNotification(error.message, "warning");
        } finally {
            updateAlatButton.textContent = "Simpan Perubahan";
            updateAlatButton.disabled = false;
        }
    });

    if(kalibrasiForm) kalibrasiForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const registrationUntukDikalibrasi = currentDataSn;
        if (!registrationUntukDikalibrasi) return;

        // 1. Kumpulkan data dari form kalibrasi
        const dataKalibrasi = {
            status: "Proses",
            calibration_start: document.getElementById("kalMulai").value,
            calibration_end: document.getElementById("kalSelesai").value
        };

        // 2. Validasi tanggal
        if (!dataKalibrasi.calibration_start || !dataKalibrasi.calibration_end || new Date(dataKalibrasi.calibration_start) > new Date(dataKalibrasi.calibration_end)) {
            showNotification("Tanggal tidak valid!", "warning");
            return;
        }

        try {
            // 3. Kirim data ke endpoint baru
            const response = await fetch(`http://localhost:3000/api/alat/kalibrasi/${registrationUntukDikalibrasi}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataKalibrasi),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal memulai kalibrasi.');
            }

            // 4. Jika berhasil, muat ulang data
            await inisialisasiHalamanAlat();

            hideModal(modalKalibrasi);
            showNotification("⚙️ Proses kalibrasi berhasil dimulai!");

        } catch (error) {
            console.error("Gagal memulai proses kalibrasi:", error);
            showNotification(error.message, "warning");
        }
    });

    if (confirmDeleteAlatBtn) {
        confirmDeleteAlatBtn.addEventListener("click", async () => {
            
            const registrationUntukDihapus = event.currentTarget.dataset.registration;
           
            if (!registrationUntukDihapus) {
                showNotification("Gagal menghapus: ID alat tidak ditemukan.", "warning");
                return;
            }

            try {
                // 1. Kirim permintaan hapus ke server
                const response = await fetch(`http://localhost:3000/api/alat/${registrationUntukDihapus}`, {
                    method: 'DELETE',
                });

                if (!response.ok && response.status !== 404) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Gagal menghapus alat.');
                }

                // 2. Jika berhasil, muat ulang data untuk menampilkan tabel terbaru
                await inisialisasiHalamanAlat();

                hideModal(document.getElementById('deleteAlatModal'));
                showNotification("🗑️ Alat berhasil dihapus.", "warning");

            } catch (error) {
                console.error("Gagal mengirim permintaan hapus:", error);
                showNotification(error.message, "warning");
            }
        });
    }
    
    // Panggil renderTable() sekali di akhir untuk menampilkan data saat pertama kali dimuat
    renderTable();
}