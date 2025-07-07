document.addEventListener("DOMContentLoaded", () => {
    // === LOGIKA NAVBAR MODERN (Konsisten dengan halaman lain) ===
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("❗ Anda harus login terlebih dahulu.");
        window.location.href = "index.html";
        return; // Hentikan eksekusi jika tidak login
    }
    const loggedInUserDisplay = document.getElementById("loggedInUser");
    if (loggedInUserDisplay) loggedInUserDisplay.textContent = loggedInUser;
    
    const userAvatarNav = document.querySelector(".user-avatar");
    if (userAvatarNav) userAvatarNav.textContent = loggedInUser.charAt(0).toUpperCase();
    
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

    // === Logika Halaman Profil ===
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Fungsi untuk menampilkan data profil ke UI
    function populateProfileData() {
        if (!currentUser) return;

        // Header Kartu Profil
        document.getElementById("profileAvatar").textContent = currentUser.username.charAt(0).toUpperCase();
        document.getElementById("profileUsernameDisplay").textContent = currentUser.username;
        document.getElementById("profileIdDisplay").textContent = `ID Pegawai: ${currentUser.id}`;

        // Detail Informasi
        document.getElementById("displayUsername").textContent = currentUser.username;
        document.getElementById("displayPhone").textContent = currentUser.phone;
        document.getElementById("displayPassword").value = currentUser.password;
    }

    // --- FITUR LIHAT PASSWORD ---
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("displayPassword");
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                togglePassword.textContent = "👁️";
            }
        });
    }

    // --- LOGIKA MODAL (UMUM) ---
    const showModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("hidden");
    };
    const hideModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("hidden");
    };

    // Event listener untuk semua tombol close modal
    document.querySelectorAll('.modal-close-btn, .btn-secondary').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            hideModal(modalId);
        });
    });

    // --- LOGIKA EDIT PROFIL ---
    const openEditModalBtn = document.getElementById("openEditModalBtn");
    const editProfileForm = document.getElementById("editProfileForm");
    if (openEditModalBtn) {
        openEditModalBtn.addEventListener("click", () => {
            // Isi form dengan data saat ini sebelum ditampilkan
            document.getElementById("editUsername").value = currentUser.username;
            document.getElementById("editPhone").value = currentUser.phone;
            document.getElementById("editPassword").value = ""; // Kosongkan password
            showModal("editProfileModal");
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newUsername = document.getElementById("editUsername").value.trim();
            const newPhone = document.getElementById("editPhone").value.trim();
            const newPassword = document.getElementById("editPassword").value;

            // Validasi sederhana (bisa ditambahkan validasi lain)
            const isUsernameTaken = users.some(user => user.username === newUsername && user.id !== currentUser.id);
            if (isUsernameTaken) {
                alert("Username sudah digunakan oleh pengguna lain.");
                return;
            }

            // Cari index pengguna di array utama
            const userIndex = users.findIndex(user => user.id === currentUser.id);
            if (userIndex > -1) {
                // Perbarui data
                users[userIndex].username = newUsername;
                users[userIndex].phone = newPhone;
                if (newPassword) { // Hanya perbarui password jika diisi
                    users[userIndex].password = newPassword;
                }

                // Simpan array users yang sudah diperbarui
                localStorage.setItem("users", JSON.stringify(users));

                // Perbarui juga data currentUser dan loggedInUser
                currentUser = users[userIndex];
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                localStorage.setItem("loggedInUser", newUsername);

                // Perbarui tampilan di halaman dan tutup modal
                populateProfileData();
                hideModal("editProfileModal");
                alert("Profil berhasil diperbarui!");
                // Perbarui juga tampilan di navbar
                document.getElementById("loggedInUser").textContent = newUsername;
            }
        });
    }

    // --- LOGIKA HAPUS AKUN ---
    const openDeleteModalBtn = document.getElementById("openDeleteModalBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    if (openDeleteModalBtn) {
        openDeleteModalBtn.addEventListener("click", () => {
            showModal("deleteConfirmModal");
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            // Hapus pengguna dari array users
            const updatedUsers = users.filter(user => user.id !== currentUser.id);
            localStorage.setItem("users", JSON.stringify(updatedUsers));

            // Hapus semua data sesi dan arahkan ke halaman login
            localStorage.removeItem("currentUser");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("isLoggedIn");
            
            alert("Akun berhasil dihapus.");
            window.location.href = "index.html";
        });
    }

    // --- INISIALISASI HALAMAN ---
    // Panggil fungsi untuk mengisi data saat halaman dimuat
    populateProfileData();
});