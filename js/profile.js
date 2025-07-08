document.addEventListener("DOMContentLoaded", () => {
    // === LOGIKA NAVBAR MODERN (Konsisten dengan halaman lain) ===
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
        editProfileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newId = document.getElementById("editId").value.trim();
            const newUsername = document.getElementById("editUsername").value.trim();
            const newPhone = document.getElementById("editPhone").value.trim();
            const newPassword = document.getElementById("editPassword").value;

            const isIdTaken = users.some(user => user.id === newId && user.id !== currentUser.id);
            if (isIdTaken) { showNotification("ID Pegawai sudah digunakan.", "warning"); return; }
            
            const isUsernameTaken = users.some(user => user.username === newUsername && user.id !== currentUser.id);
            if (isUsernameTaken) { showNotification("Username sudah digunakan.", "warning"); return; }

            if (newPassword && newPassword.length < 4) {
                showNotification("Password baru minimal 4 karakter.", "warning");
                return;
            }

            const userIndex = users.findIndex(user => user.id === currentUser.id);
            if (userIndex > -1) {
                users[userIndex].id = newId;
                users[userIndex].username = newUsername;
                users[userIndex].phone = newPhone;
                if (newPassword) { users[userIndex].password = newPassword; }

                localStorage.setItem("users", JSON.stringify(users));
                currentUser = users[userIndex];
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                localStorage.setItem("loggedInUser", newUsername);

                populateProfileData();
                hideModal("editProfileModal");
                showNotification("✅ Profil berhasil diperbarui!");
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
            const updatedUsers = users.filter(user => user.id !== currentUser.id);
            localStorage.setItem("users", JSON.stringify(updatedUsers));
            localStorage.removeItem("currentUser");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("isLoggedIn");
            sessionStorage.setItem("notification", "Akun Anda telah berhasil dihapus.");
            window.location.href = "index.html";
        });
    }

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navLinks = document.getElementById("navLinks");

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // --- INISIALISASI HALAMAN ---
    populateProfileData();
});