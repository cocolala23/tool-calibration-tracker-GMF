//navbar.js
// === DOMContentLoaded: Pastikan DOM siap ===
document.addEventListener("DOMContentLoaded", () => {
    // Ambil data pengguna dari localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const loggedInUserDisplay = document.getElementById("loggedInUser");
    const userAvatar = document.querySelector(".user-avatar");
    // Cek autentikasi
    if (!currentUser) {
        alert("❗ Anda harus login terlebih dahulu.");
        window.location.href = "../index.html";
        return;
    }
    // Update tampilan nama dan avatar
    if (loggedInUserDisplay) {
        loggedInUserDisplay.textContent = currentUser.username;
    }
    if (userAvatar) {
        const firstLetter = currentUser.username.charAt(0).toUpperCase();
        userAvatar.textContent = firstLetter;
    }
    // === Dropdown Profil Pengguna ===
    const dropdownTrigger = document.getElementById("userDropdownTrigger");
    const dropdownContent = document.getElementById("userDropdownContent");
    if (dropdownTrigger && dropdownContent) {
        // Toggle dropdown saat diklik
        dropdownTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            dropdownContent.classList.toggle("show");
        });
        // Tutup dropdown saat klik di luar
        document.addEventListener("click", () => {
            if (dropdownContent.classList.contains("show")) {
                dropdownContent.classList.remove("show");
            }
        });
        // Cegah penutupan dropdown saat klik di dalamnya
        dropdownContent.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }
    // === Tombol Logout ===
    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            // Hapus data sesi
            localStorage.clear();
            // Arahkan ke halaman login
            window.location.href = "../index.html";
        });
    }
    // === Hamburger Menu (Mobile) ===
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navLinks = document.getElementById("navLinks");
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }
});
