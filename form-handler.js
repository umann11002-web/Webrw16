// ... (semua import Firebase tetap sama, kita masih butuh Firestore) ...
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
const mainContent = document.getElementById("main-content");
const loadingIndicator = document.getElementById("loading-indicator");
const suratForm = document.getElementById("surat-form");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-btn");
let currentUser = null;
let layananId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadFormDetails();
  } else {
    window.location.href = `login.html`;
  }
});
async function loadFormDetails() {
  /* ... kode ini tidak berubah ... */
}

// ### LOGIKA PENGIRIMAN FORM (DIUBAH TOTAL UNTUK CLOUDINARY) ###
suratForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser || !layananId) return;

  const file = document.getElementById("file-persyaratan").files[0];
  const keperluan = document.getElementById("keperluan").value;

  if (!file) {
    alert("Silakan pilih file persyaratan untuk diunggah.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Meminta izin upload...";
  statusMessage.textContent = "";

  try {
    // 1. MINTA "TIKET UPLOAD" DARI PETUGAS RAHASIA (NETLIFY FUNCTION)
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp: timestamp };

    const sigResponse = await fetch("/.netlify/functions/create-signature", {
      method: "POST",
      body: JSON.stringify({ params_to_sign: paramsToSign }),
    });
    const sigData = await sigResponse.json();
    const signature = sigData.signature;

    // 2. SIAPKAN FORM DATA UNTUK DIKIRIM KE CLOUDINARY
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", "576324551919849");
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    submitButton.textContent = "Mengunggah file...";

    // 3. KIRIM FILE LANGSUNG KE CLOUDINARY
    const cloudName = "do1ba7gkn";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadResponse.json();
    const fileUrl = uploadData.secure_url; // Ini link file-nya!

    // 4. SIMPAN DATA KE FIRESTORE (seperti sebelumnya)
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
      fileUrl: fileUrl, // Simpan link dari Cloudinary
    };
    await addDoc(collection(db, "pengajuanSurat"), dataPengajuan);

    statusMessage.textContent = "Pengajuan surat berhasil dikirim!";
    statusMessage.style.color = "green";
    suratForm.reset();
  } catch (error) {
    console.error("Error saat proses pengajuan: ", error);
    statusMessage.textContent = "Gagal mengirim pengajuan. Silakan coba lagi.";
    statusMessage.style.color = "red";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Ajukan Surat";
  }
});
