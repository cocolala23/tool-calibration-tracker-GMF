document.addEventListener("DOMContentLoaded", () => {
    
    // --- BAGIAN KODE NAVBAR MODERN ---
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("❗ Anda harus login terlebih dahulu.");
        window.location.href = "index.html";
        return; // Hentikan eksekusi jika tidak login
    } else {
        document.getElementById("loggedInUser").textContent = loggedInUser;
        const userAvatar = document.querySelector(".user-avatar");
        if(userAvatar) {
            userAvatar.textContent = loggedInUser.charAt(0).toUpperCase();
        }
    }

    const dropdownTrigger = document.getElementById("userDropdownTrigger");
    const dropdownContent = document.getElementById("userDropdownContent");

    if (dropdownTrigger) {
        dropdownTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    }

    window.onclick = function(event) {
        if (dropdownContent && dropdownContent.style.display === 'block') {
            dropdownContent.style.display = "none";
        }
    }

    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }
    // --- AKHIR BAGIAN KODE NAVBAR ---


    // --- BAGIAN LOGIKA HALAMAN PROFIL (TETAP SAMA) ---
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        // Tampilkan data user ke halaman
        document.getElementById("displayId").textContent = currentUser.id || "-";
        document.getElementById("displayUsername").textContent = currentUser.username || "-";
        document.getElementById("displayPhone").textContent = currentUser.phone || "-";
        document.getElementById("displayLevel").textContent = currentUser.level || "-";
    }

    // Tombol hapus akun
    document.getElementById("deleteAccountBtn").addEventListener("click", () => {
        document.getElementById("confirmModal").classList.remove("hidden");
    });

    document.getElementById("confirmYes").addEventListener("click", () => {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users = users.filter(user => user.username !== currentUser.username);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.removeItem("currentUser");
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "index.html";
    });

    document.getElementById("confirmNo").addEventListener("click", () => {
        document.getElementById("confirmModal").classList.add("hidden");
    });
});