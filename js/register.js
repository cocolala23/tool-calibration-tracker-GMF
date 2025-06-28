function resetErrors() {
  const errorFields = document.querySelectorAll(".error-field");
  errorFields.forEach(field => field.textContent = "");
}

function showFieldError(fieldId, message) {
  const errorText = document.getElementById("error" + fieldId);
  const inputField = document.getElementById("reg" + fieldId);
  errorText.textContent = message;
  inputField.classList.add("input-error");

  setTimeout(() => {
    inputField.classList.remove("input-error");
  }, 500);
}

// Toggle show/hide password
document.getElementById("togglePassword").addEventListener("click", () => {
  const passwordInput = document.getElementById("regPassword");
  const toggleIcon = document.getElementById("togglePassword");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  resetErrors();

  const id = document.getElementById("regId").value.trim();
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const phone = document.getElementById("regPhone").value.trim();
  const level = document.getElementById("regLevel").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Validasi ID pegawai
  if (!id) {
    showFieldError("Id", "❗ ID pegawai wajib diisi.");
    return;
  }

  if (users.find(u => u.id === id)) {
    showFieldError("Id", "❗ ID pegawai sudah digunakan.");
    return;
  }

  if (users.find(u => u.username === username)) {
    showFieldError("Username", "❗ Username sudah terdaftar.");
    return;
  }

  if (users.find(u => u.phone === phone)) {
    showFieldError("Phone", "❗ Nomor HP sudah digunakan.");
    return;
  }

  if (!/^08[0-9]{8,12}$/.test(phone)) {
    showFieldError("Phone", "❗ Nomor HP tidak valid (format: 08xxxxxxxxxx).");
    return;
  }

  if (!password || password.length < 4) {
    showFieldError("Password", "❗ Password minimal 4 karakter.");
    return;
  }

  if (!level) {
    showFieldError("Level", "❗ Silakan pilih level jabatan.");
    return;
  }

  users.push({ id, username, password, phone, level });
  localStorage.setItem("users", JSON.stringify(users));

  const popup = document.createElement("div");
  popup.className = "success-popup";
  popup.textContent = "✅ Akun berhasil dibuat! Mengarahkan ke halaman login...";
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
    window.location.href = "index.html";
  }, 3000);
});
