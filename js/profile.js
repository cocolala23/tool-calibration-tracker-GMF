const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
let users = JSON.parse(localStorage.getItem("users")) || [];
const userIndex = users.findIndex(u => u.username === loggedUser?.username);

if (!loggedUser || userIndex === -1) {
  window.location.href = "index.html";
}

const userData = users[userIndex];
document.getElementById("usernameDisplay").textContent = userData.username;
document.getElementById("editUsername").value = userData.username;
document.getElementById("editPhone").value = userData.phone;
document.getElementById("editPassword").value = userData.password;

// Popup
function showPopup(message, callback) {
  const popup = document.getElementById("popup");
  const messageEl = document.getElementById("popup-message");
  
  if (!popup || !messageEl) return;
  
  messageEl.textContent = message;
  popup.classList.remove("hidden");

  setTimeout(() => {
    popup.classList.add("hidden");
    if (callback) callback();
  }, 2500);
}

// Modal
function showConfirmModal(message, yesCallback) {
  const modal = document.getElementById("confirmModal");
  const msg = document.getElementById("confirmMessage");
  msg.textContent = message;
  modal.classList.remove("hidden");

  document.getElementById("confirmYes").onclick = () => {
    modal.classList.add("hidden");
    yesCallback();
  };
  document.getElementById("confirmNo").onclick = () => {
    modal.classList.add("hidden");
  };
}

// Simpan perubahan
document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();
  showConfirmModal("Simpan perubahan data akun?", () => {
    users[userIndex].username = document.getElementById("editUsername").value.trim();
    users[userIndex].phone = document.getElementById("editPhone").value.trim();
    users[userIndex].password = document.getElementById("editPassword").value;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(users[userIndex]));

    showPopup("✅ Perubahan berhasil disimpan.", () => {
      window.location.href = "dashboard.html";
    });
  });
});

// Hapus akun
document.getElementById("deleteAccountBtn").addEventListener("click", () => {
  showConfirmModal("⚠️ Hapus akun ini secara permanen?", () => {
    users.splice(userIndex, 1);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.removeItem("loggedInUser");

    showPopup("✅ Akun berhasil dihapus.", () => {
      window.location.href = "index.html";
    });
  });
});
