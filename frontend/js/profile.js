document.addEventListener("DOMContentLoaded", () => {
    // === Logika Halaman Profil ===
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const notificationBox = document.getElementById("notificationBox");

    // **Fungsi Notifikasi Modern**
    function showNotification(message, type = 'success') {
        if(notificationBox) {
            notificationBox.innerHTML = message;
            notificationBox.className = 'notification';
            notificationBox.classList.add(type === 'success' ? 'notif-success' : 'notif-warning', 'show');
            setTimeout(() => {
                notificationBox.classList.remove('show');
            }, 3000);
        } else {
            alert(message); // Fallback jika elemen notifikasi tidak ditemukan
        }
    }
    
    // Fungsi untuk mengisi data profil ke elemen HTML
    function populateProfileData() {
        if (currentUser && currentUser.username) {
            document.getElementById("profileAvatar").textContent = currentUser.username.charAt(0).toUpperCase();
            document.getElementById("profileUsernameDisplay").textContent = currentUser.username;
            document.getElementById("profileIdDisplay").textContent = `ID Pegawai: ${currentUser.id}`;
            document.getElementById("displayId").textContent = currentUser.id;
            document.getElementById("displayUsername").textContent = currentUser.username;
            document.getElementById("displayPhone").textContent = currentUser.phone;
            document.getElementById("displayPassword").value = currentUser.password;
        } else {
            showNotification("Sesi tidak valid, silakan login kembali.", "warning");
            setTimeout(() => { window.location.href = "index.html"; }, 2000);
        }
    }

    // --- FITUR LIHAT PASSWORD ---
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("displayPassword");
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.classList.toggle("fa-eye");
            togglePassword.classList.toggle("fa-eye-slash");
        });
    }
    
    const toggleEditPassword = document.getElementById("toggleEditPassword");
    const editPasswordInput = document.getElementById("editPassword");
    if (toggleEditPassword && editPasswordInput) {
        toggleEditPassword.addEventListener("click", () => {
            const isPassword = editPasswordInput.type === "password";
            editPasswordInput.type = isPassword ? "text" : "password";
            toggleEditPassword.classList.toggle("fa-eye");
            toggleEditPassword.classList.toggle("fa-eye-slash");
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
            if(modalId) hideModal(modalId);
        });
    });

    // --- LOGIKA EDIT PROFIL ---
    const openEditModalBtn = document.getElementById("openEditModalBtn");
    const editProfileForm = document.getElementById("editProfileForm");
    if (openEditModalBtn) {
        openEditModalBtn.addEventListener("click", () => {
            document.getElementById("editId").value = currentUser.id;
            document.getElementById("editUsername").value = currentUser.username;
            document.getElementById("editPhone").value = currentUser.phone;
            document.getElementById("editPassword").value = "";
            showModal("editProfileModal");
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", async (e) => { // Fungsi ini sekarang menjadi async
            e.preventDefault();
            
            // 1. Mengumpulkan data dari form
            const newUsername = document.getElementById("editUsername").value.trim();
            const newPhone = document.getElementById("editPhone").value.trim();
            const newPassword = document.getElementById("editPassword").value;

            const updatedData = {
                username: newUsername,
                phone: newPhone,
            };

            // 2. Hanya tambahkan password ke data jika kolomnya diisi
            if (newPassword) {
                if (newPassword.length < 4) {
                    showNotification("Password baru minimal 4 karakter.", "warning");
                    return;
                }
                updatedData.password = newPassword;
            }

            try {
                // 3. Kirim data ke server menggunakan fetch
                const response = await fetch(`/api/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                const result = await response.json();
                if (!response.ok) {
                    // Jika server mengembalikan error, tampilkan pesannya
                    throw new Error(result.error || 'Gagal memperbarui profil.');
                }

                // 4. Jika berhasil, perbarui localStorage dengan data baru dari server
                localStorage.setItem("currentUser", JSON.stringify(result.user));
                localStorage.setItem("loggedInUser", result.user.username);

                // 5. Perbarui tampilan
                populateProfileData(); 
                hideModal("editProfileModal");
                showNotification("✅ Profil berhasil diperbarui!");
                document.getElementById("loggedInUser").textContent = result.user.username;

            } catch (error) {
                // Tangani jika ada error dari fetch atau dari server
                showNotification(error.message, "warning");
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
        confirmDeleteBtn.addEventListener("click", async () => { // Jadikan async
            try {
                const response = await fetch(`/api/users/${currentUser.id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error);
                }

                // Jika berhasil, bersihkan semua data sesi dan arahkan ke halaman login
                localStorage.clear();
                sessionStorage.setItem("notification", "Akun Anda telah berhasil dihapus.");
                window.location.href = "index.html";

            } catch (error) {
                console.error("Gagal menghapus akun:", error);
                // Tampilkan error jika gagal
                showNotification(error.message, 'warning'); 
            }
        });
    }

    // --- INISIALISASI HALAMAN ---
    populateProfileData();
});