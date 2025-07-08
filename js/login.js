document.addEventListener("DOMContentLoaded", () => {
    // === ELEMEN DOM ===
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const notificationBox = document.getElementById("notificationBox"); // Ambil elemen notifikasi baru

    // Pastikan semua elemen penting ada
    if (!loginForm || !passwordInput || !togglePassword) {
        console.error("Satu atau lebih elemen form login tidak ditemukan!");
        return;
    }

    // === FUNGSI NOTIFIKASI MODERN ===
    function showNotification(message, type = 'success') {
        if(notificationBox) {
            notificationBox.innerHTML = message;
            notificationBox.className = 'notification'; // Reset class
            notificationBox.classList.add(type === 'success' ? 'notif-success' : 'notif-warning', 'show');
            setTimeout(() => {
                notificationBox.classList.remove('show');
            }, 3000); // Notifikasi akan hilang setelah 3 detik
        }
    }

    // === EVENT SUBMIT FORM ===
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = passwordInput.value.trim();

        loginMessage.textContent = "";
        loginMessage.className = "login-message";

        if (!username || !password) {
            loginMessage.textContent = "❗ Username dan password harus diisi.";
            loginMessage.classList.add("error");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            loginMessage.textContent = "✅ Login berhasil! Mengarahkan...";
            loginMessage.classList.add("success");
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", username);
            localStorage.setItem("currentUser", JSON.stringify(user));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } else {
            loginMessage.textContent = "❗ Username atau password salah!";
            loginMessage.classList.add("error");
        }
    });

    // === LOGIKA TOGGLE PASSWORD ===
    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.classList.toggle("fa-eye");
            togglePassword.classList.toggle("fa-eye-slash");
        });
    }

    // === LOGIKA UNTUK MENAMPILKAN NOTIFIKASI DARI HALAMAN LAIN ===
    const notificationMessage = sessionStorage.getItem("notification");
    if (notificationMessage) {
        // Panggil fungsi notifikasi modern
        showNotification(`✅ ${notificationMessage}`);
        
        // Hapus pesan dari session storage agar tidak muncul lagi saat refresh
        sessionStorage.removeItem("notification");
    }
});