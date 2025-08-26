// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  where,
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

// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("pengajuan-table-body");
  const filterJenisSurat = document.getElementById("filter-jenis-surat");

  // Satpam digital
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
        if (tableBody) {
          populateFilterDropdown();
          tampilkanPengajuan();
        }
      } else {
        window.location.href = "index.html";
      }
    } else {
      window.location.href = "login.html";
    }
  });

  if (filterJenisSurat) {
    filterJenisSurat.addEventListener("change", () => {
      tampilkanPengajuan(filterJenisSurat.value);
    });
  }

  const closeModalBtn = document.getElementById("close-modal-btn");
  const uploadForm = document.getElementById("upload-surat-form");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (uploadForm) uploadForm.addEventListener("submit", handleUploadSuratJadi);
});

async function populateFilterDropdown() {
  const filterSelect = document.getElementById("filter-jenis-surat");
  if (!filterSelect) return;
  try {
    const querySnapshot = await getDocs(collection(db, "layanan"));

    querySnapshot.forEach((doc) => {
      const layanan = doc.data();
      const jenisSuratValue = layanan.namaLayanan;

      const option = document.createElement("option");
      option.value = jenisSuratValue;
      option.textContent = layanan.namaLayanan;
      filterSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error mengisi filter:", error);
  }
}

// FUNGSI TAMPILKAN PENGAJUAN (DIPERBARUI DENGAN FILTER)
async function tampilkanPengajuan(filterValue = "semua") {
  const tableBody = document.getElementById("pengajuan-table-body");
  tableBody.innerHTML =
    '<tr><td colspan="7" style="text-align:center;">Memuat data...</td></tr>';

  try {
    let q;
    const baseQuery = collection(db, "pengajuanSurat");

    if (filterValue === "semua") {
      q = query(baseQuery, orderBy("tanggalPengajuan", "desc"));
    } else {
      // [FIX] Logika prefix "Surat: " dihapus. Sekarang mencari nilai yang sama persis.
      q = query(
        baseQuery,
        where("jenisSurat", "==", filterValue),
        orderBy("tanggalPengajuan", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;">Tidak ada pengajuan surat yang cocok.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;
      const tanggal = data.tanggalPengajuan
        .toDate()
        .toLocaleDateString("id-ID");
      let aksiAwalHTML = "";
      if (data.status === "Menunggu Persetujuan") {
        aksiAwalHTML = `<button class="action-btn btn-approve" data-id="${docId}">Setujui</button> <button class="action-btn btn-reject" data-id="${docId}">Tolak</button>`;
      }
      let aksiLanjutanHTML = "";
      if (data.fileUrl) {
        aksiLanjutanHTML += `<a href="${data.fileUrl}" target="_blank">Lihat Syarat</a><br>`;
      } else {
        aksiLanjutanHTML += `<span>(Tanpa File)</span><br>`;
      }
      if (data.status === "Disetujui") {
        aksiLanjutanHTML += `<button class="action-btn btn-approve btn-tandai-selesai" data-id="${docId}" style="margin-top:5px;">Tandai Selesai</button>`;
      }
      const row = `<tr><td>${tanggal}</td><td>${data.userEmail}</td><td>${data.jenisSurat}</td><td>${data.keperluan}</td><td>${data.status}</td><td>${aksiAwalHTML}</td><td>${aksiLanjutanHTML}</td></tr>`;
      tableBody.innerHTML += row;
    });
    addEventListenersToButtons();
  } catch (error) {
    console.error("Error mengambil data pengajuan: ", error);
    tableBody.innerHTML = '<tr><td colspan="7">Gagal memuat data.</td></tr>';
  }
}

// === FUNGSI-FUNGSI PEMBANTU (TIDAK BANYAK BERUBAH) ===
function addEventListenersToButtons() {
  document
    .querySelectorAll(".btn-approve:not(.btn-tandai-selesai)")
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        updateStatus(e.target.dataset.id, "Disetujui");
      });
    });
  document.querySelectorAll(".btn-reject").forEach((button) => {
    button.addEventListener("click", (e) => {
      updateStatus(e.target.dataset.id, "Ditolak");
    });
  });
  document.querySelectorAll(".btn-tandai-selesai").forEach((button) => {
    button.addEventListener("click", (e) => {
      openModal(e.target.dataset.id);
    });
  });
}

async function updateStatus(docId, newStatus) {
  try {
    const docRef = doc(db, "pengajuanSurat", docId);
    await updateDoc(docRef, { status: newStatus });
    alert(`Status berhasil diubah menjadi "${newStatus}"`);
    const currentFilter = document.getElementById("filter-jenis-surat").value;
    tampilkanPengajuan(currentFilter);
  } catch (error) {
    alert("Gagal mengubah status.");
  }
}

// --- Fungsi Modal (Tidak Berubah) ---
function openModal(docId) {
  document.getElementById("pengajuan-id-hidden").value = docId;
  document.getElementById("upload-surat-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("upload-surat-form").reset();
  document.getElementById("upload-status-modal").textContent = "";
  document.getElementById("upload-surat-modal").style.display = "none";
}

async function handleUploadSuratJadi(e) {
  e.preventDefault();
  const docId = document.getElementById("pengajuan-id-hidden").value;
  const file = document.getElementById("file-surat-jadi").files[0];
  const uploadFinalBtn = document.getElementById("upload-final-btn");
  const uploadStatusModal = document.getElementById("upload-status-modal");

  if (!file) {
    alert("Silakan pilih file surat yang sudah jadi.");
    return;
  }

  uploadFinalBtn.disabled = true;
  uploadFinalBtn.textContent = "Mengunggah...";
  uploadStatusModal.textContent = "";

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "yd99selh");

    const cloudName = "do1ba7gkn";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadResponse.json();
    if (uploadData.error) throw new Error(uploadData.error.message);

    const fileSuratJadiUrl = uploadData.secure_url;

    const docRef = doc(db, "pengajuanSurat", docId);
    await updateDoc(docRef, {
      status: "Selesai",
      fileSuratJadiUrl: fileSuratJadiUrl,
    });

    alert("Pengajuan berhasil diselesaikan!");
    closeModal();
    tampilkanPengajuan();
  } catch (error) {
    console.error("Error saat menyelesaikan pengajuan:", error);
    uploadStatusModal.textContent = `Gagal: ${error.message}`;
  } finally {
    uploadFinalBtn.disabled = false;
    uploadFinalBtn.textContent = "Unggah & Selesaikan";
  }
}
