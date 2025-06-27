// Menghapus semua pesan error sebelumnya
function resetErrors() {
    const errorFields = document.querySelectorAll(".error-field");
    errorFields.forEach(field => field.textContent = "");
  }
  
  // Menampilkan pesan error di bawah kolom input yang bermasalah
  function showFieldError(fieldId, message) {
    const errorText = document.getElementById("error" + fieldId);
    const inputField = document.getElementById("reg" + fieldId);
  
    errorText.textContent = message;
    inputField.classList.add("input-error");
  
    setTimeout(() => {
      inputField.classList.remove("input-error");
    }, 500);
  }
  
  // Event listener untuk form pendaftaran
  document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    resetErrors();
  
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    const phone = document.getElementById("regPhone").value.trim();
    const level = document.getElementById("regLevel").value;
  
    let users = JSON.parse(localStorage.getItem("users")) || [];
  
    // Validasi username tidak boleh sama
    if (users.find(u => u.username === username)) {
      showFieldError("Username", "❗ Username sudah terdaftar.");
      return;
    }
  
    // Validasi no HP tidak boleh sama
    if (users.find(u => u.phone === phone)) {
      showFieldError("Phone", "❗ Nomor HP sudah digunakan.");
      return;
    }
  
    // Validasi format no HP (08xxxx dan 10-13 digit)
    if (!/^08[0-9]{8,12}$/.test(phone)) {
      showFieldError("Phone", "❗ Nomor HP tidak valid (format: 08xxxxxxxxxx).");
      return;
    }
  
    // Validasi password minimal 4 karakter
    if (!password || password.length < 4) {
      showFieldError("Password", "❗ Password minimal 4 karakter.");
      return;
    }
  
    // Validasi level jabatan harus dipilih
    if (!level) {
      showFieldError("Level", "❗ Silakan pilih level jabatan.");
      return;
    }
  
    // Simpan user baru ke localStorage
    users.push({ username, password, phone, level });
    localStorage.setItem("users", JSON.stringify(users));
  
    // Buat dan tampilkan pop-up sukses
    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.textContent = "✅ Akun berhasil dibuat! Mengarahkan ke halaman login...";
    document.body.appendChild(popup);
  
    // Setelah 3 detik, hapus pop-up dan redirect
    setTimeout(() => {
      popup.remove();
      window.location.href = "index.html";
    }, 3000);
  });
  