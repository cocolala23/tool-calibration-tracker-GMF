// Fungsi untuk menghancurkan grafik lama
function destroyChart() {
    const chartCanvas = document.getElementById("grafikKalibrasi");
    if (chartCanvas && chartCanvas.chart) {
        chartCanvas.chart.destroy();
    }
}

// Event listener untuk storage (sinkronisasi antar tab)
window.addEventListener("storage", function(event) {
    if (event.key === "alatList") {
        inisialisasiDashboard(); // Refresh data jika ada perubahan dari tab lain
    }
});

// Inisialisasi dashboard saat DOM siap
window.addEventListener('DOMContentLoaded', inisialisasiDashboard);
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        inisialisasiDashboard();
    }
});

async function inisialisasiDashboard() {
    console.log("Memulai inisialisasi Dashboard...");
    try {
        const response = await fetch('http://localhost:3000/api/alat');
        const alatList = await response.json();

        // Simpan data ke localStorage
        localStorage.setItem("alatList", JSON.stringify(alatList));
        localStorage.setItem("lastUpdated", Date.now());

        // Hapus grafik lama
        destroyChart();

        // Render UI
        renderStatCards(alatList);
        renderGrafikKalibrasi(alatList);
        renderJadwalKalibrasi(alatList);
        renderStatusKalibrasi(alatList);

    } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
        const errorMsg = document.getElementById("error-message");
        if (errorMsg) {
            errorMsg.style.display = "block";
            errorMsg.textContent = "⚠️ Gagal memuat data dari server. Silakan coba lagi nanti.";
        }
    }
}

// Statistik ringkasan
function renderStatCards(alatList) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let prosesCount = 0, segeraCount = 0, lewatCount = 0;

    alatList.forEach((alat) => {
        if (alat.status === "Proses") {
            prosesCount++;
        } else if (alat.status === "-") {
            const dueDate = new Date(alat.next_due);
            const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
            if (diffDays < 0) lewatCount++;
            else if (diffDays <= 7) segeraCount++;
        }
    });

    document.getElementById("statTotalAlat").textContent = alatList.length;
    document.getElementById("statProses").textContent = prosesCount;
    document.getElementById("statSegeraJatuhTempo").textContent = segeraCount;
    document.getElementById("statLewatTenggat").textContent = lewatCount;
}

// Grafik kalibrasi per bulan
function renderGrafikKalibrasi(alatList) {
    const ctx = document.getElementById("grafikKalibrasi").getContext("2d");

    const labels = [];
    const data = [];
    const monthlyData = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        labels.push(`${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`);
        monthlyData[monthKey] = 0;
    }

    alatList.forEach((alat) => {
        if (alat.status === 'Selesai' && alat.calibration_end) {
            const selesaiDate = new Date(alat.calibration_end);
            const monthKey = `${selesaiDate.getFullYear()}-${selesaiDate.getMonth()}`;
            if (monthKey in monthlyData) {
                monthlyData[monthKey]++;
            }
        }
    });

    for (const key in monthlyData) {
        data.push(monthlyData[key]);
    }

    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Alat Selesai",
                data,
                backgroundColor: "#0077b6",
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    // Simpan chart instance
    document.getElementById("grafikKalibrasi").chart = chart;
}

// Tabel Jadwal Kalibrasi
function renderJadwalKalibrasi(alatList) {
    const table = document.querySelector("#jadwalKalibrasiTable tbody");
    if (!table) return;
    table.innerHTML = "";

    const today = new Date();
    const data = alatList.filter(alat => alat.status === "-")
                         .sort((a, b) => new Date(a.next_due) - new Date(b.next_due))
                         .slice(0, 5);

    data.forEach((item) => {
        const dueDate = new Date(item.next_due);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        let statusLabel = "", statusColor = "";

        if (diffDays < 0) {
            statusLabel = "Jatuh Tempo";
            statusColor = "#d62839";
        } else if (diffDays === 0) {
            statusLabel = "Hari Ini";
            statusColor = "#f9a825";
        } else if (diffDays <= 7) {
            statusLabel = "Segera";
            statusColor = "#f9a825";
        } else {
            statusLabel = "Aman";
            statusColor = "#00b4d8";
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.next_due}</td>
            <td><span class="status-label" style="background-color:${statusColor}">${statusLabel}</span></td>
        `;
        table.appendChild(row);
    });
}

// Tabel Status Kalibrasi
function renderStatusKalibrasi(alatList) {
    const table = document.querySelector("#statusKalibrasiTable tbody");
    if (!table) return;
    table.innerHTML = "";

    const today = new Date();
    const data = alatList.filter(alat => alat.status === "Proses").slice(0, 5);

    data.forEach((item) => {
        const selesai = item.calibration_end ? new Date(item.calibration_end) : null;
        const sisaHari = selesai ? Math.ceil((selesai - today) / (1000 * 60 * 60 * 24)) : null;

        let sisaWaktuLabel = selesai ? (sisaHari > 0 ? `⏳ ${sisaHari} hari lagi` : (sisaHari === 0 ? "Hari Ini" : "✅ Selesai")) : "-";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.calibration_end || "-"}</td>
            <td>${sisaWaktuLabel}</td>
        `;
        table.appendChild(row);
    });
}
