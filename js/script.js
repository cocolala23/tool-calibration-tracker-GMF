// Ambil elemen form dan tabel
const form = document.getElementById("alatForm");
const tableBody = document.querySelector("#alatTable tbody");

// Event saat form disubmit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Ambil semua nilai input
  const alat = {
    registration: document.getElementById("registration").value,
    description: document.getElementById("description").value,
    model: document.getElementById("model").value,
    pn: document.getElementById("pn").value,
    sn: document.getElementById("sn").value,
    unit: document.getElementById("unit").value,
    unitDesc: document.getElementById("unitDesc").value,
    location: document.getElementById("location").value,
    nextDue: document.getElementById("nextDue").value
  };

  // Tambahkan ke tabel
  tambahAlatKeTabel(alat);

  // Reset form
  form.reset();
});

// Fungsi untuk menambahkan baris ke tabel
function tambahAlatKeTabel(alat) {
  const row = document.createElement("tr");

  // Hitung selisih hari dari tanggal hari ini ke nextDue
  const daysLeft = hitungHariTersisa(alat.nextDue);

  // Tentukan status
  let statusText = "";
  let statusClass = "";

  if (daysLeft < 0) {
    statusText = `Terlambat ${Math.abs(daysLeft)} hari`;
    statusClass = "status-overdue";
  } else if (daysLeft <= 7) {
    statusText = `Kalibrasi dalam ${daysLeft} hari`;
    statusClass = "status-warning";
  } else {
    statusText = `Aman (${daysLeft} hari)`;
    statusClass = "status-normal";
  }

  row.innerHTML = `
    <td>${alat.registration}</td>
    <td>${alat.description}</td>
    <td>${alat.model}</td>
    <td>${alat.pn}</td>
    <td>${alat.sn}</td>
    <td>${alat.unit}</td>
    <td>${alat.unitDesc}</td>
    <td>${alat.location}</td>
    <td>${alat.nextDue}</td>
    <td><span class="${statusClass}">${statusText}</span></td>
    <td><button class="delete-btn">Hapus</button></td>
  `;

  // Event tombol hapus
  row.querySelector(".delete-btn").addEventListener("click", () => {
    row.remove();
  });

  tableBody.appendChild(row);
}

// Fungsi hitung hari tersisa ke tanggal kalibrasi
function hitungHariTersisa(nextDue) {
  const today = new Date();
  const dueDate = new Date(nextDue);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
