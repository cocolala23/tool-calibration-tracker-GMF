document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = passwordInput.value.trim();

        // Mengosongkan pesan sebelumnya
        loginMessage.textContent = "";
        loginMessage.className = "login-message";

        // Validasi input kosong (opsional tapi bagus untuk UX)
        if (!username || !password) {
            loginMessage.textContent = "❗ Username dan password harus diisi.";
            loginMessage.classList.add("error");
            return;
        }

        // Ambil daftar user dari localStorage
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Cari user yang sesuai
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // ✅ Jika login berhasil
            loginMessage.textContent = "✅ Login berhasil! Mengarahkan...";
            loginMessage.classList.add("success");

            // Simpan info login ke localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", username);
            localStorage.setItem("currentUser", JSON.stringify(user));

            // Beri jeda sejenak agar user bisa membaca pesan sukses
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500); // Arahkan setelah 1.5 detik

        } else {
            // ❌ Jika login gagal
            loginMessage.textContent = "❗ Username atau password salah!";
            loginMessage.classList.add("error");

            // Tambahkan animasi getar pada form untuk umpan balik
            loginForm.parentElement.classList.add('input-error');
            setTimeout(() => {
                loginForm.parentElement.classList.remove('input-error');
            }, 500);
        }
    });

    // Fitur toggle show/hide password
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "👁️";
        }
    });
});