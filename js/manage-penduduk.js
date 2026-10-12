import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBD4ypi0bq71tJfDdyqgdLL3A_RSye9Q7I",
  authDomain: "rw16cibabat-dbf87.firebaseapp.com",
  projectId: "rw16cibabat-dbf87",
  storageBucket: "rw16cibabat-dbf87.appspot.com",
  messagingSenderId: "744879659808",
  appId: "1:744879659808:web:9d91c4bd2068260e189545",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ambil elemen
const statistikForm = document.getElementById("statistik-form");
const kepalaKeluargaInput = document.getElementById("kepala-keluarga");
const kelompokUmurContainer = document.getElementById("kelompok-umur-container");
const statusMessage = document.getElementById("status-message");
const saveBtn = document.getElementById("save-btn");

const docRef = doc(db, "statistik", "data_penduduk");

// Satpam autentikasi admin
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        loadStatistik();
      } else {
        window.location.href = "../index.html";
      }
    } catch (err) {
      console.error("Gagal verifikasi role admin:", err);
      window.location.href = "../index.html";
    }
  } else {
    window.location.href = "../admin/login.html";
  }
});

// Standar 16 rentang umur piramida
const defaultAgeBrackets = [
  "0-4", "5-9", "10-14", "15-19",
  "20-24", "25-29", "30-34", "35-39",
  "40-44", "45-49", "50-54", "55-59",
  "60-64", "65-69", "70-74", "75+"
];

// Fungsi untuk memuat data dan membangun form secara dinamis
async function loadStatistik() {
  try {
    const docSnap = await getDoc(docRef);
    let kelompokUmur = {};

    if (docSnap.exists()) {
      const data = docSnap.data();
      kepalaKeluargaInput.value = data.kepalaKeluarga || 0;
      kelompokUmur = data.kelompokUmur || {};
    }

    kelompokUmurContainer.innerHTML = ""; // Kosongkan loading container

    // Urutkan kelompok umur jika ada di database, jika belum pakai bracket default
    const existingLabels = Object.keys(kelompokUmur);
    const sortedLabels = existingLabels.length > 0
      ? existingLabels.sort(
          (a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0])
        )
      : defaultAgeBrackets;

    sortedLabels.forEach((label) => {
      const groupData = kelompokUmur[label] || {};
      const pria = groupData.pria || 0;
      const wanita = groupData.wanita || 0;
      const subtotal = pria + wanita;

      const row = document.createElement("div");
      row.className = "age-group-row";
      row.setAttribute("data-label", label);
      row.innerHTML = `
        <div class="p-col col-age">
          <div class="age-pill">
            <i class="fas fa-user-tag"></i>
            <span class="age-range">${label}</span>
            <span class="age-suffix">Tahun</span>
          </div>
          <div class="mobile-subtotal-badge">
            <span class="subtotal-number">${subtotal.toLocaleString("id-ID")}</span> Jiwa
          </div>
          <label for="pria-${label}" class="sr-only">${label}</label>
        </div>

        <div class="p-col col-male">
          <div class="input-stat-wrapper male-border">
            <span class="input-prefix-icon male"><i class="fas fa-mars"></i></span>
            <input
              type="number"
              id="pria-${label}"
              class="stat-input input-male"
              value="${pria}"
              min="0"
              placeholder="0"
              aria-label="Jumlah Pria usia ${label}"
              required
            />
          </div>
        </div>

        <div class="p-col col-female">
          <div class="input-stat-wrapper female-border">
            <span class="input-prefix-icon female"><i class="fas fa-venus"></i></span>
            <input
              type="number"
              id="wanita-${label}"
              class="stat-input input-female"
              value="${wanita}"
              min="0"
              placeholder="0"
              aria-label="Jumlah Wanita usia ${label}"
              required
            />
          </div>
        </div>

        <div class="p-col col-subtotal">
          <div class="subtotal-badge" id="subtotal-${label}">
            <span class="subtotal-number">${subtotal.toLocaleString("id-ID")}</span>
            <span class="subtotal-label">Jiwa</span>
          </div>
        </div>
      `;
      kelompokUmurContainer.appendChild(row);
    });

    // Hitung total awal
    updateLiveTotals();

    // Pasang live listener perubahan input
    kelompokUmurContainer.addEventListener("input", updateLiveTotals);
    kepalaKeluargaInput.addEventListener("input", updateLiveTotals);

  } catch (error) {
    console.error("Error memuat statistik: ", error);
    kelompokUmurContainer.innerHTML = `
      <div class="pyramid-loading" style="color: #ef4444;">
        <i class="fas fa-triangle-exclamation"></i>
        <span>Gagal memuat data statistik dari server.</span>
      </div>
    `;
  }
}

// Fungsi live auto-calculate ringkasan data kependudukan
function updateLiveTotals() {
  const kk = Math.max(0, parseInt(kepalaKeluargaInput.value || 0, 10));
  let totalPria = 0;
  let totalWanita = 0;

  const rows = kelompokUmurContainer.querySelectorAll(".age-group-row");
  rows.forEach((row) => {
    const priaInput = row.querySelector(`input[id^="pria-"]`);
    const wanitaInput = row.querySelector(`input[id^="wanita-"]`);
    const priaVal = Math.max(0, parseInt(priaInput ? priaInput.value || 0 : 0, 10));
    const wanitaVal = Math.max(0, parseInt(wanitaInput ? wanitaInput.value || 0 : 0, 10));
    const rowSubtotal = priaVal + wanitaVal;

    totalPria += priaVal;
    totalWanita += wanitaVal;

    row.querySelectorAll(".subtotal-number").forEach((el) => {
      el.textContent = rowSubtotal.toLocaleString("id-ID");
    });
  });

  const totalPenduduk = totalPria + totalWanita;

  // Update ringkasan stat cards di bagian atas
  const elTotal = document.getElementById("summary-total");
  const elMale = document.getElementById("summary-male");
  const elFemale = document.getElementById("summary-female");
  const elKK = document.getElementById("summary-kk");

  if (elTotal) elTotal.textContent = totalPenduduk.toLocaleString("id-ID");
  if (elMale) elMale.textContent = totalPria.toLocaleString("id-ID");
  if (elFemale) elFemale.textContent = totalWanita.toLocaleString("id-ID");
  if (elKK) elKK.textContent = kk.toLocaleString("id-ID");

  // Update total footer di bawah grid
  const footMale = document.getElementById("foot-total-male");
  const footFemale = document.getElementById("foot-total-female");
  const footGrand = document.getElementById("foot-total-grand");

  if (footMale) footMale.textContent = totalPria.toLocaleString("id-ID");
  if (footFemale) footFemale.textContent = totalWanita.toLocaleString("id-ID");
  if (footGrand) footGrand.textContent = totalPenduduk.toLocaleString("id-ID");
}

// Menampilkan pesan status toast dengan styling modern
function showToast(message, type = "success") {
  if (!statusMessage) return;
  statusMessage.style.display = "inline-flex";
  statusMessage.className = `admin-status-toast toast-${type}`;
  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  statusMessage.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

  if (type === "success") {
    setTimeout(() => {
      statusMessage.style.display = "none";
    }, 5000);
  }
}

// Fungsi untuk menyimpan semua perubahan ke Firestore
statistikForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan Perubahan...`;

  try {
    const newKelompokUmur = {};
    const rows = kelompokUmurContainer.querySelectorAll(".age-group-row");
    rows.forEach((row) => {
      const label = row.getAttribute("data-label") || row.querySelector("label").textContent.trim();
      const pria = Math.max(0, parseInt(row.querySelector(`input[id^="pria-"]`)?.value || 0, 10));
      const wanita = Math.max(0, parseInt(row.querySelector(`input[id^="wanita-"]`)?.value || 0, 10));
      newKelompokUmur[label] = { pria, wanita };
    });

    const dataToSave = {
      kepalaKeluarga: Math.max(0, parseInt(kepalaKeluargaInput.value || 0, 10)),
      kelompokUmur: newKelompokUmur,
    };

    await setDoc(docRef, dataToSave);
    showToast("Data statistik kependudukan berhasil diperbarui dan disimpan!", "success");
  } catch (error) {
    console.error("Error menyimpan statistik: ", error);
    showToast("Gagal menyimpan data statistik: " + error.message, "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fas fa-save"></i> Simpan Semua Perubahan`;
  }
});
