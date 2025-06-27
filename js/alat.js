if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "index.html";
  }
  
  function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  }
  
  const form = document.getElementById("alatForm");
  const tableBody = document.querySelector("#alatTable tbody");
  const totalAlatDisplay = document.getElementById("totalAlat");
  let alatList = JSON.parse(localStorage.getItem("alatList")) || [];
  
  function updateTotal() {
    totalAlatDisplay.textContent = alatList.length;
  }
  
  function tampilkanAlat() {
    tableBody.innerHTML = "";
    alatList.forEach((alat, index) => {
      const row = document.createElement("tr");
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
        <td><button onclick="hapusAlat(${index})">Hapus</button></td>
      `;
      tableBody.appendChild(row);
    });
    updateTotal();
  }
  
  function hapusAlat(index) {
    alatList.splice(index, 1);
    localStorage.setItem("alatList", JSON.stringify(alatList));
    tampilkanAlat();
  }
  
  form.addEventListener("submit", function (e) {
    e.preventDefault();
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
    alatList.push(alat);
    localStorage.setItem("alatList", JSON.stringify(alatList));
    tampilkanAlat();
    form.reset();
  });
  
  tampilkanAlat();
  