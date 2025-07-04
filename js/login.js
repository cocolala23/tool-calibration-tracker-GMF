document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // Ambil daftar user dari localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Cari user yang sesuai
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // ✅ Simpan info login
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", username);
    localStorage.setItem("currentUser", JSON.stringify(user)); // ✅ Supaya bisa dipakai di profil
      
    // Arahkan ke dashboard
    window.location.href = "dashboard.html";
  } else {
    // ❌ Jika login gagal
    errorMsg.textContent = "❗ Username atau password salah!";
    errorMsg.style.color = "red";
  }
});
