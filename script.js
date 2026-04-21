// ==========================
// NAVBAR TOGGLE
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('active');
        });
    }
});

// ==========================
// DATA + LOCAL STORAGE
// ==========================
let motors = JSON.parse(localStorage.getItem("motors")) || [];
let editIndex = -1;

motors = motors.map(m => {
    if (!m.id) {
        return { ...m, id: Date.now() + Math.random() };
    }
    return m;
});

localStorage.setItem("motors", JSON.stringify(motors));
// ==========================
// ELEMENT
// ==========================
const form = document.getElementById("formMotor");
const table = document.getElementById("motorTable");
const searchInput = document.getElementById("searchMotor");
const filterMerk = document.getElementById("filterMerk");
const btnTambah = document.getElementById("btnTambah");

if (btnTambah) {
    btnTambah.addEventListener("click", () => {
        editIndex = -1;
        form.reset();
        openModal();
    });
}

// ==========================
// VALIDASI
// ==========================
const validateForm = () => {
    const nama = document.getElementById("nama").value.trim();
    const nomor = document.getElementById("nomor").value.trim();
    const merk = document.getElementById("merk").value.trim();
    const tahun = document.getElementById("tahun").value;
    const harga = document.getElementById("harga").value;

    if (!nama || !nomor || !merk || !tahun || !harga) {
        alert("Semua field wajib diisi!");
        return false;
    }

    if (tahun < 2000 || tahun > 2026) {
        alert("Tahun tidak valid!");
        return false;
    }
    return { nama, nomor, merk, tahun, harga };
};

// ==========================
// RENDER TABLE
// ==========================
const renderTable = (data = motors) => {
    if (!table) return;

    table.innerHTML = data.map((m, i) => `
        <tr>
            <td>${m.nama}</td>
            <td>${m.nomor}</td>
            <td>${m.merk}</td>
            <td>${m.tahun}</td>
            <td>Rp ${Number(m.harga).toLocaleString()}</td>
            <td>${m.status}</td>
            <td>
                <div class="aksi-btn">
                    <button class="btn-edit" data-id="${m.id}">Edit</button>
                    <button class="btn-hapus" data-id="${m.id}">Hapus</button>
                </div>
            </td>
        </tr>
    `).join("");

    updateStats();
};

// ==========================
// SAVE LOCAL STORAGE
// ==========================
const saveData = () => {
    localStorage.setItem("motors", JSON.stringify(motors));
};

// ==========================
// TAMBAH / EDIT DATA
// ==========================
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = validateForm();
        if (!data) return;

        if (editIndex === -1) {
            motors.push({ id: Date.now(), ...data, status: "Tersedia" });
        } else {
            const status = document.getElementById("status").value;
            motors[editIndex] = {
                id: motors[editIndex].id,
                ...data,
                status: status || motors[editIndex].status 
            };
            editIndex = -1;
        }

        saveData();
        renderTable();
        form.reset();
        closeModal();
    });
}

// ==========================
// EVENT DELEGATION
// ==========================
if (table) {
    table.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        const index = motors.findIndex(m => m.id === id);

        if (e.target.classList.contains("btn-hapus")) {
            if (confirm("Yakin hapus data?")) {
                motors.splice(index, 1);
                saveData();
                renderTable();
            }
        }

        if (e.target.classList.contains("btn-edit")) {
            const m = motors[index];

            document.getElementById("nama").value = m.nama;
            document.getElementById("nomor").value = m.nomor;
            document.getElementById("merk").value = m.merk;
            document.getElementById("tahun").value = m.tahun;
            document.getElementById("harga").value = m.harga;
            document.getElementById("status").value = m.status;

            editIndex = index;
            openModal(true);
        }
    });
}

// ==========================
// FILTER MERK
// ==========================
const btnShowMotor = document.getElementById("btnShowMotor");

if (btnShowMotor) {
    btnShowMotor.addEventListener("click", () => {
        const merk = filterMerk.value;

        if (merk === "") {
            renderTable(motors);
            return;
        }

        const filtered = motors.filter(m =>
            m.merk.toLowerCase() === merk.toLowerCase()
        );

        renderTable(filtered);
    });
}
// ==========================
// SEARCH REAL-TIME
// ==========================
const searchForm = document.querySelector(".search-form");

if (searchForm) {
    searchInput.addEventListener("input", () => {
        const keyword = searchInput.value.toLowerCase();

        const filtered = motors.filter(m =>
            m.nama.toLowerCase().includes(keyword) ||
            m.nomor.toLowerCase().includes(keyword)
        );

        renderTable(filtered);
    });
}

// ==========================
// STATISTIK
// ==========================
const updateStats = () => {
    const data = JSON.parse(localStorage.getItem("motors")) || [];

    if (!document.getElementById("totalMotor")) return;

    const total = data.length;

    const tersedia = data.filter(m => m.status === "Tersedia").length;
    const disewa = data.filter(m => m.status === "Disewa").length;

    const totalNilai = data.reduce((acc, m) => acc + Number(m.harga), 0);

    // STATUS CHECKBOX
    let tampilTersedia = cbTersedia ? cbTersedia.checked : true;
    let tampilDisewa = cbDisewa ? cbDisewa.checked : true;

    if (!tampilTersedia && !tampilDisewa) {
        tampilTersedia = true;
        tampilDisewa = true;
    }

    document.getElementById("totalMotor").textContent = total;

    document.getElementById("motorTersedia").textContent =
        tampilTersedia ? tersedia : 0;

    document.getElementById("motorDisewa").textContent =
        tampilDisewa ? disewa : 0;

    document.getElementById("totalNilai").textContent =
        "Rp " + totalNilai.toLocaleString();

    document.getElementById("statusStok").textContent =
        tersedia < 5 ? "Stok Menipis" : "Aman";

    document.getElementById("meterTersedia").value =
        tampilTersedia ? tersedia : 0;

    document.getElementById("meterDisewa").value =
        tampilDisewa ? disewa : 0;

    document.getElementById("meterTersedia").max = total;
    document.getElementById("meterDisewa").max = total;
};

// ==========================
// MODAL
// ==========================
const openModal = (isEdit = false) => {
    document.getElementById("modalMotor").classList.add("active");

    const statusField = document.getElementById("status");
    if (statusField) {
        statusField.parentElement.style.display = isEdit ? "" : "none";
    }
};
const closeModal = () => {
    document.getElementById("modalMotor").classList.remove("active");
    if (form) form.reset();
    editIndex = -1;
};


// ==========================
// CKHECKBOX STATISTIK
// ==========================
const cbTersedia = document.getElementById("cbTersedia");
const cbDisewa = document.getElementById("cbDisewa");
if (cbTersedia) {
    cbTersedia.addEventListener("change", updateStats);
}

if (cbDisewa) {
    cbDisewa.addEventListener("change", updateStats);
}

// ==========================
// CLOSE MODAL
// ==========================
window.onclick = function (event) {
    const modal = document.getElementById("modalMotor");

    if (event.target === modal) {
        modal.classList.remove("active");
    }
}

// ==========================
// LOAD AWAL
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    renderTable();
    updateStats();
});