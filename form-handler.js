// Import fungsi yang kita butuhkan dari Firebase SDK (TANPA STORAGE)
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
    const currentUrl = window.location.href;
    alert("Anda harus login untuk mengakses halaman ini.");
    window.location.href = `login.html?redirect=${encodeURIComponent(
      currentUrl
    )}`;
  }
});
async function loadFormDetails() {
  layananId = new URLSearchParams(window.location.search).get("id");
  if (!layananId) {
    loadingIndicator.innerHTML = "<h2>Error: ID Layanan tidak ditemukan.</h2>";
    return;
  }
  try {
    const docRef = doc(db, "layanan", layananId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const layanan = docSnap.data();
      document.getElementById(
        "form-title"
      ).textContent = `Form Pengajuan: ${layanan.namaLayanan}`;
      let persyaratanHTML = "<p><strong>Persyaratan:</strong></p><ul>";
      layanan.persyaratan.forEach((item) => {
        persyaratanHTML += `<li>${item}</li>`;
      });
      persyaratanHTML += "</ul>";
      document.getElementById("persyaratan-info").innerHTML = persyaratanHTML;
      loadingIndicator.style.display = "none";
      mainContent.style.display = "block";
    } else {
      loadingIndicator.innerHTML = "<h2>Error: Layanan tidak ditemukan.</h2>";
    }
  } catch (error) {
    loadingIndicator.innerHTML = "<h2>Gagal memuat form.</h2>";
  }
}

// ### LOGIKA PENGIRIMAN FORM (CLOUDINARY) ###
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
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp: timestamp };

    const sigResponse = await fetch("/.netlify/functions/create-signature", {
      method: "POST",
      body: JSON.stringify({ params_to_sign: paramsToSign }),
    });
    const sigData = await sigResponse.json();
    const signature = sigData.signature;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", "576324551919849"); // GANTI JIKA BERBEDA
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    submitButton.textContent = "Mengunggah file...";

    const cloudName = "do1ba7gkn"; // GANTI JIKA BERBEDA
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadResponse.json();
    const fileUrl = uploadData.secure_url;

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
