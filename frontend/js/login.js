document.addEventListener("DOMContentLoaded", () => {
    // === ELEMEN DOM ===
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const notificationBox = document.getElementById("notificationBox");

    // Pastikan semua elemen penting ada
    if (!loginForm || !passwordInput || !togglePassword) {
        console.error("Satu atau lebih elemen form login tidak ditemukan!");
        return;
    }

    // === FUNGSI NOTIFIKASI MODERN ===
    function showNotification(message, type = 'success') {
        if(notificationBox) {
            notificationBox.innerHTML = message;
            notificationBox.className = 'notification';
            notificationBox.classList.add(type === 'success' ? 'notif-success' : 'notif-warning', 'show');
            setTimeout(() => {
                notificationBox.classList.remove('show');
            }, 3000);
        }
    }

    // === EVENT SUBMIT FORM (DENGAN LOGIKA BARU) ===
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const loginButton = document.getElementById("loginButton"); 
    
        // 2. Ubah tampilan tombol untuk menandakan proses loading
        loginButton.textContent = "Loading...";
        loginButton.disabled = true;

        const username = document.getElementById("username").value.trim();
        const password = passwordInput.value.trim();

        loginMessage.textContent = "";
        loginMessage.className = "login-message";

        if (!username || !password) {
            loginMessage.textContent = "❗ Username dan password harus diisi.";
            loginMessage.classList.add("error");
            return;
        }

        // Siapkan data untuk dikirim ke server
        const loginData = { username, password };

        try {
            // Kirim permintaan login ke backend
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();

            if (!response.ok) {
                // Jika server merespons dengan error (misal: 401 Unauthorized)
                throw new Error(result.error || 'Terjadi kesalahan');
            }

            // Jika login berhasil
            loginMessage.textContent = "✅ Login berhasil! Mengarahkan...";
            loginMessage.classList.add("success");
            
            // Simpan data sesi yang diterima dari server
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", result.user.username);
            localStorage.setItem("currentUser", JSON.stringify(result.user));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } catch (error) {
            // Tangani semua jenis error (koneksi, server, dll)
            console.error("Login gagal:", error);
            loginMessage.textContent = `❗ ${error.message}`;
            loginMessage.classList.add("error");
        } finally {
            // 3. Kembalikan tombol ke kondisi semula setelah semua proses selesai
            loginButton.textContent = "Login";
            loginButton.disabled = false;
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
        showNotification(`✅ ${notificationMessage}`);
        sessionStorage.removeItem("notification");
    }
});