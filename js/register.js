document.addEventListener("DOMContentLoaded", () => {
    // === ELEMEN DOM ===
    const registerForm = document.getElementById("registerForm");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("regPassword");
    const registerMessage = document.getElementById("registerMessage");

    // Pastikan semua elemen penting ada sebelum melanjutkan
    if (!registerForm || !togglePassword || !passwordInput) {
        console.error("Elemen form pendaftaran tidak ditemukan!");
        return;
    }

    // === FITUR TOGGLE PASSWORD ===
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            
            // Ganti kelas ikon
            togglePassword.classList.toggle("fa-eye");
            togglePassword.classList.toggle("fa-eye-slash");
        });
    }

    // === FUNGSI VALIDASI ===
    function showFieldError(fieldId, message) {
        const errorField = document.getElementById(`error${fieldId}`);
        const inputField = document.getElementById(`reg${fieldId}`);
        if (errorField) errorField.textContent = message;
        if (inputField) inputField.classList.add("input-error");
    }

    function clearAllErrors() {
        document.querySelectorAll(".error-field").forEach(field => field.textContent = "");
        document.querySelectorAll(".input-error").forEach(field => field.classList.remove("input-error"));
    }

    // === EVENT SUBMIT FORM ===
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        clearAllErrors();

        const id = document.getElementById("regId").value.trim();
        const username = document.getElementById("regUsername").value.trim();
        const password = passwordInput.value;
        const phone = document.getElementById("regPhone").value.trim();
        
        let isValid = true;
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Validasi ID Pegawai
        if (!id) {
            showFieldError("Id", "ID Pegawai wajib diisi.");
            isValid = false;
        } else if (users.some(u => u.id === id)) {
            showFieldError("Id", "ID Pegawai sudah digunakan.");
            isValid = false;
        }

        // Validasi Username
        if (!username) {
            showFieldError("Username", "Username wajib diisi.");
            isValid = false;
        } else if (users.some(u => u.username === username)) {
            showFieldError("Username", "Username sudah terdaftar.");
            isValid = false;
        }

        // Validasi Password
        if (!password || password.length < 4) {
            showFieldError("Password", "Password minimal 4 karakter.");
            isValid = false;
        }

        // Validasi Nomor HP
        if (!phone) {
            showFieldError("Phone", "Nomor HP wajib diisi.");
            isValid = false;
        } else if (!/^08[0-9]{8,12}$/.test(phone)) {
            showFieldError("Phone", "Format Nomor HP tidak valid. Contoh: 081234567890");
            isValid = false;
        } else if (users.some(u => u.phone === phone)) {
            showFieldError("Phone", "Nomor HP sudah digunakan.");
            isValid = false;
        }
        
        // Jika semua validasi lolos
        if (isValid) {
            // Tambahkan objek pengguna baru
            users.push({ id, username, password, phone, merk: '' }); // Tambahkan properti merk
            localStorage.setItem("users", JSON.stringify(users));

            // Tampilkan pesan sukses dan arahkan ke halaman login
            if (registerMessage) {
                registerMessage.textContent = "✅ Akun berhasil dibuat! Mengarahkan ke halaman login...";
                registerMessage.classList.add("success");
            }
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000); // Tunggu 2 detik
        }
    });
});