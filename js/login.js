document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  let isPasswordVisible = false;

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? "text" : "password";
    togglePassword.src = isPasswordVisible
      ? "../gambar/lihat.png"
      : "../gambar/eye.png";
    togglePassword.alt = isPasswordVisible ? "Sembunyikan Password" : "Tampilkan Password";
  });

  // Handle login submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("errorMsg").textContent = "Username atau password salah.";
    }
  });
});
