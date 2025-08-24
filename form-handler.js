// Import fungsi yang kita butuhkan dari Firebase SDK
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

// Ambil elemen dari HTML
const mainContent = document.getElementById("main-content");
const loadingIndicator = document.getElementById("loading-indicator");
const formTitle = document.getElementById("form-title");
const persyaratanInfo = document.getElementById("persyaratan-info");
const suratForm = document.getElementById("surat-form");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-btn");

let currentUser = null;
let layananId = null;

// Fungsi untuk mendapatkan ID layanan dari URL
function getLayananIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Fungsi untuk memuat detail layanan dari Firestore dan membangun form
async function loadFormDetails() {
  layananId = getLayananIdFromUrl();
  if (!layananId) {
    loadingIndicator.innerHTML =
      "<h2>Error: ID Layanan tidak ditemukan di URL.</h2>";
    return;
  }

  try {
    const docRef = doc(db, "layanan", layananId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const layanan = docSnap.data();

      formTitle.textContent = `Form Pengajuan: ${layanan.namaLayanan}`;

      let persyaratanHTML =
        "<p><strong>Pastikan Anda menyiapkan persyaratan berikut:</strong></p><ul>";
      layanan.persyaratan.forEach((item) => {
        persyaratanHTML += `<li>${item}</li>`;
      });
      persyaratanHTML += "</ul>";
      persyaratanInfo.innerHTML = persyaratanHTML;

      loadingIndicator.style.display = "none";
      mainContent.style.display = "block";
    } else {
      loadingIndicator.innerHTML =
        "<h2>Error: Layanan tidak ditemukan di database.</h2>";
    }
  } catch (error) {
    console.error("Error mengambil detail layanan:", error);
    loadingIndicator.innerHTML = "<h2>Gagal memuat form.</h2>";
  }
}

// Satpam digital (ROUTE GUARD)
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

// ### LOGIKA PENGIRIMAN FORM (VERSI FINAL) ###
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
  submitButton.textContent = "Menyiapkan upload...";

  try {
    // 1. MINTA "PAKET UPLOAD" LENGKAP DARI NETLIFY FUNCTION
    const sigResponse = await fetch("/.netlify/functions/create-signature", {
      method: "POST",
    });
    const uploadData = await sigResponse.json();
    if (uploadData.error) throw new Error(uploadData.error);

    // 2. SIAPKAN FORM DATA DENGAN SEMUA INFO DARI "PAKET"
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", uploadData.api_key);
    formData.append("timestamp", uploadData.timestamp);
    formData.append("signature", uploadData.signature);
    formData.append("folder", uploadData.folder);
    formData.append("upload_preset", uploadPreset);

    submitButton.textContent = "Mengunggah file...";

    // 3. KIRIM KE CLOUDINARY
    const uploadUrl = `https://api.cloudinary.com/v1_1/${uploadData.cloud_name}/auto/upload`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });
    const finalData = await uploadResponse.json();
    if (finalData.error) throw new Error(finalData.error.message);

    const fileUrl = finalData.secure_url;

    // 4. SIMPAN KE FIRESTORE
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
