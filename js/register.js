document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("regPassword");

    // Fitur toggle show/hide password
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "🙈"; // Ganti ikon saat password terlihat
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "👁️"; // Ganti ikon saat password tersembunyi
        }
    });

    // Fungsi untuk menampilkan pesan error di bawah input field
    function showFieldError(fieldId, message) {
        const errorField = document.getElementById("error" + fieldId);
        const inputField = document.getElementById("reg" + fieldId);
        errorField.textContent = message;
        inputField.classList.add("input-error"); // Menambahkan class untuk border merah
    }

    // Fungsi untuk membersihkan semua pesan error
    function clearAllErrors() {
        const errorFields = document.querySelectorAll(".error-field");
        const inputFields = document.querySelectorAll(".input-error");
        errorFields.forEach(field => field.textContent = "");
        inputFields.forEach(field => field.classList.remove("input-error"));
    }

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        clearAllErrors();

        const id = document.getElementById("regId").value.trim();
        const username = document.getElementById("regUsername").value.trim();
        const password = document.getElementById("regPassword").value;
        const phone = document.getElementById("regPhone").value.trim();
        const registerMessage = document.getElementById("registerMessage");

        let isValid = true;
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // --- VALIDASI INPUT ---
        if (!id) {
            showFieldError("Id", "ID Pegawai wajib diisi.");
            isValid = false;
        } else if (users.some(u => u.id === id)) {
            showFieldError("Id", "ID Pegawai sudah digunakan.");
            isValid = false;
        }

        if (!username) {
            showFieldError("Username", "Username wajib diisi.");
            isValid = false;
        } else if (users.some(u => u.username === username)) {
            showFieldError("Username", "Username sudah terdaftar.");
            isValid = false;
        }

        if (!password || password.length < 4) {
            showFieldError("Password", "Password minimal 4 karakter.");
            isValid = false;
        }

        if (!phone) {
            showFieldError("Phone", "Nomor HP wajib diisi.");
            isValid = false;
        } else if (!/^08[0-9]{8,12}$/.test(phone)) {
            showFieldError("Phone", "Format Nomor HP tidak valid.");
            isValid = false;
        } else if (users.some(u => u.phone === phone)) {
            showFieldError("Phone", "Nomor HP sudah digunakan.");
            isValid = false;
        }
        
        // Jika semua validasi lolos
        if (isValid) {
            // Tambahkan pengguna baru ke array
            users.push({ id, username, password, phone });
            localStorage.setItem("users", JSON.stringify(users));

            // Tampilkan pesan sukses
            registerMessage.textContent = "✅ Akun berhasil dibuat! Mengarahkan ke halaman login...";
            registerMessage.classList.add("success");
            
            // Arahkan ke halaman login setelah beberapa saat
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000); // Tunggu 2 detik
        }
    });
});