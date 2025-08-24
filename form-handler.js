// ... (semua import dan konfigurasi Firebase tetap sama) ...
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
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

// ... (kode elemen, satpam, dan fungsi loadFormDetails tetap sama) ...
const suratForm = document.getElementById("surat-form");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-btn");
let currentUser = null;
let layananId = null;

onAuthStateChanged(auth, (user) => {
  /* ... kode ini tidak berubah ... */
});
async function loadFormDetails() {
  /* ... kode ini tidak berubah ... */
}

// ### LOGIKA PENGIRIMAN FORM (DENGAN PERBAIKAN FINAL) ###
suratForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser || !layananId) return;

  const file = document.getElementById("file-persyaratan").files[0];
  const keperluan = document.getElementById("keperluan").value;

  if (!file) {
    alert("Silakan pilih file persyaratan.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Meminta izin upload...";

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // =============================================================
    // ===== PERUBAHAN KUNCI ADA DI SINI =====
    // =============================================================
    // Kita tidak perlu lagi mengirim resource_type di sini, karena endpoint URL sudah menanganinya
    const paramsToSign = { timestamp: timestamp };

    const sigResponse = await fetch("/.netlify/functions/create-signature", {
      method: "POST",
      body: JSON.stringify({ params_to_sign: paramsToSign }),
    });
    const sigData = await sigResponse.json();
    const signature = sigData.signature;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", "576324551919849"); // GANTI JIKA BEDA
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    submitButton.textContent = "Mengunggah file...";

    const cloudName = "do1ba7gkn"; // GANTI JIKA BEDA

    // =============================================================
    // ===== PERUBAHAN URL UPLOAD ADA DI SINI =====
    // =============================================================
    // Kita HAPUS '/image/upload' dan ganti dengan '/auto/upload'
    // Ini adalah endpoint cerdas yang akan menangani semua jenis file
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadResponse.json();

    if (uploadData.error) {
      throw new Error(uploadData.error.message);
    }
    const fileUrl = uploadData.secure_url;

    // SIMPAN KE FIRESTORE (tidak ada perubahan di sini)
    submitButton.textContent = "Menyimpan data...";
    const dataPengajuan = {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      layananId: layananId,
      jenisSurat: document
        .getElementById("form-title")
        .textContent.replace("Form Pengajuan: ", ""),
      keperluan: keperluan,
      status: "Menunggu Persetujuan",
      tanggalPengajuan: serverTimestamp(),
      fileUrl: fileUrl,
    };
    await addDoc(collection(db, "pengajuanSurat"), dataPengajuan);

    statusMessage.textContent =
      "Pengajuan berhasil! Anda akan diarahkan kembali...";
    statusMessage.style.color = "green";
    suratForm.reset();

    setTimeout(() => {
      window.location.href = "layanan.html";
    }, 2000);
  } catch (error) {
    console.error("Error saat proses pengajuan: ", error);
    statusMessage.textContent = `Gagal: ${error.message}`;
    statusMessage.style.color = "red";
    submitButton.disabled = false;
    submitButton.textContent = "Ajukan Surat";
  }
});
