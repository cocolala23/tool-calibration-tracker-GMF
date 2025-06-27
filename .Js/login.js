document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
  
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);
  
    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("errorMsg").textContent = "Username atau password salah.";
    }
    localStorage.setItem("loggedInUser", user.username);

  });
  