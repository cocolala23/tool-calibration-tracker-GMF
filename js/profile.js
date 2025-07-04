document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("Anda belum login!");
    window.location.href = "index.html";
    return;
  }

  // Tampilkan data user ke halaman
  document.getElementById("displayId").textContent = currentUser.id || "-";
  document.getElementById("displayUsername").textContent = currentUser.username || "-";
  document.getElementById("displayPhone").textContent = currentUser.phone || "-";
  document.getElementById("displayLevel").textContent = currentUser.level || "-";
  document.getElementById("displayPassword").textContent = "********";

  // Tombol hapus akun
  document.getElementById("deleteAccountBtn").addEventListener("click", () => {
    document.getElementById("confirmModal").classList.remove("hidden");
  });

  document.getElementById("confirmYes").addEventListener("click", () => {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Hapus user dari daftar users
    users = users.filter(user => user.username !== currentUser.username);
    localStorage.setItem("users", JSON.stringify(users));

    // Hapus info login
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isLoggedIn");

    // Kembali ke halaman login
    window.location.href = "index.html";
  });

  document.getElementById("confirmNo").addEventListener("click", () => {
    document.getElementById("confirmModal").classList.add("hidden");
  });
});
